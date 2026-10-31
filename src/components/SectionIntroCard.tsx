import React from 'react';
import {StyleSheet,Text,View} from 'react-native';
import {House,Target,PlusCircle,ChartColumn,History,Heart,Leaf} from 'lucide-react-native';
import {AppCard} from './ui';
import {C} from '../theme';

type IntroTab='home'|'plan'|'register'|'stats'|'history'|'sos'|'benefits';
export function SectionIntroCard({tab}:{tab:IntroTab}){
 return <AppCard style={{gap:13,padding:18,backgroundColor:'#1B2416',borderColor:'#425C29'}}>
 <View style={{flexDirection:'row',alignItems:'center',gap:13}}>
  <View style={{width:48,height:48,borderRadius:15,backgroundColor:C.limeSoft,alignItems:'center',justifyContent:'center'}}>
   {tab==='home'?<House size={24} color={C.lime}/>:tab==='plan'?<Target size={24} color={C.lime}/>:tab==='register'?<PlusCircle size={24} color={C.lime}/>:tab==='stats'?<ChartColumn size={24} color={C.lime}/>:tab==='history'?<History size={24} color={C.lime}/>:tab==='sos'?<Heart size={24} color={C.lime}/>:<Leaf size={24} color={C.lime}/>}
  </View>
  <View style={{flex:1,gap:4}}>
   <Text style={styles.cardTitle}>{tab==='home'?'Överblick':tab==='plan'?'Din personliga plan':tab==='register'?'Registrera dina framsteg':tab==='stats'?'Statistik och insikter':tab==='history'?'Din historik':tab==='sos'?'Stöd vid röksug':'Hälsa och besparingar'}</Text>
   <Text style={styles.muted}>{tab==='home'?'En dag i taget – varje steg räknas.':tab==='plan'?'Se dina mål och din utveckling.':tab==='register'?'Håll koll på dina registreringar.':tab==='stats'?'Upptäck hur dina vanor förändras.':tab==='history'?'Se och hantera tidigare registreringar.':tab==='sos'?'Ta hjälp när suget känns starkt.':'Följ vad din förändring ger tillbaka.'}</Text>
  </View>
 </View>
 </AppCard>;
}
const styles=StyleSheet.create({
 cardTitle:{fontSize:16,fontWeight:'800',color:C.white},
 muted:{fontSize:13,color:C.muted,lineHeight:20}
});
