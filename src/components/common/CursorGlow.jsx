import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export const CursorGlow = () => {
  const [visible, setVisible] = useState(false);

  const springConfig = { damping: 28, stiffness: 220, mass: 0.5 };
  const cursorX = useSpring(-200, springConfig);
  const cursorY = useSpring(-200, springConfig);

  useEffect(() => {
    // Only enable on desktop pointer devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY, visible]);

  if (!visible) return null;

  return (
    <motion.div
      style={{
        x: cursorX,
        y: cursorY,
        translateX: '-50%',
        translateY: '-50%'
      }}
      className="fixed top-0 left-0 w-[420px] h-[420px] rounded-full pointer-events-none z-0 mix-blend-screen opacity-20"
    >
      <div className="w-full h-full rounded-full bg-radial from-[#E5A93C]/40 via-[#E5A93C]/10 to-transparent blur-[60px]" />
    </motion.div>
  );
};
