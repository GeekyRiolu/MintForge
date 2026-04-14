import moment from 'moment';
import { useEffect, useState } from 'react';

export function useGetCurrentDate() {
  const [currentTimestamp, setCurrentTimestamp] = useState(moment());
  const now = moment();

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTimestamp(now);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [now]);

  return currentTimestamp;
}
