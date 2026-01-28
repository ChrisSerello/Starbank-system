import React, { useEffect, useState } from 'react';

export const BackgroundStars: React.FC = () => {
  const [stars, setStars] = useState<Array<{ id: number; style: React.CSSProperties }>>([]);
  
  useEffect(() => {
    const newStars = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${Math.random() * 3}px`,
        height: `${Math.random() * 3}px`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${Math.random() * 3 + 2}s`,
      },
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1]">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full animate-twinkle opacity-70"
          style={star.style}
        />
      ))}
    </div>
  );
};