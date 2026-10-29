import * as Notifications from 'expo-notifications';
import { IntervalPlan } from './interval';
const PREFIX='smokeless-interval-';
const checkpoints=[0,15,30,60,120,180];
export async function clearIntervalNotifications(){
 const scheduled=await Notifications.getAllScheduledNotificationsAsync();
 await Promise.all(scheduled.filter(x=>x.content.data?.kind==='smokeless-interval').map(x=>Notifications.cancelScheduledNotificationAsync(x.identifier)));
}
export async function scheduleIntervalNotifications(plan:IntervalPlan){
 await clearIntervalNotifications();
 if(!plan.enabled || !plan.notificationsEnabled)return true;
 const permission=await Notifications.requestPermissionsAsync();
 if(!permission.granted)return false;
 const start=new Date(plan.lastCigaretteAt).getTime();
 for(const extra of checkpoints){
  const at=new Date(start+(plan.minutes+extra)*60000);
  if(at.getTime()<=Date.now())continue;
  const body=extra===0?'Du har nått ditt tidsmål. Fortsätt gärna vänta om du kan!':`Du har väntat ${extra} minuter längre än ditt mål. Bra jobbat! 💚`;
  await Notifications.scheduleNotificationAsync({identifier:PREFIX+extra,content:{title:'Smoke Less 💚',body,data:{kind:'smokeless-interval'}},trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:at}});
 }
 return true;
}
