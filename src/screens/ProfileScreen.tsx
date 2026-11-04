import React,{useRef,useState} from 'react';
import type Svg from 'react-native-svg';
import * as FileSystem from 'expo-file-system/legacy';
import {Pressable,Share,StyleSheet,Text,View} from 'react-native';
import {UserRound,ChevronRight,Target,History,Leaf,Settings,Heart,Cloud,Share2} from 'lucide-react-native';
import {C} from '../theme';
import {AppCard} from '../components/ui';
import {DailyProgressShareArtwork} from '../components/DailyProgressShareArtwork';
import type {Profile} from '../domain';

type Destination='account'|'backup'|'plan'|'history'|'benefits'|'settings'|'sos';
type Props={profile:Profile;accountEmail:string|null;todayCount:number;dailyGoal:number;onNavigate:(to:Destination)=>void};
const date=(d:Date)=>d.toLocaleDateString('sv-SE',{day:'numeric',month:'long',year:'numeric'});
const Card=({children,style}:{children:React.ReactNode;style?:React.ComponentProps<typeof AppCard>['style']})=><AppCard tone="elevated" style={style}>{children}</AppCard>;
export function ProfileScreen({profile,accountEmail,todayCount,dailyGoal,onNavigate}:Props){
 const [showSharePreview,setShowSharePreview]=useState(false);
 const artworkRef=useRef<Svg|null>(null);
 const [pngStatus,setPngStatus]=useState<'idle'|'rendering'|'ready'|'error'>('idle');
 const pngDataRef=useRef<string|null>(null);
 const pngPathRef=useRef<string|null>(null);
 const renderPng=()=>{
  setPngStatus('rendering');
  pngDataRef.current=null;
  pngPathRef.current=null;
  try{
   if(!artworkRef.current){setPngStatus('error');return;}
   artworkRef.current.toDataURL((base64)=>{
    void (async()=>{
    if(!base64){setPngStatus('error');return;}
    try{
     const directory=FileSystem.cacheDirectory;
     if(!directory)throw new Error('Cache unavailable');
     const path=directory+'smokeless-daily-progress.png';
     await FileSystem.writeAsStringAsync(path,base64,{encoding:FileSystem.EncodingType.Base64});
     pngDataRef.current=base64;
     pngPathRef.current=path;
     setPngStatus('ready');
    }catch{setPngStatus('error');}
    })();
   },{width:680,height:840});
  }catch{setPngStatus('error');}
 };
 const loggedIn=accountEmail!==null;
 const shareSupport=async()=>{try{await Share.share({message:'Ett litet steg i taget kan göra skillnad. Jag hejar på dig! 💚'});}catch{/* Delningsappen kan avbrytas eller saknas. Ingen personlig data skickas av appen. */}};
 return <View style={styles.screen}>
  <Card style={{gap:14,padding:19,backgroundColor:'#1B2416',borderColor:'#425C29'}}>
   <View style={styles.inline}><View style={[styles.actionIcon,{width:54,height:54,borderRadius:18}]}><UserRound size={27} color={C.lime}/></View><View style={{flex:1,gap:5}}><Text style={{color:C.white,fontWeight:'900',fontSize:20}}>{loggedIn?'Mitt konto':'Din personliga resa'}</Text><Text style={styles.muted}>{accountEmail||'Följ din utveckling i din egen takt'}</Text></View></View>
   <View style={{height:1,backgroundColor:'#425C29'}}/><View style={styles.sectionRow}><Text style={styles.muted}>Kontostatus</Text><Text style={{color:loggedIn?C.lime:'#E7B967',fontWeight:'800',fontSize:13}}>{loggedIn?'● Inloggad':'● Gästläge'}</Text></View>
  </Card>
  <View style={styles.inline}><Target size={19} color={C.lime}/><Text style={styles.heading}>Din resa</Text></View>
  <Card style={styles.inline}><View style={styles.actionIcon}><Target size={22} color={C.lime}/></View><View style={{flex:1,gap:5}}><Text style={styles.cardTitle}>{profile.mode==='quit'?'Sluta helt':'Minska gradvis'}</Text><Text style={styles.muted}>Planstart: {date(new Date(profile.startAt))}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Öppna min plan" accessibilityHint="Visar dina mål och din plan" hitSlop={12} onPress={()=>onNavigate('plan')} style={styles.planAction}><ChevronRight size={20} color={C.lime}/></Pressable></Card>
  <View style={styles.inline}><Settings size={19} color={C.lime}/><Text style={styles.heading}>Snabbåtkomst</Text></View>
  {([{label:'Min plan',icon:Target,to:'plan',detail:'Mål och framsteg'},{label:'Min logg',icon:History,to:'history',detail:'Din registrerade historik'},{label:'Hälsa och besparing',icon:Leaf,to:'benefits',detail:'Se vad du vinner'},{label:'Konto och säkerhet',icon:UserRound,to:'account',detail:loggedIn?'Inloggning, e-post och lösenord':'Logga in eller skapa konto'},{label:'Synkronisering',icon:Cloud,to:'backup',detail:loggedIn?'Kontrollera kontots molnsynk':'Skapa konto för att synka mellan enheter'},{label:'Inställningar',icon:Settings,to:'settings',detail:'Anpassa appen'},{label:'Stöd vid röksug',icon:Heart,to:'sos',detail:'Hjälp i stunden'}] as const).map(item=><Pressable key={item.label} accessibilityRole="button" accessibilityLabel={item.label} accessibilityHint={item.detail} onPress={()=>onNavigate(item.to)} style={styles.row}><View style={styles.actionIcon}><item.icon size={21} color={C.lime}/></View><View style={{flex:1,gap:3}}><Text style={styles.cardTitle}>{item.label}</Text><Text style={styles.muted}>{item.detail}</Text></View><ChevronRight size={19} color={C.dim}/></Pressable>)}
  <Card style={{gap:12}}>
   <View style={styles.inline}><Share2 size={21} color={C.lime}/><Text accessibilityRole="header" style={styles.cardTitle}>Dela ett stödmeddelande</Text></View>
   <Pressable accessibilityRole="button" accessibilityLabel={showSharePreview?'Dölj dagens framstegskort':'Förhandsgranska dagens framstegskort'} accessibilityState={{expanded:showSharePreview}} onPress={()=>{setShowSharePreview(v=>!v);setPngStatus('idle');pngDataRef.current=null;pngPathRef.current=null;}} style={[styles.row,{minHeight:56}]}><Text style={styles.cardTitle}>{showSharePreview?'Dölj förhandsgranskning':'Förhandsgranska dagens framsteg'}</Text><ChevronRight size={19} color={C.dim}/></Pressable>
   {showSharePreview?<><View style={{width:'100%',maxWidth:340,alignSelf:'center'}}><DailyProgressShareArtwork ref={artworkRef} todayCount={todayCount} dailyGoal={dailyGoal}/></View><Pressable accessibilityRole="button" accessibilityLabel="Skapa PNG av dagens framsteg" onPress={renderPng} disabled={pngStatus==='rendering'} style={[styles.row,{minHeight:56}]}><Text style={styles.cardTitle}>{pngStatus==='rendering'?'Skapar bild…':'Skapa PNG-bild'}</Text></Pressable>{pngStatus==='ready'?<Text accessibilityRole="text" style={styles.muted}>PNG-filen har sparats till appens tillfälliga lagring. Du behöver själv välja att dela den när bilddelning har aktiverats.</Text>:pngStatus==='error'?<Text accessibilityRole="alert" style={styles.muted}>Det gick inte att skapa bilden. Försök igen.</Text>:null}<Text style={styles.muted}>Förhandsgranskningen stannar på din telefon. Du kan skapa en PNG-bild på telefonen utan att dela den. Knappen nedan delar tills vidare endast ett allmänt stödmeddelande.</Text></>:null}
   <Text style={styles.muted}>Du kan skicka en uppmuntran till någon du väljer. Texten innehåller inga uppgifter om ditt konto, din plan eller dina registreringar.</Text>
   <Text style={styles.muted}>Ingenting delas automatiskt. Du kan avbryta i telefonens delningsdialog, och du väljer själv mottagare. Den app du väljer kan ha egna integritetsvillkor.</Text>
   <Pressable accessibilityRole="button" accessibilityLabel="Dela ett stödmeddelande" accessibilityHint="Öppnar telefonens delningsdialog där du själv väljer mottagare eller avbryter. Inga personliga registreringar följer med." onPress={()=>void shareSupport()} style={[styles.row,{minHeight:56}]}><View style={styles.actionIcon}><Share2 size={21} color={C.lime}/></View><View style={{flex:1}}><Text style={styles.cardTitle}>Dela en uppmuntran</Text></View><ChevronRight size={19} color={C.dim}/></Pressable>
  </Card>
 </View>;
}
const styles=StyleSheet.create({
 screen:{gap:20},
 inline:{flexDirection:'row',alignItems:'center',gap:14},sectionRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
 muted:{fontSize:13,lineHeight:19,color:C.dim},cardTitle:{fontSize:16,fontWeight:'800',color:C.white},heading:{fontSize:19,fontWeight:'800',color:C.white},
 actionIcon:{width:42,height:42,borderRadius:13,backgroundColor:C.limeSoft,alignItems:'center',justifyContent:'center'},
 planAction:{minWidth:48,minHeight:48,alignItems:'center',justifyContent:'center'},
 row:{minHeight:64,flexDirection:'row',alignItems:'center',gap:14,borderRadius:17,backgroundColor:C.surface,borderWidth:1,borderColor:C.border,paddingHorizontal:15,paddingVertical:15}

});
