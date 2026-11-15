import {ReminderError,normalizeReminders,reminderDefaults,reminderIds,reminderRequests,type ReminderSettings} from './domain/reminders';
type Storage={getItem:(key:string)=>Promise<string|null>;setItem:(key:string,value:string)=>Promise<unknown>;removeItem:(key:string)=>Promise<unknown>};
type Notifications={permission:()=>Promise<boolean>;cancel:(id:string)=>Promise<unknown>;scheduled:()=>Promise<string[]>;schedule:(request:ReturnType<typeof reminderRequests>[number])=>Promise<unknown>};
const key='smokeless:reminders:v2';
export function createReminderService(storage:Storage,notifications:Notifications){
 let pending:Promise<unknown>=Promise.resolve();
 const serial=<T>(action:()=>Promise<T>)=>{const result=pending.then(action,action);pending=result.catch(()=>{});return result;};
 const cancel=async()=>{
  const old=await storage.getItem('smokeless:reminder-id');
  const results=await Promise.allSettled([...new Set([...reminderIds,...(old?[old]:[])])].map(id=>notifications.cancel(id)));
  if(results.some(r=>r.status==='rejected'))throw new ReminderError('Kunde inte stänga av alla påminnelser. Försök igen eller stäng av notiser i telefonens inställningar.');
  await storage.removeItem('smokeless:reminder-id');
 };
 return {
  read:()=>serial(async()=>{
   const raw=await storage.getItem(key);let settings:ReminderSettings;
   if(raw){try{settings=normalizeReminders(JSON.parse(raw));}catch{await cancel();throw new ReminderError('Inställningarna kunde inte läsas. Stäng av alla och välj på nytt.');}}
   else{
    const [opt,h,m,f]=await Promise.all(['preference','hour','minute','frequency'].map(s=>storage.getItem('smokeless:reminder-'+s)));
    settings=normalizeReminders({...reminderDefaults,checkin:opt==='true',hour:h===null?19:Number(h),minute:m===null?0:Number(m),frequency:f});
    // Legacy messages may reveal the plan. Stop them; reactivation is explicit.
    await cancel();await storage.setItem(key,JSON.stringify(settings));
   }
   const scheduled=await notifications.scheduled();
   return {settings,active:reminderIds.filter(id=>scheduled.includes(id)).length};
  }),
  apply:(settings:ReminderSettings)=>serial(async()=>{
   const requests=reminderRequests(settings);
   await cancel();
   await storage.setItem(key,JSON.stringify(settings));
   if(!requests.length)return;
   if(!await notifications.permission())throw new ReminderError('Notisbehörighet saknas. Inga påminnelser aktiverades.');
   try{for(const request of requests)await notifications.schedule(request);}
   catch{await cancel();throw new ReminderError('Kunde inte schemalägga påminnelser. Inga nya påminnelser är aktiva. Försök igen.');}
  }),
  disable:()=>serial(async()=>{await cancel();await storage.setItem(key,JSON.stringify(reminderDefaults));}),
 };
}
