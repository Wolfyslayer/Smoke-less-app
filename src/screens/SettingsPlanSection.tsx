import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {Target,CalendarDays,Minus,Plus} from 'lucide-react-native';
import {C} from '../theme';
import type {Profile} from '../domain';
import {AppCard} from '../components/ui';

type Props={
 profile:Profile;goal:number;
 onChangeMode:(mode:'reduce'|'quit')=>void;
 onChangeDailyTarget:(value:number|null)=>void;
};
function Card({children,style}:{children:React.ReactNode;style?:React.ComponentProps<typeof AppCard>['style']}){return <AppCard style={style}>{children}</AppCard>}
function Choice({title,subtitle,selected,onPress}:{title:string;subtitle:string;selected:boolean;onPress:()=>void}){return <Pressable accessibilityRole="radio" accessibilityLabel={title} accessibilityHint={subtitle} accessibilityState={{selected}} onPress={onPress} style={[styles.choice,selected&&styles.selected]}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.muted}>{subtitle}</Text></Pressable>}
export function SettingsPlanSection({profile:p,goal,onChangeMode,onChangeDailyTarget}:Props){
 return <>
  <Card style={{gap:13,padding:19,backgroundColor:'#1B2416',borderColor:'#425C29'}}>
   <View style={styles.inline}><View style={styles.heroIcon}><Target size={24} color={C.lime}/></View><View style={{flex:1,gap:4}}><Text accessibilityRole="header" style={styles.cardTitle}>Din personliga plan</Text><Text style={styles.muted}>Anpassa din resa, ett steg i taget.</Text></View></View>
   <View style={{height:1,backgroundColor:'#425C29'}}/><View style={styles.sectionRow}><Text style={styles.muted}>Nuvarande mål</Text><Text style={{color:C.lime,fontSize:14,fontWeight:'800'}}>{p.mode==='quit'?'Sluta helt':'Minska gradvis'}</Text></View>
  </Card>
  <View style={{gap:9}}><View style={styles.inline}><Target size={19} color={C.lime}/><Text accessibilityRole="header" style={styles.heading}>Rökmål</Text></View><Text style={styles.muted}>Välj hur du vill arbeta mot ett rökfritt liv.</Text>
   <Choice title="Minska gradvis" subtitle="Minska antalet cigaretter i din egen takt" selected={p.mode==='reduce'} onPress={()=>{if(p.mode!=='reduce')onChangeMode('reduce')}}/>
   <Choice title="Sluta helt" subtitle="Sätt målet till noll cigaretter" selected={p.mode==='quit'} onPress={()=>{if(p.mode!=='quit')onChangeMode('quit')}}/>
  </View>
  <Card style={{gap:15,padding:18}}>
   <View style={styles.inline}><View style={styles.actionIcon}><CalendarDays size={20} color={C.lime}/></View><View style={{flex:1,gap:3}}><Text accessibilityRole="header" style={styles.cardTitle}>Dagligt riktvärde</Text><Text style={styles.muted}>Justera riktvärdet om du behöver. Ett eget värde gäller varje dag tills du återställer det.</Text></View></View>
   <View style={styles.sectionRow}>
    <Pressable accessibilityRole="button" accessibilityLabel="Minska dagligt mål" accessibilityHint="Minskar riktvärdet med en cigarett" accessibilityState={{disabled:goal<=0}} disabled={goal<=0} style={[styles.stepper,goal<=0&&styles.disabled]} onPress={()=>onChangeDailyTarget(Math.max(0,(p.dailyTargetOverride??goal)-1))}><Minus size={21} color={C.lime}/></Pressable>
    <View style={{alignItems:'center',gap:2,flexShrink:1,minWidth:90}}><Text accessibilityLabel={`Dagligt riktvärde: ${goal} cigaretter`} style={styles.goal}>{goal}</Text><Text style={styles.muted}>cigaretter per dag</Text></View>
    <Pressable accessibilityRole="button" accessibilityLabel="Öka dagligt mål" accessibilityHint="Ökar riktvärdet med en cigarett" style={styles.stepper} onPress={()=>onChangeDailyTarget((p.dailyTargetOverride??goal)+1)}><Plus size={21} color={C.lime}/></Pressable>
   </View>
   {p.dailyTargetOverride!==null?<Text accessibilityRole="text" style={styles.muted}>Eget riktvärde aktivt: {p.dailyTargetOverride} cigaretter per dag. Den automatiska nedtrappningen pausas tills du återställer.</Text>:<Text style={styles.muted}>Ditt riktvärde följer den valda nedtrappningstakten.</Text>}
   <Pressable accessibilityRole="button" accessibilityLabel="Återställ planens riktvärde" accessibilityState={{disabled:p.dailyTargetOverride===null}} disabled={p.dailyTargetOverride===null} onPress={()=>onChangeDailyTarget(null)} style={[styles.button,p.dailyTargetOverride===null&&styles.disabled]}><Text style={styles.buttonText}>Återställ planens riktvärde</Text></Pressable>
  </Card>
 </>;
}
const styles=StyleSheet.create({
 inline:{flexDirection:'row',alignItems:'center',gap:11},sectionRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8},
 heroIcon:{width:46,height:46,borderRadius:15,backgroundColor:C.limeSoft,alignItems:'center',justifyContent:'center'},
 actionIcon:{width:36,height:36,borderRadius:11,backgroundColor:C.elevated,alignItems:'center',justifyContent:'center'},
 heading:{fontSize:19,fontWeight:'800',color:C.white},cardTitle:{fontSize:16,fontWeight:'800',color:C.white},
 muted:{fontSize:13,color:C.muted,lineHeight:20},goal:{fontSize:37,fontWeight:'900',color:C.white},
 choice:{backgroundColor:C.surface,borderRadius:16,padding:15,borderWidth:1,borderColor:C.border,gap:5},
 selected:{borderColor:C.lime,backgroundColor:C.limeSoft},stepper:{backgroundColor:C.elevated,borderRadius:13,padding:12,minWidth:48,minHeight:48,alignItems:"center",justifyContent:"center"},
 button:{backgroundColor:C.elevated,borderWidth:1,borderColor:C.border,padding:13,borderRadius:14,alignItems:'center',justifyContent:'center',minHeight:48},
 disabled:{opacity:0.45},
 buttonText:{color:C.white,fontWeight:'900',fontSize:15},
});
