import React,{forwardRef,memo} from 'react';
import {View,useWindowDimensions} from 'react-native';
import Svg,{Circle,Rect,Text as SvgText,TSpan} from 'react-native-svg';
import {buildDailyShareCard,progressCardLayout,type DailyShareProgress} from '../domain/dailyShareCard';
import {useThemeColors,type ThemeColors} from '../theme';

/** One renderer for the home card, preview and isolated PNG export. */
export const DailyProgressShareArtwork=memo(forwardRef<Svg,DailyShareProgress>(function DailyProgressShareArtwork({todayCount,dailyGoal},ref){
 const C=useThemeColors();

 const card=buildDailyShareCard({todayCount,dailyGoal});
 const {fontScale}=useWindowDimensions();
 const layout=progressCardLayout(card,fontScale);
 const circumference=2*Math.PI*layout.ringRadius;
 const ringX=layout.horizontal?80:170;
 const firstStatX=layout.stacked?170:96;
 const secondStatX=layout.stacked?170:244;
 const secondStatY=layout.statsY+(layout.stacked?55*layout.scale:0);
 const statSize=Math.min(19*layout.scale,(layout.stacked?260:120)/(Math.max(String(card.todayCount).length,String(card.dailyGoal).length)*.62));
 return <View style={{width:'100%',aspectRatio:layout.width/layout.height}}>
 <Svg ref={ref} width="100%" height="100%" fontFamily="sans-serif" viewBox={`0 0 ${layout.width} ${layout.height}`} accessible accessibilityRole="image" accessibilityLabel={`Dagens framsteg. ${card.remaining} kvar av dagsmålet ${card.dailyGoal}. ${card.todayCount} registrerade cigaretter. ${card.progressPercent} procent av dagsmålet använt. ${card.message}`}>
  <Rect x=".5" y=".5" width={layout.width-1} height={layout.height-1} rx="16" fill={C.surface} stroke={C.border} strokeWidth="1"/>
  <SvgText x="22" y={layout.titleY} fill={C.muted} fontSize={11*layout.scale} fontWeight="700" letterSpacing="1.5">{layout.titleLines.map((line,index)=><TSpan key={index} x="22" dy={index===0?0:16*layout.scale}>{line}</TSpan>)}</SvgText>
  <Circle cx={ringX} cy={layout.ringY} r={layout.ringRadius-13} fill={C.background}/>
  <Circle cx={ringX} cy={layout.ringY} r={layout.ringRadius} stroke={C.soft} strokeWidth="6" fill="none"/>
  <Circle cx={ringX} cy={layout.ringY} r={layout.ringRadius} stroke={C.accent} strokeWidth="7" strokeOpacity={card.progressPercent===0?0:1} fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference*(1-card.progressPercent/100)} rotation={-90} origin={`${ringX},${layout.ringY}`}/>
  <SvgText x={ringX} y={layout.numberY} fill={C.text} fontSize={layout.numberSize} fontWeight="800" textAnchor="middle">{card.remaining}</SvgText>
  <SvgText x={ringX} y={layout.captionY} fill={C.muted} textAnchor="middle" fontSize={13*layout.scale}>{layout.captionLines.map((line,index)=><TSpan key={index} x={ringX} dy={index===0?0:20*layout.scale}>{line}</TSpan>)}</SvgText>
  {layout.horizontal?<>
  <SvgText x="162" y="69" fill={C.muted} fontSize={12*layout.scale}>Registrerade idag</SvgText>
  <SvgText x="314" y="94" fill={C.text} fontSize={Math.min(22*layout.scale,148/(String(card.todayCount).length*.62))} fontWeight="800" textAnchor="end">{card.todayCount}</SvgText>
  <SvgText x="162" y="111" fill={C.muted} fontSize={12*layout.scale}>Dagens mål</SvgText>
  <SvgText x="314" y="136" fill={C.text} fontSize={Math.min(22*layout.scale,148/(String(card.dailyGoal).length*.62))} fontWeight="800" textAnchor="end">{card.dailyGoal}</SvgText>
  <Rect x="162" y="148" width="152" height="5" rx="2.5" fill={C.soft}/>
  <Rect x="162" y="148" width={152*card.progressPercent/100} height="5" rx="2.5" fill={C.accent}/>
  <SvgText x="162" y="171" fill={C.muted} fontSize={11*layout.scale}>{card.progressPercent} % av dagsmålet använt</SvgText>
  </>:<><Rect x="22" y={layout.statsY-20*layout.scale} width="296" height={(layout.stacked?102:47)*layout.scale} rx="14" fill={C.elevated}/>
  <SvgText x={firstStatX} y={layout.statsY} textAnchor="middle" fill={C.text} fontSize={statSize} fontWeight="800">{card.todayCount}</SvgText>
  <SvgText x={secondStatX} y={secondStatY} textAnchor="middle" fill={C.text} fontSize={statSize} fontWeight="800">{card.dailyGoal}</SvgText>
  <SvgText x={firstStatX} y={layout.statsY+18*layout.scale} textAnchor="middle" fill={C.muted} fontSize={11*layout.scale}>registrerade</SvgText>
  <SvgText x={secondStatX} y={secondStatY+18*layout.scale} textAnchor="middle" fill={C.muted} fontSize={11*layout.scale}>dagsmål</SvgText>
  </>}
  <SvgText x="22" y={layout.messageY} fill={C.muted} fontSize={13*layout.scale}>
   {layout.lines.map((line,index)=><TSpan key={index} x="22" dy={index===0?0:20*layout.scale}>{line}</TSpan>)}
  </SvgText>
 </Svg></View>;
}));
