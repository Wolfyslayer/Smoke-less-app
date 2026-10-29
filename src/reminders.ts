import * as Notifications from 'expo-notifications';
import {Platform} from 'react-native';
export async function setDailyReminder(enabled: boolean) {
 if(Platform.OS==='web')return false;
 await Notifications.cancelAllScheduledNotificationsAsync();
 if (!enabled) return true;
 const permission = await Notifications.requestPermissionsAsync();
 if (!permission.granted) return false;
 await Notifications.scheduleNotificationAsync({
  content: { title: 'Smoke Less 💚', body: 'En dag i taget. Du kan hantera nästa röksug.' },
  trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 9, minute: 0 },
 });
 return true;
}
