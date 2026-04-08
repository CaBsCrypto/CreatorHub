import { useState, useEffect } from 'react';

/**
 * Hook to animate a number counting up from 0 to a target value.
 * @param target The target number to count up to
 * @param duration Duration of the animation in milliseconds (default 1200)
 */
export function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }

    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}
