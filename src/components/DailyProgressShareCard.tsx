import React from 'react';
import {StyleSheet,Text,View} from 'react-native';
import Svg,{Circle} from 'react-native-svg';
import {buildDailyShareCard,type DailyShareProgress} from '../domain/dailyShareCard';
import {C} from '../theme';

/** Dedicated share artwork: never capture the whole app or account details. */
export function DailyProgressShareCard({todayCount,dailyGoal}:DailyShareProgress){
 const card=buildDailyShareCard({todayCount,dailyGoal});
 const radius=56,circumference=2*Math.PI*radius;
 const percentage=card.progressPercent;
 return <View accessible accessibilityLabel={`Dagens framsteg. ${card.todayCount} av ${card.dailyGoal} cigaretter. ${card.message}`} style={styles.card}>
  <Text style={styles.brand}>SMOKE LESS</Text>
  <Text style={styles.title}>Dagens framsteg</Text>
  <View style={styles.ring}>
   <Svg width={148} height={148} viewBox="0 0 148 148">
    <Circle cx="74" cy="74" r={radius} stroke={C.soft} strokeWidth={13} fill="none"/>
    <Circle cx="74" cy="74" r={radius} stroke={C.lime} strokeWidth={13} fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference*(1-percentage/100)} rotation={-90} origin="74,74"/>
   </Svg>
   <View style={styles.center}><Text style={styles.count}>{card.todayCount}/{card.dailyGoal}</Text><Text style={styles.caption}>cigaretter idag</Text></View>
  </View>
  <Text style={styles.limit}>{percentage}% av dagens gräns använd</Text>
  <Text style={styles.message}>{card.message}</Text>
  <Text style={styles.footer}>Små steg räknas 💚</Text>
 </View>;
}
const styles=StyleSheet.create({
 card:{width:320,maxWidth:'100%',alignSelf:'center',alignItems:'center',backgroundColor:'#17251B',borderColor:'#435C36',borderWidth:1,borderRadius:26,paddingHorizontal:22,paddingVertical:26,gap:12},
 brand:{color:C.lime,fontSize:13,fontWeight:'900',letterSpacing:2},
 title:{color:C.white,fontSize:24,fontWeight:'900',textAlign:'center'},
 ring:{width:148,height:148,justifyContent:'center',alignItems:'center',marginTop:6},
 center:{position:'absolute',alignItems:'center',gap:3},
 count:{color:C.white,fontSize:30,fontWeight:'900'},
 caption:{color:C.dim,fontSize:12,fontWeight:'700'},
 limit:{color:C.dim,fontSize:13,textAlign:'center'},
 message:{color:C.white,fontSize:16,fontWeight:'700',textAlign:'center',lineHeight:23},
 footer:{color:C.lime,fontSize:12,fontWeight:'800',marginTop:5}
});
