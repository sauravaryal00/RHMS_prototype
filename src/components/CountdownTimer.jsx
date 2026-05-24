import React, { useState, useEffect, useRef } from 'react';

const CountdownTimer = ({ expiryDate, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState('');
  // Guard: only fire onExpire AFTER the timer has been ticking (not on first mount).
  // Without this guard, already-expired tokens would instantly call revokeToken on mount,
  // wiping out all tokens from the patient dashboard the moment the page loads.
  const hasStartedRef = useRef(false);

  useEffect(() => {
    hasStartedRef.current = false; // reset whenever expiryDate changes

    const calculateTimeLeft = () => {
      const difference = new Date(expiryDate) - new Date();

      if (difference <= 0) {
        setTimeLeft('EXPIRED');
        // Only call onExpire if the timer was already running (not on the very first check).
        if (onExpire && hasStartedRef.current) onExpire();
        return;
      }

      const hours = Math.floor(difference / 1000 / 60 / 60);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    calculateTimeLeft(); // First check (no onExpire here)
    hasStartedRef.current = true; // From this point, onExpire is allowed to fire

    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [expiryDate]);

  return <span>{timeLeft}</span>;
};

export default CountdownTimer;
