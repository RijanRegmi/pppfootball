'use client';

import { useEffect, useState } from 'react';
import { useSpring } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  formatAsLocale?: boolean;
}

export default function AnimatedNumber({ value, formatAsLocale = true }: AnimatedNumberProps) {
  const spring = useSpring(0, { stiffness: 80, damping: 18 });
  const [displayVal, setDisplayVal] = useState(value);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    return spring.on('change', (latest) => {
      setDisplayVal(Math.round(latest));
    });
  }, [spring]);

  return (
    <span>
      {formatAsLocale ? displayVal.toLocaleString() : displayVal}
    </span>
  );
}
