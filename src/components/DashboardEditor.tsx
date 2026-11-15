import React,{useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {DASHBOARD_CARDS,defaultDashboardPreferences,moveDashboardCard,toggleDashboardCard,type DashboardCard,type DashboardPreferences} from '../dashboardPreferences';
import {C} from '../theme';

export const dashboardCardLabels:Record<DashboardCard,string>={goal:'Dagens mål',time:'Tid sedan senaste cigaretten',savings:'Besparingar',progress:'Veckans framsteg',cravings:'Röksug',milestone:'Nästa delmål'};
export const DashboardEditor=React.memo(function DashboardEditor({value,ready,error,onChange}:{value:DashboardPreferences;ready:boolean;error:string|null;onChange:(value:DashboardPreferences)=>void}){
 const [open,setOpen]=useState(false);
 const ordered=[...value.cards,...DASHBOARD_CARDS.filter(id=>!value.cards.includes(id))];
 return <View style={s.panel}>
  <Pressable accessibilityRole="button" accessibilityState={{expanded:open}} onPress={()=>setOpen(v=>!v)} style={s.button}><Text style={s.buttonText}>{open?'Stäng anpassning':'Anpassa startsidan'}</Text></Pressable>
  {error?<Text accessibilityRole="alert" style={s.message}>{error}</Text>:null}
  {open?<>
   <Text style={s.message}>Välj dina översiktskort och flytta synliga kort uppåt eller nedåt. Dina val sparas bara på den här enheten för ditt konto eller gästläge.</Text>
   {!ready&&!error?<Text accessibilityLiveRegion="polite" style={s.message}>Hämtar kortval…</Text>:null}
   {ordered.map(id=>{const index=value.cards.indexOf(id),visible=index>=0;return <View key={id} style={s.row}>
    <Pressable accessibilityRole="switch" accessibilityLabel={`Visa ${dashboardCardLabels[id]}`} accessibilityState={{checked:visible,disabled:!ready}} disabled={!ready} onPress={()=>onChange(toggleDashboardCard(value,id))} style={s.toggle}><Text style={s.label}>{dashboardCardLabels[id]}</Text><Text style={s.message}>{visible?'Visas':'Dolt'}</Text></Pressable>
    {visible?<View style={s.actions}>{([-1,1] as const).map(direction=>{const disabled=!ready||(direction===-1?index===0:index===value.cards.length-1);return <Pressable key={direction} accessibilityRole="button" accessibilityLabel={`Flytta ${dashboardCardLabels[id]} ${direction===-1?'uppåt':'nedåt'}`} accessibilityState={{disabled}} disabled={disabled} onPress={()=>onChange(moveDashboardCard(value,id,direction))} style={[s.button,disabled&&{opacity:.45}]}><Text style={s.buttonText}>{direction===-1?'Upp':'Ned'}</Text></Pressable>})}</View>:null}
   </View>})}
   <Pressable accessibilityRole="button" accessibilityState={{disabled:!ready}} disabled={!ready} onPress={()=>onChange(defaultDashboardPreferences())} style={s.button}><Text style={s.buttonText}>Återställ standardkort</Text></Pressable>
  </>:null}
 </View>;
});
const s=StyleSheet.create({panel:{gap:12},row:{gap:8,padding:12,borderWidth:1,borderColor:C.border,borderRadius:14},toggle:{minHeight:48,justifyContent:'center',gap:4},actions:{flexDirection:'row',flexWrap:'wrap',gap:8},button:{minHeight:48,minWidth:48,padding:12,alignItems:'center',justifyContent:'center',backgroundColor:C.surface,borderRadius:12},buttonText:{color:C.lime,textAlign:'center',fontWeight:'800',flexShrink:1},label:{color:C.white,fontWeight:'800'},message:{color:C.muted,lineHeight:21}});
