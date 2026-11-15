import React,{forwardRef,memo} from 'react';
import {View,useWindowDimensions} from 'react-native';
import Svg,{Circle,Rect,Text as SvgText,TSpan} from 'react-native-svg';
import {buildDailyShareCard,progressCardLayout,type DailyShareProgress} from '../domain/dailyShareCard';
import {C} from '../theme';

/** One renderer for the home card, preview and isolated PNG export. */
export const DailyProgressShareArtwork=memo(forwardRef<Svg,DailyShareProgress>(function DailyProgressShareArtwork({todayCount,dailyGoal},ref){
 const card=buildDailyShareCard({todayCount,dailyGoal});
 const {fontScale}=useWindowDimensions();
 const layout=progressCardLayout(card,fontScale);
 const circumference=2*Math.PI*layout.ringRadius;
 const ringX=layout.stacked?170:264;
 return <View style={{width:'100%',aspectRatio:layout.width/layout.height}}>
 <Svg ref={ref} width="100%" height="100%" fontFamily="sans-serif" viewBox={`0 0 ${layout.width} ${layout.height}`} accessible accessibilityRole="image" accessibilityLabel={`Dagens framsteg. ${card.remaining} kvar av dagsmålet ${card.dailyGoal}. ${card.todayCount} registrerade cigaretter. ${card.progressPercent} procent av dagsmålet använt. ${card.message}`}>
  <Rect x="0" y="0" width={layout.width} height={layout.height} rx="20" fill={C.elevated}/>
  <Rect x="1" y="1" width={layout.width-2} height={layout.height-2} rx="19" stroke="#425C29" strokeWidth="1" fill="none"/>
  <SvgText x="19" y={layout.titleY} fill={C.lime} fontSize={Math.min(44,11*layout.scale)} fontWeight="800" letterSpacing="1.5">{layout.titleLines.map((line,index)=><TSpan key={index} x="19" dy={index===0?0:16*layout.scale}>{line}</TSpan>)}</SvgText>
  <SvgText x="19" y={layout.numberY} fill={C.white} fontSize={layout.numberSize} fontWeight="900">{card.remaining} / {card.dailyGoal}</SvgText>
  <SvgText x="19" y={layout.captionY} fill={C.muted} fontSize={13*layout.scale}>{layout.captionLines.map((line,index)=><TSpan key={index} x="19" dy={index===0?0:20*layout.scale}>{line}</TSpan>)}</SvgText>
  <Circle cx={ringX} cy={layout.ringY} r={layout.ringRadius} stroke={C.soft} strokeWidth="9" fill="none"/>
  <Circle cx={ringX} cy={layout.ringY} r={layout.ringRadius} stroke={C.lime} strokeWidth="9" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference*(1-card.progressPercent/100)} rotation={-90} origin={`${ringX},${layout.ringY}`}/>
  <SvgText x={ringX} y={layout.ringY+7*layout.scale} fill={C.white} fontSize={19*layout.scale} fontWeight="800" textAnchor="middle">{card.progressPercent}%</SvgText>
  <SvgText x="19" y={layout.messageY} fill={C.white} fontSize={13*layout.scale}>
   {layout.lines.map((line,index)=><TSpan key={index} x="19" dy={index===0?0:20*layout.scale}>{line}</TSpan>)}
  </SvgText>
 </Svg></View>;
}));
