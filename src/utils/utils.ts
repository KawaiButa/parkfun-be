import * as dayjs from "dayjs";
type KeysOf<T> = keyof T extends string ? `${keyof T}` : never;

export const isKeyOf = <T>(key: string): key is KeysOf<T> => {
  return true;
};

const getDuration = (startAt: number, endAt: number) => {
  if (startAt < endAt) return endAt - startAt;
  return 86400 - (startAt - endAt);
};
const timeToSeconds = (time: dayjs.Dayjs) => {
  const hours = time.hour();
  const minutes = time.minute();
  const seconds = time.second();
  return hours * 3600 + minutes * 60 + seconds;
};
const addSecondsToToday = (seconds: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  today.setSeconds(today.getSeconds() + seconds);
  return today;
};
export { addSecondsToToday, timeToSeconds, getDuration };
