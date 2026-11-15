export const supportSources = {
 stop: {title:'1177 – Hjälp att sluta röka',url:'https://www.1177.se/sluta-roka'},
 medicines: {title:'1177 – Läkemedel för att sluta röka',url:'https://www.1177.se/undersokning-behandling/behandling-med-lakemedel/lakemedel-utifran-diagnos/lakemedel-mot-rokning/'},
 pregnancy: {title:'1177 – Nikotin och graviditet',url:'https://www.1177.se/stockholm/barn--gravid/graviditet/livsstil-och-halsa-under-graviditeten/nikotin-och-graviditet/'},
 contact: {title:'Sluta-röka-linjen – kontakt',url:'https://www.slutarokalinjen.se/ta-kontakt/'},
} as const;
export const supportCheckedAt='2026-11-15';
export const supportTopics=['Stöd i vardagen','Läkemedel','Kontakt med vården'] as const;
export type SupportTopic=typeof supportTopics[number];
type SourceId=keyof typeof supportSources;
type SupportCard={title:string;text:string;sources:readonly SourceId[]};
export const supportCards:Record<SupportTopic,readonly SupportCard[]>={
 'Stöd i vardagen':[
  {title:'Vanor och nikotin',text:'Röksug kan höra ihop med både nikotinberoende och invanda situationer. Prova en annan rutin vid pausen eller efter maten. Hur abstinens känns och hur länge den varar varierar.',sources:['stop']},
  {title:'Ta hjälp på ditt sätt',text:'Samtalsstöd kan hjälpa dig att planera och hantera svåra situationer. Du kan få stöd även om du inte har bestämt ett stoppdatum.',sources:['stop','contact']},
  {title:'När dagen blir svår',text:'Du kan fortsätta från där du är. Fundera på vilken situation som blev svår och vilket stöd du vill pröva nästa gång.',sources:['stop']},
 ],
 'Läkemedel':[
  {title:'Generell information',text:'Nikotinläkemedel finns till exempel som plåster och tuggummi. Det finns också receptbelagda läkemedel utan nikotin. Behandling kan kombineras med samtalsstöd. Fråga apotek eller vårdpersonal om vad som passar dig och följ anvisningarna.',sources:['medicines']},
  {title:'Under 18 år',text:'Du som är under 18 år behöver kontakta läkare för recept på nikotinläkemedel.',sources:['medicines']},
  {title:'Graviditet och amning',text:'Prata med läkare innan du använder läkemedel för rökstopp om du är gravid eller ammar. Barnmorskemottagning eller vårdcentral kan hjälpa dig med stöd.',sources:['pregnancy','medicines']},
 ],
 'Kontakt med vården':[
  {title:'Vårdcentral och apotek',text:'Kontakta vårdcentralen om du vill ha hjälp att sluta röka eller behöver individuell bedömning. Apotek kan svara på frågor om nikotinläkemedel.',sources:['stop','medicines']},
  {title:'Sluta-röka-linjen',text:'Kostnadsfritt stöd på telefon 020-84 00 00 och via chatt. Besök webbplatsen för aktuella öppettider och kontaktvägar.',sources:['contact']},
 ],
};
// Only literal source URLs can be opened; no profile, query or history enters a link.
export async function openSupportSource(id:SourceId,open:(url:string)=>Promise<unknown>):Promise<boolean>{
 const source=Object.prototype.hasOwnProperty.call(supportSources,id)?supportSources[id]:null;
 if(!source)return false;
 try{await open(source.url);return true;}catch{return false;}
}
