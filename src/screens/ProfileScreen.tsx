import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {UserRound,Shield,ChevronRight,Target,History,Leaf,Settings,Heart} from 'lucide-react-native';
import {C} from '../theme';
import type {Profile} from '../domain';

type Destination='account'|'plan'|'history'|'benefits'|'settings'|'sos';
type Props={profile:Profile;accountEmail:string|null;syncStatus:string;onNavigate:(to:Destination)=>void};
const date=(d:Date)=>d.toLocaleDateString('sv-SE',{day:'numeric',month:'long',year:'numeric'});
function Card({children,style}:{children:React.ReactNode;style?:any}){return <View style={[styles.card,style]}>{children}</View>}
function Button({title,onPress,secondary=false}:{title:string;onPress:()=>void;secondary?:boolean}){return <Pressable accessibilityRole="button" onPress={onPress} style={[styles.button,secondary&&styles.buttonSecondary]}><Text style={[styles.buttonText,secondary&&{color:C.white}]}>{title}</Text></Pressable>}
export function ProfileScreen({profile,accountEmail,syncStatus,onNavigate}:Props){
 const loggedIn=accountEmail!==null;
 return <View style={styles.screen}>
  <Card style={{gap:14,padding:19,backgroundColor:'#1B2416',borderColor:'#425C29'}}>
   <View style={styles.inline}><View style={[styles.actionIcon,{width:54,height:54,borderRadius:18}]}><UserRound size={27} color={C.lime}/></View><View style={{flex:1,gap:5}}><Text style={{color:C.white,fontWeight:'900',fontSize:20}}>{loggedIn?'Mitt konto':'Din personliga resa'}</Text><Text style={styles.muted}>{accountEmail||'Följ din utveckling i din egen takt'}</Text></View></View>
   <View style={{height:1,backgroundColor:'#425C29'}}/><View style={styles.sectionRow}><Text style={styles.muted}>Kontostatus</Text><Text style={{color:loggedIn?C.lime:'#E7B967',fontWeight:'800',fontSize:13}}>{loggedIn?'● Inloggad':'● Gästläge'}</Text></View>
  </Card>
  {!loggedIn?<Card style={{gap:13,padding:18,borderColor:'#9D793E',backgroundColor:'#272218'}}>
   <View style={styles.inline}><View style={[styles.actionIcon,{width:43,height:43,borderRadius:14,backgroundColor:'#47381F'}]}><Shield size={23} color="#E7B967"/></View><View style={{flex:1,gap:3}}><Text style={[styles.cardTitle,{color:'#E7B967'}]}>Din historik är inte säkerhetskopierad</Text><Text style={styles.muted}>Du använder appen som gäst.</Text></View></View>
   <Text style={styles.muted}>Om du avinstallerar appen, byter telefon eller förlorar enheten kan din historik försvinna.</Text>
   <Text style={styles.muted}>Så skyddar du din historik: Öppna Konto nedan, välj Skapa konto eller Logga in och följ instruktionerna. När du är inloggad synkroniseras kontohistoriken automatiskt till Firestore. Har du redan gästhistorik kan du kopiera den till kontot under Konto.</Text>
   <Button title="Öppna Konto och skydda min historik" onPress={()=>onNavigate('account')}/>
  </Card>:<Card style={{gap:11,padding:18}}>
   <View style={styles.inline}><View style={styles.actionIcon}><Shield size={22} color={C.lime}/></View><View style={{flex:1,gap:3}}><Text style={styles.cardTitle}>Molnsynkronisering</Text><Text style={styles.muted}>Inloggad som {accountEmail||'användare'}</Text></View></View>
   <Text style={styles.muted} accessibilityLiveRegion="polite">{syncStatus||'Automatisk synkronisering är aktiverad. Ändringar säkerhetskopieras när anslutningen fungerar.'}</Text>
   <Text style={styles.muted}>Om en konflikt upptäcks pausas synkroniseringen för att skydda din historik. Öppna Konto för att granska status och hantera historiken.</Text>
   <Button title="Öppna Konto" secondary onPress={()=>onNavigate('account')}/>
  </Card>}
  <Pressable accessibilityRole="button" onPress={()=>onNavigate('account')} style={styles.row}><View style={styles.actionIcon}><UserRound size={21} color={C.lime}/></View><View style={{flex:1,gap:4}}><Text style={styles.cardTitle}>Konto</Text><Text style={styles.muted}>{loggedIn?'Inloggning, historik och kontohantering':'Logga in, skapa konto och skydda dina data'}</Text></View><ChevronRight size={19} color={C.dim}/></Pressable>
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
