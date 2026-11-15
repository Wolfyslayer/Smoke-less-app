export const GUIDANCE_IDS=['register','sos','plan','stats'] as const;
export type GuidanceId=typeof GUIDANCE_IDS[number];
export type GuidancePreferences={version:1;dismissed:GuidanceId[]};
export function normalizeGuidance(raw:unknown):GuidancePreferences{
 const value=raw&&typeof raw==='object'?raw as Partial<GuidancePreferences>:{};
 return {version:1,dismissed:value.version===1&&Array.isArray(value.dismissed)?[...new Set(value.dismissed.filter((id):id is GuidanceId=>GUIDANCE_IDS.includes(id)))]:[]};
}
export const guidanceText:Record<GuidanceId,{title:string;text:string}>={
 register:{title:'Registrera första gången',text:'Tryck Registrera när du har rökt. Känsla och situation är frivilliga. En felaktig post kan tas bort i loggen. Dagens avstämning gör du när alla cigaretter är registrerade.'},
 sos:{title:'Hitta stöd i SOS',text:'Pröva en övning eller välj ett tips. Du bestämmer om du vill spara röksuget efteråt. Att öppna SOS registrerar ingen cigarett och ändrar inte din plan.'},
 plan:{title:'Förstå din plan',text:'Dagsmålet är en planerad övre gräns, inte uppmätt konsumtion. Du kan ändra takten eller stoppdatumet senare. Tidigare registreringar finns kvar.'},
 stats:{title:'Läs din statistik',text:'Statistiken bygger på det du registrerat. Ingen registrering betyder inte säkert rökfritt. Bekräfta dagens registreringar på startsidan för att göra underlaget tydligare.'},
};
