/** Only explicitly approved daily aggregates may appear in a shared progress card. */
export type DailyShareProgress={todayCount:number;dailyGoal:number};
export type DailyShareCard={todayCount:number;dailyGoal:number;progressPercent:number;message:string};
const safeNonNegativeInteger=(value:number)=>Number.isFinite(value)?Math.max(0,Math.floor(value)):0;
export function buildDailyShareCard(input:DailyShareProgress):DailyShareCard{
 const todayCount=safeNonNegativeInteger(input.todayCount);
 const dailyGoal=safeNonNegativeInteger(input.dailyGoal);
 const progressPercent=dailyGoal>0?Math.min(100,Math.round(todayCount/dailyGoal*100)):0;
 const message=dailyGoal===0
  ?'Varje cigarettfri stund räknas. Fortsätt i din egen takt!'
  :todayCount<dailyGoal
   ?'Du ligger inom dagens gräns. Fortsätt i din egen takt.'
   :todayCount===dailyGoal
    ?'Du håller dagens gräns. Varje steg framåt räknas!'
    :'En dag i taget. Du kan fortsätta mot ditt mål utan att ge upp.';
 return {todayCount,dailyGoal,progressPercent,message};
}
