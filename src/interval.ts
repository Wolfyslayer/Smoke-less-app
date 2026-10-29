export type IntervalPlan = { enabled: boolean; minutes: number; lastCigaretteAt: string; notificationsEnabled: boolean; completedIntervals?: number; suggestedMinutes?: number; lastSuggestedAt?: string };
export const initialIntervalPlan: IntervalPlan = {enabled:false,minutes:60,lastCigaretteAt:new Date().toISOString(),notificationsEnabled:false};
export function intervalProgress(plan: IntervalPlan, now=Date.now()) {
 const elapsedMinutes=Math.max(0,Math.floor((now-new Date(plan.lastCigaretteAt).getTime())/60000));
 return {elapsedMinutes,remainingMinutes:Math.max(0,plan.minutes-elapsedMinutes),extraMinutes:Math.max(0,elapsedMinutes-plan.minutes)};
}
