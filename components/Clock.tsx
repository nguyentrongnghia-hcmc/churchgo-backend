
import React, { useState, useEffect } from 'react';
import { useI18n } from '../lib/i18n';

const Clock: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { lang } = useI18n();

  useEffect(() => {
    const timerId = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => {
      clearInterval(timerId);
    };
  }, []);

  const formatDateTime = (date: Date): string => {
    const time = date.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit', hour12: false });
    const dayOfWeek = new Intl.DateTimeFormat(lang, { weekday: 'long' }).format(date);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    // Capitalize first letter of day of week
    const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

    return `${time} ${capitalizedDayOfWeek}, ${day}/${month}/${year}`;
  };

  return (
    <div
      className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] text-black font-semibold whitespace-nowrap"
      style={{ textShadow: '0 0 3px white, 0 0 3px white' }}
      aria-live="polite"
      aria-atomic="true"
    >
      {formatDateTime(currentDate)}
    </div>
  );
};

export default Clock;