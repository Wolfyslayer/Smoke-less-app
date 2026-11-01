import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {UserRound,Shield,ChevronRight,Target,History,Leaf,Settings,Heart,Download} from 'lucide-react-native';
import {C} from '../theme';
import {AppCard} from '../components/ui';
import type {Profile} from '../domain';

type Destination='account'|'plan'|'history'|'benefits'|'settings'|'sos';
type Props={profile:Profile;accountEmail:string|null;syncStatus:string;onNavigate:(to:Destination)=>void};
const date=(d:Date)=>d.toLocaleDateString('sv-SE',{day:'numeric',month:'long',year:'numeric'});
const Card=({children,style}:{children:React.ReactNode;style?:any})=><AppCard tone="elevated" style={style}>{children}</AppCard>;
export function ProfileScreen({profile,accountEmail,syncStatus,onNavigate}:Props){
 const loggedIn=accountEmail!==null;
 return <View style={styles.screen}>
  <Card style={{gap:14,padding:19,backgroundColor:'#1B2416',borderColor:'#425C29'}}>
   <View style={styles.inline}><View style={[styles.actionIcon,{width:54,height:54,borderRadius:18}]}><UserRound size={27} color={C.lime}/></View><View style={{flex:1,gap:5}}><Text style={{color:C.white,fontWeight:'900',fontSize:20}}>{loggedIn?'Mitt konto':'Din personliga resa'}</Text><Text style={styles.muted}>{accountEmail||'Följ din utveckling i din egen takt'}</Text></View></View>
   <View style={{height:1,backgroundColor:'#425C29'}}/><View style={styles.sectionRow}><Text style={styles.muted}>Kontostatus</Text><Text style={{color:loggedIn?C.lime:'#E7B967',fontWeight:'800',fontSize:13}}>{loggedIn?'● Inloggad':'● Gästläge'}</Text></View>
  </Card>
  <Pressable accessibilityRole="button" onPress={()=>onNavigate('account')} style={styles.row}><View style={styles.actionIcon}><UserRound size={21} color={C.lime}/></View><View style={{flex:1,gap:4}}><Text style={styles.cardTitle}>Konto och säkerhet</Text><Text style={styles.muted}>{loggedIn?'Hantera inloggning, e-post och lösenord':'Logga in eller skapa konto'}</Text></View><ChevronRight size={19} color={C.dim}/></Pressable>
  <Pressable accessibilityRole="button" onPress={()=>onNavigate('settings')} style={styles.row}><View style={styles.actionIcon}><Download size={21} color={C.lime}/></View><View style={{flex:1,gap:4}}><Text style={styles.cardTitle}>Säkerhetskopiering</Text><Text style={styles.muted}>{loggedIn?'Molnstatus och manuell säkerhetskopia':'Exportera och skydda din historik'}</Text></View><ChevronRight size={19} color={C.dim}/></Pressable>
  <View style={styles.inline}><Target size={19} color={C.lime}/><Text style={styles.heading}>Din resa</Text></View>
  <Card style={styles.inline}><View style={styles.actionIcon}><Target size={22} color={C.lime}/></View><View style={{flex:1,gap:5}}><Text style={styles.cardTitle}>{profile.mode==='quit'?'Sluta helt':'Minska gradvis'}</Text><Text style={styles.muted}>Planstart: {date(new Date(profile.startAt))}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Öppna min plan" onPress={()=>onNavigate('plan')}><ChevronRight size={20} color={C.lime}/></Pressable></Card>
  <View style={styles.inline}><Settings size={19} color={C.lime}/><Text style={styles.heading}>Snabbåtkomst</Text></View>
  {([{label:'Min plan',icon:Target,to:'plan',detail:'Mål och framsteg'},{label:'Min logg',icon:History,to:'history',detail:'Din registrerade historik'},{label:'Hälsa och besparing',icon:Leaf,to:'benefits',detail:'Se vad du vinner'},{label:'Inställningar',icon:Settings,to:'settings',detail:'Anpassa appen'},{label:'Stöd vid röksug',icon:Heart,to:'sos',detail:'Hjälp i stunden'}] as const).map(item=><Pressable key={item.label} accessibilityRole="button" onPress={()=>onNavigate(item.to)} style={styles.row}><View style={styles.actionIcon}><item.icon size={21} color={C.lime}/></View><View style={{flex:1,gap:3}}><Text style={styles.cardTitle}>{item.label}</Text><Text style={styles.muted}>{item.detail}</Text></View><ChevronRight size={19} color={C.dim}/></Pressable>)}
 </View>;
}
const styles=StyleSheet.create({
 screen:{gap:20},card:{backgroundColor:C.elevated,borderRadius:20,borderWidth:1,borderColor:C.border,padding:17,gap:8},
 inline:{flexDirection:'row',alignItems:'center',gap:14},sectionRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
 muted:{fontSize:13,lineHeight:19,color:C.dim},cardTitle:{fontSize:16,fontWeight:'800',color:C.white},heading:{fontSize:19,fontWeight:'800',color:C.white},
 actionIcon:{width:42,height:42,borderRadius:13,backgroundColor:C.limeSoft,alignItems:'center',justifyContent:'center'},
 row:{flexDirection:'row',alignItems:'center',gap:14,borderRadius:17,backgroundColor:C.surface,borderWidth:1,borderColor:C.border,paddingHorizontal:15,paddingVertical:15},
 button:{backgroundColor:C.lime,borderRadius:14,minHeight:49,alignItems:'center',justifyContent:'center',paddingHorizontal:14},buttonSecondary:{backgroundColor:C.soft},
 buttonText:{fontWeight:'800',color:C.background,fontSize:14},
});
