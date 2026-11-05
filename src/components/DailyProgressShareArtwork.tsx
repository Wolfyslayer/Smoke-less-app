import React,{forwardRef,memo} from 'react';
import Svg,{Circle,Rect,Text as SvgText,TSpan} from 'react-native-svg';
import {buildDailyShareCard,type DailyShareProgress} from '../domain/dailyShareCard';

/**
 * PNG-ready SVG artwork. The same component is previewed and exported via
 * Svg.toDataURL(), so screenshots never include account UI or private fields.
 */
export const DailyProgressShareArtwork=memo(forwardRef<Svg,DailyShareProgress>(function DailyProgressShareArtwork({todayCount,dailyGoal},ref){
 const card=buildDailyShareCard({todayCount,dailyGoal});
 const circumference=2*Math.PI*74;
 const lines=card.dailyGoal===0
  ?['Varje cigarettfri stund räknas.','Fortsätt i din egen takt!']
  :card.todayCount<card.dailyGoal
   ?['Du ligger inom dagens gräns.','Fortsätt i din egen takt.']
   :card.todayCount===card.dailyGoal
    ?['Du håller dagens gräns.','Varje steg framåt räknas!']
    :['En dag i taget. Du kan fortsätta','mot ditt mål utan att ge upp.'];
 const label=card.dailyGoal===0?'Dagens mål: 0 cigaretter':`${card.progressPercent}% av dagens gräns använd`;
 return <Svg ref={ref} width="100%" height="100%" viewBox="0 0 340 420" accessible accessibilityLabel={`Dagens framsteg. ${card.todayCount} av ${card.dailyGoal} cigaretter. ${card.message}`}>
  <Rect x="0" y="0" width="340" height="420" rx="26" fill="#17251B"/>
  <Rect x="1" y="1" width="338" height="418" rx="25" stroke="#435C36" strokeWidth="2" fill="none"/>
  <SvgText x="170" y="42" fill="#B8EB72" fontSize="14" fontWeight="bold" letterSpacing="2" textAnchor="middle">SMOKE LESS</SvgText>
  <SvgText x="170" y="84" fill="#FFFFFF" fontSize="25" fontWeight="bold" textAnchor="middle">Dagens framsteg</SvgText>
  <Circle cx="170" cy="185" r="74" stroke="#394D35" strokeWidth="14" fill="none"/>
  <Circle cx="170" cy="185" r="74" stroke="#B8EB72" strokeWidth="14" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference*(1-card.progressPercent/100)} rotation={-90} origin="170,185"/>
  <SvgText x="170" y="190" fill="#FFFFFF" fontSize="31" fontWeight="bold" textAnchor="middle">{card.todayCount}/{card.dailyGoal}</SvgText>
  <SvgText x="170" y="213" fill="#D0D8CC" fontSize="13" textAnchor="middle">cigaretter idag</SvgText>
  <SvgText x="170" y="291" fill="#D0D8CC" fontSize="14" textAnchor="middle">{label}</SvgText>
  <SvgText x="170" y="329" fill="#FFFFFF" fontSize="16" fontWeight="bold" textAnchor="middle">
   {lines.map((line,index)=><TSpan key={line} x="170" dy={index===0?0:24}>{line}</TSpan>)}
  </SvgText>
  <SvgText x="170" y="395" fill="#B8EB72" fontSize="14" fontWeight="bold" textAnchor="middle">Små steg räknas</SvgText>
 </Svg>;
}));
