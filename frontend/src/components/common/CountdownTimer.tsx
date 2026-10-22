import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface CountdownTimerProps {
  secondsRemaining: number;
  onExpire?: () => void;
  isPaused?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  secondsRemaining,
  onExpire,
  isPaused = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(secondsRemaining);

  useEffect(() => {
    setTimeLeft(secondsRemaining);
  }, [secondsRemaining]);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isPaused, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft <= 5;
  const isWarning = timeLeft <= 15 && !isUrgent;

  let colorClasses = "bg-brand-50 text-brand-800 border-brand-300";
  if (isWarning) {
    colorClasses = "bg-amber-50 text-amber-800 border-amber-300";
  } else if (isUrgent) {
    colorClasses = "bg-rose-100 text-rose-800 border-rose-300 animate-pulse";
  }

  return (
    <div
      className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold shadow-sm transition-colors ${colorClasses}`}
    >
      {isUrgent ? (
        <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
      ) : (
        <Clock className="w-4 h-4" />
      )}
      <span>
        {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
      </span>
      {isUrgent && <span className="text-[10px] uppercase font-sans tracking-wide">Expiring!</span>}
    </div>
  );
};
