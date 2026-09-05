import { motion } from 'framer-motion';
import { useMemo, useEffect, useState } from 'react';

interface StarFieldProps {
  count?: number;
}

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  angle: number;
  duration: number;
  delay: number;
  length: number;
}

export default function StarField({ count = 150 }: StarFieldProps) {
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);

  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
      opacity: Math.random() * 0.7 + 0.3,
      twinkleIntensity: Math.random() * 0.5 + 0.5,
    }));
  }, [count]);

  // Generate shooting stars periodically
  useEffect(() => {
    const createShootingStar = () => {
      const newStar: ShootingStar = {
        id: Date.now() + Math.random(),
        startX: Math.random() * 60 + 20,
        startY: Math.random() * 30,
        angle: Math.random() * 30 + 15, // 15-45 degrees
        duration: Math.random() * 1.5 + 1,
        delay: 0,
        length: Math.random() * 100 + 80,
      };
      setShootingStars(prev => [...prev, newStar]);
      
      // Remove after animation
      setTimeout(() => {
        setShootingStars(prev => prev.filter(s => s.id !== newStar.id));
      }, (newStar.duration + 1) * 1000);
    };

    // Initial shooting stars
    setTimeout(createShootingStar, 2000);
    setTimeout(createShootingStar, 4000);

    // Create shooting stars periodically
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        createShootingStar();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Twinkling Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(200,210,255,0.8) 50%, transparent 100%)',
            boxShadow: `
              0 0 ${star.size * 2}px rgba(255,255,255,0.9), 
              0 0 ${star.size * 4}px rgba(180,190,255,0.6),
              0 0 ${star.size * 6}px rgba(100,150,255,0.3)
            `,
          }}
          animate={{
            opacity: [star.opacity * 0.2, star.opacity, star.opacity * 0.2],
            scale: [0.8, 1.3 * star.twinkleIntensity, 0.8],
            filter: [
              'brightness(0.8)',
              `brightness(${1.2 + star.twinkleIntensity * 0.5})`,
              'brightness(0.8)'
            ],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Cross-shaped bright stars */}
      {stars.slice(0, 20).map((star) => (
        <motion.div
          key={`cross-${star.id}`}
          className="absolute"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size * 4,
            height: star.size * 4,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Horizontal ray */}
          <motion.div
            className="absolute top-1/2 left-0 w-full"
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
              transform: 'translateY(-50%)',
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scaleX: [0.5, 1, 0.5],
            }}
            transition={{
              duration: star.duration * 1.5,
              repeat: Infinity,
              delay: star.delay,
              ease: 'easeInOut',
            }}
          />
          {/* Vertical ray */}
          <motion.div
            className="absolute left-1/2 top-0 h-full"
            style={{
              width: '1px',
              background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
              transform: 'translateX(-50%)',
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scaleY: [0.5, 1, 0.5],
            }}
            transition={{
              duration: star.duration * 1.5,
              repeat: Infinity,
              delay: star.delay,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      ))}

      {/* Shooting Stars / Meteors */}
      {shootingStars.map((meteor) => (
        <motion.div
          key={meteor.id}
          className="absolute"
          style={{
            left: `${meteor.startX}%`,
            top: `${meteor.startY}%`,
            width: meteor.length,
            height: '2px',
            transformOrigin: 'left center',
            transform: `rotate(${meteor.angle}deg)`,
          }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            scaleX: [0, 1, 1, 1],
            x: [0, meteor.length * 2],
            y: [0, meteor.length * Math.tan(meteor.angle * Math.PI / 180) * 2],
          }}
          transition={{
            duration: meteor.duration,
            ease: 'easeOut',
          }}
        >
          {/* Meteor head (bright core) */}
          <motion.div
            className="absolute right-0 top-1/2"
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #ffffff 0%, #a5b4fc 50%, transparent 100%)',
              boxShadow: '0 0 10px #ffffff, 0 0 20px #a5b4fc, 0 0 40px #6366f1',
              transform: 'translate(50%, -50%)',
            }}
            animate={{
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
            }}
          />
          
          {/* Meteor tail (gradient trail) */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.3) 30%, rgba(165,180,252,0.6) 70%, #ffffff 100%)',
              borderRadius: '0 2px 2px 0',
              filter: 'blur(1px)',
            }}
          />
          
          {/* Secondary tail glow */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.2) 50%, rgba(255,255,255,0.4) 100%)',
              filter: 'blur(3px)',
              transform: 'scaleY(3)',
            }}
          />
        </motion.div>
      ))}

      {/* Ambient star dust particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={`dust-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: 1,
            height: 1,
            background: 'white',
            opacity: 0.3,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}