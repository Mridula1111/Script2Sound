import React, { useEffect, useState } from 'react';

/**
 * Confetti animation component for celebration moments
 * Displays celebratory confetti when student completes milestones
 */
const ConfettiAnimation = ({ isActive, duration = 3000, intensity = 'medium' }) => {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (!isActive) return;

    // Generate confetti pieces
    const pieces = generateConfetti(intensity);
    setConfetti(pieces);

    // Clear confetti after animation
    const timeout = setTimeout(() => setConfetti([]), duration);

    return () => clearTimeout(timeout);
  }, [isActive, duration, intensity]);

  return (
    <>
      {confetti.map((piece, idx) => (
        <div
          key={idx}
          className="fixed pointer-events-none"
          style={{
            left: `${piece.left}%`,
            top: `-10px`,
            animation: `fall ${piece.duration}s linear forwards`,
            opacity: piece.opacity,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              fontSize: `${piece.size}px`,
              transform: `rotate(${piece.rotation}deg)`,
              animation: `spin ${piece.spinDuration}s linear infinite`,
            }}
          >
            {piece.emoji}
          </span>
        </div>
      ))}

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes spin {
          from {
            transform: rotateZ(0deg);
          }
          to {
            transform: rotateZ(360deg);
          }
        }
      `}</style>
    </>
  );
};

/**
 * Generate confetti pieces with random properties
 */
function generateConfetti(intensity = 'medium') {
  const count = {
    low: 15,
    medium: 30,
    high: 60,
  }[intensity] || 30;

  const emojis = ['🎉', '🎊', '⭐', '🌟', '✨', '🎈', '🏆', '👏', '💯', '🎁', '🚀', '💫'];

  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    duration: 2 + Math.random() * 2,
    spinDuration: 0.5 + Math.random() * 1,
    size: 20 + Math.random() * 30,
    rotation: Math.random() * 360,
    opacity: Math.random() * 0.7 + 0.3,
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
  }));
}

export default ConfettiAnimation;
