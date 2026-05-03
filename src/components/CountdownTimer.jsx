import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ targetDate, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) return setTimeLeft({ expired: true });

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return null;

  if (timeLeft.expired) {
    return (
      <div className={`flex items-center gap-1.5 text-neon-green ${className}`}>
        <Clock className="w-3.5 h-3.5 animate-pulse" />
        <span className="text-xs font-mono font-semibold">Live Now</span>
      </div>
    );
  }

  const { days, hours, minutes, seconds } = timeLeft;
  const isUrgent = days === 0 && hours === 0 && minutes < 30;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-neon-pink animate-pulse' : 'text-neon-cyan'}`} />
      <div className={`flex items-center gap-1 font-mono text-xs font-semibold ${isUrgent ? 'text-neon-pink' : 'text-neon-cyan'}`}>
        {days > 0 && <span>{days}d </span>}
        <span>{String(hours).padStart(2, '0')}:</span>
        <span>{String(minutes).padStart(2, '0')}:</span>
        <span>{String(seconds).padStart(2, '0')}</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
