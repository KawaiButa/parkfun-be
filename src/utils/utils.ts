type KeysOf<T> = keyof T extends string ? `${keyof T}` : never;

export const isKeyOf = <T>(key: string): key is KeysOf<T> => {
  return true;
};

export const addSecondsToToday = (seconds: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  today.setSeconds(today.getSeconds() + seconds);
  return today;
};
