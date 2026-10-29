import { IntervalPlan } from './interval';
// A suggestion is offered after three completed intervals. It never changes the target automatically.
// Suggestions are capped at 180 minutes and require an explicit opt-in.
export function registerInterval(plan: IntervalPlan, now = new Date()): IntervalPlan {
 const start = new Date(plan.lastCigaretteAt).getTime();
 const elapsed = Math.max(0,(now.getTime()-start)/60000);
 const completed = elapsed >= plan.minutes ? (plan.completedIntervals ?? 0)+1 : 0;
 const canSuggest = completed>=3 && plan.minutes<180 && !plan.suggestedMinutes;
 const suggestedMinutes = canSuggest ? Math.min(180,plan.minutes+15) : plan.suggestedMinutes;
 return {...plan,lastCigaretteAt:now.toISOString(),completedIntervals:canSuggest?0:completed,suggestedMinutes,history:[{at:now.toISOString(),elapsedMinutes:Math.floor(elapsed),targetMinutes:plan.minutes,metTarget:elapsed>=plan.minutes},...(plan.history??[])].slice(0,500)};
}
export function acceptSuggestion(plan:IntervalPlan):IntervalPlan {
 return {...plan,minutes:plan.suggestedMinutes ?? plan.minutes,suggestedMinutes:undefined,completedIntervals:0};
}
export function dismissSuggestion(plan:IntervalPlan):IntervalPlan {
 return {...plan,suggestedMinutes:undefined,completedIntervals:0,lastSuggestedAt:new Date().toISOString()};
}
