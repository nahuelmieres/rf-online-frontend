import { LocalNotifications } from '@capacitor/local-notifications';

export async function ensureNotificationPerms() {
  try {
    const p = await LocalNotifications.checkPermissions();
    if (p.display !== 'granted') await LocalNotifications.requestPermissions();
  } catch (_) {
    // en web sin capacitor puede fallar silenciosamente
  }
}

export async function notifyNewMessage({ title = 'Nuevo mensaje', body }) {
  try {
    await ensureNotificationPerms();
    await LocalNotifications.schedule({
      notifications: [{ id: Date.now(), title, body }],
    });
  } catch (_) {
    // noop
  }
}