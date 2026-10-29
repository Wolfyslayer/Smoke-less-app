import * as Notifications from 'expo-notifications';
import {Platform} from 'react-native';
export async function setDailyReminder(enabled: boolean) {
 if(Platform.OS==='web')return false;
 const scheduled=await Notifications.getAllScheduledNotificationsAsync();
 await Promise.all(scheduled.filter(x=>x.content.data?.kind==='smokeless-daily').map(x=>Notifications.cancelScheduledNotificationAsync(x.identifier)));
 if (!enabled) return true;
 const permission = await Notifications.requestPermissionsAsync();
 if (!permission.granted) return false;
 await Notifications.scheduleNotificationAsync({
  content: { title: 'Smoke Less 💚', body: 'En dag i taget. Du kan hantera nästa röksug.', data:{kind:'smokeless-daily'} },
  trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 9, minute: 0 },
 });
 return true;
}
