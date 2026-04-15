const CONFETTI_CELEBRATED_VALUE = '1';

const getLocalDateKey = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getConfettiCycleKey = (userId: string, date: Date = new Date()): string => {
  return `hasanat-confetti-cycle:${userId}:${getLocalDateKey(date)}`;
};

export interface CelebrationStorage {
  getFlag: (key: string) => boolean;
  setFlag: (key: string) => void;
  clearFlag: (key: string) => void;
}

export const createCelebrationStorage = (): CelebrationStorage => {
  const fallbackStore: Record<string, string> = {};

  const getFlag = (key: string): boolean => {
    try {
      return localStorage.getItem(key) === CONFETTI_CELEBRATED_VALUE;
    } catch {
      return fallbackStore[key] === CONFETTI_CELEBRATED_VALUE;
    }
  };

  const setFlag = (key: string): void => {
    try {
      localStorage.setItem(key, CONFETTI_CELEBRATED_VALUE);
    } catch {
      fallbackStore[key] = CONFETTI_CELEBRATED_VALUE;
    }
  };

  const clearFlag = (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      delete fallbackStore[key];
    }
  };

  return { getFlag, setFlag, clearFlag };
};
