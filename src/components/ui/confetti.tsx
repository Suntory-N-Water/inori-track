'use client';

import { useEffect, useRef } from 'react';
import { useReward } from 'react-rewards';

// https://zenn.dev/taigakiyokawa/articles/20221201-react-rewards-interval
const useInterval = (callback: () => void) => {
  const callbackRef = useRef(() => {});

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const timerId = setInterval(() => callbackRef.current(), 1000);
    return () => clearInterval(timerId);
  }, []);
};

export default function Confetti() {
  const { reward: rewardLeft, isAnimating: isAnimatingLeft } = useReward(
    'rewardLeft',
    'confetti',
    {
      angle: 75,
      position: 'absolute',
      elementCount: 100,
    },
  );
  const { reward: rewardRight, isAnimating: isAnimatingRight } = useReward(
    'rewardRight',
    'confetti',
    {
      angle: 115,
      position: 'absolute',
      elementCount: 100,
    },
  );

  useInterval(() => {
    if (!isAnimatingRight || !isAnimatingLeft) {
      rewardLeft();
      rewardRight();
    }
  });

  return (
    <div
      className='fixed bottom-0 left-0 right-0 flex justify-between'
      role='img'
      aria-label='confetti'
    >
      <span id='rewardLeft' />
      <span id='rewardRight' />
    </div>
  );
}
