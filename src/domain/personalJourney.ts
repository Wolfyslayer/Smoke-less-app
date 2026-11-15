export const JOURNEY_PHASES=['preparing','reducing','quit-day','early','maintenance'] as const;
export type JourneyPhase=typeof JOURNEY_PHASES[number];
export type JourneyChoice={version:1;phase:JourneyPhase|null};
export const journeyLabels:Record<JourneyPhase,string>={preparing:'Förbereder mig',reducing:'Minskar gradvis','quit-day':'Min stoppdag',early:'Tidig rökfrihet',maintenance:'Långsiktigt stöd'};
export function normalizeJourney(value:unknown):JourneyChoice{
 const phase=value&&typeof value==='object'&&'version' in value&&value.version===1&&'phase' in value?value.phase:null;
 return {version:1,phase:typeof phase==='string'&&JOURNEY_PHASES.includes(phase as JourneyPhase)?phase as JourneyPhase:null};
}
export function journeySupport(phase:JourneyPhase|null,todayCount:number,checked:boolean){
 const checkin=checked?'Dagens registreringar är avstämda.':'Du kan stämma av dagen när du är klar med dagens registreringar.';
 if(phase===null)return {text:'Välj frivilligt vilket stöd som passar dig just nu. Valet ändrar inte din plan.',action:'plan' as const,checkin};
 if((phase==='early'||phase==='maintenance'||phase==='quit-day')&&todayCount>0)return {text:'En registrering tar inte bort tidigare framsteg. Ta en paus och välj vad som hjälper just nu.',action:'sos' as const,checkin};
 const tips:Record<JourneyPhase,{text:string;action:'plan'|'sos'|'checkin'}>={
  preparing:{text:'Välj ett litet nästa steg och se över en plan som känns möjlig för dig.',action:'plan'},
  reducing:{text:'Följ dagens riktvärde i din egen takt. Du behöver aldrig röka för att nå ett mål.',action:'plan'},
  'quit-day':{text:'Ta en stund i taget. SOS finns om du vill prova en paus eller en annan strategi.',action:'sos'},
  early:{text:'Fundera på vad som hjälpt hittills och stäm av dagen när du är klar.',action:'checkin'},
  maintenance:{text:'Behåll det som fungerar och förbered ett enkelt alternativ för svåra situationer.',action:'sos'},
 };
 return {...tips[phase],checkin};
}
