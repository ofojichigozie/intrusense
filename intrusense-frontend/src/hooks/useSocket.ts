import { useEffect } from 'react';
import notify, { requestNotificationPermission } from '@/utils/notify';
import { socket } from '@/services/socket';
import type { Reading } from '@/types';

interface UseSocketOptions {
  onReadingUpdate?: (reading: Reading) => void;
}

export function useSocket({ onReadingUpdate }: UseSocketOptions = {}) {
  useEffect(() => {
    void requestNotificationPermission();

    socket.connect();

    const handleIntrusion = (data: Reading) => {
      notify.intrusion(`Motion detected — ${data.distanceCm.toFixed(1)} cm away`);
    };

    if (onReadingUpdate) socket.on('reading_update', onReadingUpdate);
    socket.on('intrusion_alert', handleIntrusion);

    return () => {
      if (onReadingUpdate) socket.off('reading_update', onReadingUpdate);
      socket.off('intrusion_alert', handleIntrusion);
    };
  }, [onReadingUpdate]);
}
