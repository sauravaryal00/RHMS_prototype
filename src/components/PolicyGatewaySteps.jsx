import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const PolicyGatewaySteps = ({ steps, currentStep, isValidating }) => {
  return (
    <div className="space-y-3">
      {steps.map((step, i) => {
        const isDone = i < currentStep;
        const isCurrent = i === currentStep && isValidating;
        const isFailed = step.status === 'fail';

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              isFailed ? 'bg-danger/10 border-danger/30 text-danger' :
              isDone ? 'bg-success/10 border-success/30 text-success' :
              isCurrent ? 'bg-primary/10 border-primary/30 text-primary' :
              'bg-white/5 border-white/5 text-muted'
            }`}
          >
            <div className="shrink-0">
              {isFailed ? <XCircle size={18} /> :
               isDone ? <CheckCircle2 size={18} /> :
               isCurrent ? <Loader2 size={18} className="animate-spin" /> :
               <div className="w-[18px] h-[18px] rounded-full border-2 border-current opacity-20" />}
            </div>
            <div className="flex-1 text-xs font-medium">
              Step {i + 1}: {step.label}
            </div>
            {(isDone || isFailed) && (
              <div className="text-[10px] font-mono opacity-70">
                {isFailed ? `ERR ${step.error || '403'}` : 'PASS'}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default PolicyGatewaySteps;
