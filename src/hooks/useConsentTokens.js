import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';

export const useConsentTokens = (patientId = null) => {
  const [tokens, setTokens] = useState([]);
  const [requests, setRequests] = useState([]);
  const [logs, setLogs] = useState([]);
  const [optimisticLocks, setOptimisticLocks] = useState({});

  const isHighRiskReq = (req) => {
    if (!req) return false;
    const purp = (req.purpose || '').toLowerCase();
    const scope = (req.scope || []).join(',').toLowerCase();
    return purp.includes('emergency') || purp.includes('symptom') || purp.includes('review') ||
           scope.includes('heart') || scope.includes('blood') || scope.includes('vitals') || scope.includes('oxygen');
  };

  const fetchAll = useCallback(async () => {
    if (!supabase) return;
    try {
      // 1. Tokens
      let { data: tD } = await supabase.from('consent_tokens').select('*, access_requests(*)').order('issued_at', { ascending: false });
      if (patientId && tD) tD = tD.filter(t => t.patient_id?.toLowerCase() === patientId.toLowerCase());
      if (tD) setTokens(tD.map(t => ({ ...t, status: t.revoked ? 'revoked' : 'active' })));

      // 2. Requests
      let { data: rD } = await supabase.from('access_requests').select('*').in('status', ['pending', 'pending_caregiver']).order('created_at', { ascending: false });
      if (patientId && rD) rD = rD.filter(r => r.patient_id?.toLowerCase() === patientId.toLowerCase());
      if (rD) {
        const now = Date.now();
        const activeLocks = { ...optimisticLocks };
        Object.keys(activeLocks).forEach(id => { if (now - activeLocks[id].timestamp > 15000) delete activeLocks[id]; });
        setRequests(rD.map(req => activeLocks[req.id] ? { ...req, status: activeLocks[req.id].status } : req));
      }

      // 3. Logs (Fetch and filter carefully)
      let { data: lD } = await supabase.from('audit_logs').select('*').order('id', { ascending: false }).limit(40);
      if (patientId && lD) {
        const pIdTrim = patientId.trim().toLowerCase();
        lD = lD.filter(l => (l.patient_id || '').trim().toLowerCase() === pIdTrim);
      }
      if (lD) setLogs(lD);
    } catch (e) { console.error('RHMS_SYNC_ERROR:', e); }
  }, [patientId, optimisticLocks]);

  const logEvent = async (event_type, pid, rid, role, decision, purpose, scope, latency_data = {}) => {
    if (!supabase) return;
    try {
      const { data: logsData } = await supabase.from('audit_logs').select('entry_hash').order('id', { ascending: false }).limit(1);
      const prevHash = (logsData && logsData.length > 0) ? logsData[0].entry_hash : '0000000000000000';
      const entryHash = Math.random().toString(36).substring(2, 15);
      
      const payload = {
        event_type, patient_id: pid, requester_id: rid, requester_role: role,
        decision, purpose, scope, prev_hash: prevHash, entry_hash: entryHash,
        timestamp: new Date().toISOString(),
        ...latency_data
      };

      // OPTIMISTIC UPDATE: Inject log locally immediately for 'Zero Latency' feel
      setLogs(prev => [payload, ...prev].slice(0, 30));

      const { error } = await supabase.from('audit_logs').insert([payload]);
      if (error) {
        // Fallback for missing columns
        if (error.code === '42703') { 
          const { patient_latency_ms, caregiver_latency_ms, total_latency_ms, ...safe } = payload;
          await supabase.from('audit_logs').insert([safe]);
        }
      }
      fetchAll(); 
    } catch (e) { console.error('RHMS_LOG_EXCEPTION:', e); }
  };

  useEffect(() => {
    if (!supabase) return;
    fetchAll();
    const interval = setInterval(fetchAll, 3000); // Polling as safety backup
    const channel = supabase.channel('master-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'access_requests' }, () => fetchAll())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, () => fetchAll())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'consent_tokens' }, () => fetchAll())
      .subscribe();
    return () => { clearInterval(interval); supabase.removeChannel(channel); };
  }, [fetchAll]);

  const requestAccess = async (pid, cid, name, role, purpose, scope, duration) => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('access_requests').insert([{
      patient_id: pid, clinician_id: cid, clinician_name: name, clinician_role: role,
      purpose, scope, duration_minutes: duration, status: 'pending'
    }]).select();
    if (!error && data) {
      await logEvent('ACCESS_REQUEST', pid, cid, role, 'pending', purpose, scope);
      return data[0];
    }
    return null;
  };

  const approveAsPatient = async (requestId) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    const isHR = isHighRiskReq(req);
    const target = isHR ? 'pending_caregiver' : 'approved';
    const lat = Date.now() - new Date(req.created_at).getTime();

    setOptimisticLocks(prev => ({ ...prev, [requestId]: { status: target, timestamp: Date.now() } }));
    const { error } = await supabase.from('access_requests').update({ status: target }).eq('id', requestId);
    if (!error) {
      await logEvent('PATIENT_APPROVAL', req.patient_id, 'patient-42', 'patient', isHR ? 'pending_co_approval' : 'allow', req.purpose, req.scope, {
        patient_latency_ms: lat, total_latency_ms: lat
      });
      if (target === 'approved') await issueToken(req, lat);
      fetchAll();
    }
  };

  const approveAsCaregiver = async (requestId) => {
    let req = requests.find(r => r.id === requestId);
    if (!req) {
      const { data } = await supabase.from('access_requests').select('*').eq('id', requestId).single();
      req = data;
    }
    if (!req) return;
    const now = Date.now();
    const total_lat = now - new Date(req.created_at).getTime();

    setOptimisticLocks(prev => ({ ...prev, [requestId]: { status: 'approved', timestamp: now } }));
    const { error } = await supabase.from('access_requests').update({ status: 'approved' }).eq('id', requestId);
    if (!error) {
      await logEvent('CAREGIVER_APPROVAL', req.patient_id, 'caregiver-001', 'caregiver', 'allow', req.purpose, req.scope, {
        caregiver_latency_ms: total_lat * 0.4, total_latency_ms: total_lat
      });
      await issueToken(req, total_lat);
    }
  };

  const issueToken = async (req, total_lat = null) => {
    const exp = new Date(Date.now() + req.duration_minutes * 60 * 1000).toISOString();
    if (supabase) {
      await supabase.from('consent_tokens').insert([{
        token_id: `tok_${Math.random().toString(36).substr(2, 9)}`,
        patient_id: req.patient_id, clinician_id: req.clinician_id, clinician_role: req.clinician_role,
        purpose: req.purpose, scope: req.scope, issued_at: new Date().toISOString(),
        expires_at: exp, revoked: false, signature: 'sig_mock', request_id: req.id
      }]);
      await logEvent('TOKEN_ISSUED', req.patient_id, 'SYSTEM', 'security_manager', 'issued', req.purpose, req.scope, { total_latency_ms: total_lat });
    }
  };

  const denyRequest = async (requestId) => {
    const req = requests.find(r => r.id === requestId);
    if (!req || !supabase) return;
    await supabase.from('access_requests').update({ status: 'rejected' }).eq('id', requestId);
    await logEvent('REQUEST_DENIED', req.patient_id, 'patient-42', 'patient', 'deny', req.purpose, req.scope);
  };

  const revokeToken = async (tokenId) => {
    if (supabase) {
      await supabase.from('consent_tokens').update({ revoked: true }).eq('token_id', tokenId);
      fetchAll();
    }
  };

  return { tokens, requests, logs, requestAccess, approveAsPatient, approveAsCaregiver, denyRequest, revokeToken };
};
