import {sosIdeas} from '../data/sosIdeas';
export const PLAN_TRIGGERS=['Stress','Efter mat','Socialt','Vana','Annat'] as const;
export type PlanTrigger=typeof PLAN_TRIGGERS[number];
export type ActionPlans={version:1;plans:Partial<Record<PlanTrigger,string[]>>};
export const actionSteps=sosIdeas;
export const isPlanTrigger=(value:string):value is PlanTrigger=>(PLAN_TRIGGERS as readonly string[]).includes(value);
export function normalizeActionPlans(value:unknown):ActionPlans{
 const result:ActionPlans={version:1,plans:{}};
 if(!value||typeof value!=='object'||!('version' in value)||value.version!==1||!('plans' in value)||!value.plans||typeof value.plans!=='object')return result;
 for(const trigger of PLAN_TRIGGERS){const raw=(value.plans as Record<string,unknown>)[trigger];if(!Array.isArray(raw))continue;
  const steps=[...new Set(raw.filter((id):id is string=>typeof id==='string'&&actionSteps.some(step=>step.id===id)))].slice(0,3);
  if(steps.length)result.plans[trigger]=steps;
 }
 return result;
}
export function toggleActionStep(value:ActionPlans,trigger:PlanTrigger,id:string):ActionPlans{
 const next=normalizeActionPlans(value),current=next.plans[trigger]??[];
 if(!actionSteps.some(step=>step.id===id))return next;
 const steps=current.includes(id)?current.filter(step=>step!==id):current.length<3?[...current,id]:current;
 if(steps.length)next.plans[trigger]=steps;else delete next.plans[trigger];return next;
}
export function moveActionStep(value:ActionPlans,trigger:PlanTrigger,id:string,direction:-1|1):ActionPlans{
 const next=normalizeActionPlans(value),steps=next.plans[trigger]??[],index=steps.indexOf(id),destination=index+direction;
 if(index>=0&&destination>=0&&destination<steps.length)[steps[index],steps[destination]]=[steps[destination],steps[index]];
 return next;
}
export function rememberActionStrategy(value:ActionPlans,trigger:PlanTrigger,title:string):ActionPlans{
 const current=normalizeActionPlans(value),step=actionSteps.find(s=>s.title===title);
 return !step||current.plans[trigger]?.includes(step.id)?current:toggleActionStep(current,trigger,step.id);
}
export function clearActionPlan(value:ActionPlans,trigger:PlanTrigger):ActionPlans{
 const next=normalizeActionPlans(value);delete next.plans[trigger];return next;
}
