import { toast } from 'sonner';

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  if (Notification.permission === 'denied') {
    console.warn(
      '[IntruSense] Browser notifications are blocked. Enable them in your browser settings to receive intrusion alerts.',
    );
  }
}

const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast.info(message),
  intrusion: (body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('\u{1F6A8} IntruSense Alert', {
        body,
        icon: '/shield.svg',
        tag: 'intrusion-alert',
      });
    }
  },
};

export default notify;
