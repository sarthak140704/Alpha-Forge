import React, { useState, useEffect } from 'react';

interface TimeDisplay {
  hours: number;
  minutes: number;
  seconds: number;
}

const FlipClock: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeDisplay>({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Set target date to March 26th, 2025, 8:30 AM IST (which is 3:00 AM UTC)
    const targetDate = new Date('2025-03-26T03:00:00Z');
    
    const updateTime = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      // Convert total time to hours, minutes, seconds (including days)
      const totalHours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({ hours: totalHours, minutes, seconds });
    };
    
    // Update immediately when component mounts
    updateTime();
    
    // Update every second
    const timer = setInterval(updateTime, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const FlipUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center mx-2">
      <div className="bg-gray-800 text-white font-mono text-2xl sm:text-3xl font-bold rounded-md px-3 py-2 min-w-[3rem] text-center shadow-lg">
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-gray-300 text-sm mt-1 font-medium">{label}</div>
    </div>
  );

  return (
    <div className="flex items-center justify-center bg-black/50 backdrop-blur-lg rounded-xl p-4 shadow-xl border border-gray-800/50">
      {isExpired ? (
        <div className="text-white text-2xl font-bold py-2 px-4">Event in progress!</div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="text-white text-xl sm:text-2xl font-bold mb-2 sm:mb-0 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Auction starts in:
          </div>
          <div className="flex">
            <FlipUnit value={timeLeft.hours} label="HRS" />
            <FlipUnit value={timeLeft.minutes} label="MIN" />
            <FlipUnit value={timeLeft.seconds} label="SEC" />
          </div>
        </div>
      )}
    </div>
  );
};

export default FlipClock;