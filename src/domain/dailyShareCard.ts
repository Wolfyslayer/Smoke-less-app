/** Only explicitly approved daily aggregates may appear in a shared progress card. */
export type DailyShareProgress={todayCount:number;dailyGoal:number};
export type DailyShareCard={todayCount:number;dailyGoal:number;remaining:number;progressPercent:number;message:string};
const safeNonNegativeInteger=(value:number)=>Number.isFinite(value)?Math.max(0,Math.floor(value)):0;
export function buildDailyShareCard(input:DailyShareProgress):DailyShareCard{
 const todayCount=safeNonNegativeInteger(input.todayCount);
 const dailyGoal=safeNonNegativeInteger(input.dailyGoal);
 const progressPercent=dailyGoal>0?Math.min(100,Math.round(todayCount/dailyGoal*100)):0;
 const remaining=Math.max(0,dailyGoal-todayCount);
 const message=dailyGoal===0
  ?todayCount===0?'Ditt mål är en rökfri dag.':'Fortsätt framåt i din egen takt.'
  :todayCount<=dailyGoal
   ?`Du har ${remaining} kvar till dagens övre gräns.`
   :'Det blev lite mer än planerat idag, men dina framsteg räknas fortfarande. Fortsätt i din egen takt.';
 return {todayCount,dailyGoal,remaining,progressPercent,message};
}

/** Shared geometry for on-screen SVG and PNG; font scaling can grow the card. */
export function progressCardLayout(card:DailyShareCard,fontScale=1){
 const scale=Number.isFinite(fontScale)?Math.max(1,fontScale):1;
 const stacked=scale>1.3;
 const main=`${card.remaining} / ${card.dailyGoal}`;
 const numberSize=Math.min(48*scale,(stacked?300:176)/(main.length*.62));
 const titleY=22+11*scale;
 const titleLines=stacked?['DAGENS','FRAMSTEG']:['DAGENS FRAMSTEG'];
 const numberY=titleY+(titleLines.length-1)*16*scale+20+numberSize;
 const captionY=numberY+24*scale;
 const maxCharacters=Math.max(8,Math.floor(300/(13*scale*.58)));
 const wrap=(text:string)=>{const lines:string[]=[];
 for(const word of text.split(' ')){
  const last=lines.length-1;
  if(last<0||lines[last].length+1+word.length>maxCharacters)lines.push(word);
  else lines[last]+=' '+word;
 }
 return lines;};
 const lines=wrap(card.message),captionLines=wrap('cigaretter kvar idag');
 const captionEnd=captionY+(captionLines.length-1)*20*scale;
 const ringRadius=46*(stacked?Math.min(scale,2.5):1);
 const ringY=stacked?captionEnd+ringRadius+26:Math.max(94,captionEnd-35);
 const messageY=Math.max(captionEnd+28,ringY+ringRadius+20+13*scale);
 const height=messageY+Math.max(1,lines.length)*20*scale+20;
 return {width:340,height,scale,stacked,numberSize,titleY,titleLines,numberY,captionY,captionLines,ringRadius,ringY,messageY,lines};
}
