import { useEffect, useMemo, useState } from 'react';

export function useServerClock(serverTime?: string): Date {
  const offsetMs = useMemo(
    () => (serverTime ? new Date(serverTime).getTime() - Date.now() : 0),
    [serverTime],
  );
  const [deviceNow, setDeviceNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setDeviceNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return new Date(deviceNow + offsetMs);
}
