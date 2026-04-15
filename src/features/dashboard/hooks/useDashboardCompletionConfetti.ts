import { useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  createCelebrationStorage,
  getConfettiCycleKey,
} from '@/features/dashboard/utils/confettiCycleStorage';

const launchDashboardConfetti = (): void => {
  void confetti({
    particleCount: 120,
    spread: 90,
    startVelocity: 45,
    origin: { y: 0.65 },
    scalar: 0.95,
  });

  window.setTimeout(() => {
    void confetti({
      particleCount: 70,
      spread: 70,
      startVelocity: 35,
      origin: { y: 0.7 },
      scalar: 0.85,
    });
  }, 240);
};

export const useDashboardCompletionConfetti = (
  allTodayCompleted: boolean,
  userId?: string,
): void => {
  const previousAllTodayCompleted = useRef<boolean | null>(null);
  const storageRef = useRef(createCelebrationStorage());
  const confettiCycleKey = useMemo(() => {
    if (!userId) {
      return null;
    }
    return getConfettiCycleKey(userId);
  }, [userId]);

  useEffect(() => {
    if (previousAllTodayCompleted.current === null) {
      previousAllTodayCompleted.current = allTodayCompleted;
      return;
    }

    const wasComplete = previousAllTodayCompleted.current === true;
    const becameComplete = previousAllTodayCompleted.current === false && allTodayCompleted;
    previousAllTodayCompleted.current = allTodayCompleted;

    if (!confettiCycleKey) {
      return;
    }

    if (!allTodayCompleted && wasComplete) {
      storageRef.current.clearFlag(confettiCycleKey);
      return;
    }

    if (!becameComplete) {
      return;
    }

    if (storageRef.current.getFlag(confettiCycleKey)) {
      return;
    }

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    launchDashboardConfetti();
    storageRef.current.setFlag(confettiCycleKey);
  }, [allTodayCompleted, confettiCycleKey]);
};
