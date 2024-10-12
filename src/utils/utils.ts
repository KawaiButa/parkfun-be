type KeysOf<T> = keyof T extends string ? `${keyof T}` : never;

export const isKeyOf = <T>(key: string): key is KeysOf<T> => {
  return true;
};
