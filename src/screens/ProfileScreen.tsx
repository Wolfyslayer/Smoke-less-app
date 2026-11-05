import React,{useRef,useState} from 'react';
import type Svg from 'react-native-svg';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
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
const quickLinks=[{label:'Min plan',icon:Target,to:'plan',detail:'Mål och framsteg'},{label:'Min logg',icon:History,to:'history',detail:'Din registrerade historik'},{label:'Hälsa och besparing',icon:Leaf,to:'benefits',detail:'Se vad du vinner'},{label:'Konto och säkerhet',icon:UserRound,to:'account',detail:'Inloggning och kontoinställningar'},{label:'Synkronisering',icon:Cloud,to:'backup',detail:'Kontosynk mellan enheter'},{label:'Inställningar',icon:Settings,to:'settings',detail:'Anpassa appen'},{label:'Stöd vid röksug',icon:Heart,to:'sos',detail:'Hjälp i stunden'}] as const;
export function ProfileScreen({profile,accountEmail,todayCount,dailyGoal,onNavigate}:Props){
 const [showSharePreview,setShowSharePreview]=useState(false);
 const artworkRef=useRef<Svg|null>(null);
 const previewOpenRef=useRef(false);
 const [pngStatus,setPngStatus]=useState<'idle'|'rendering'|'ready'|'error'>('idle');
 const exportGenerationRef=useRef(0);
 const latestCountsRef=useRef({todayCount,dailyGoal});
 latestCountsRef.current={todayCount,dailyGoal};
 const exportCountsRef=useRef<{todayCount:number;dailyGoal:number}|null>(null);
 const pngPathRef=useRef<string|null>(null);
 const [sharingPng,setSharingPng]=useState(false);
 const [shareError,setShareError]=useState(false);
 const sharePng=async()=>{
  if(pngStatus!=='ready'||!pngPathRef.current||sharingPng||exportCountsRef.current?.todayCount!==todayCount||exportCountsRef.current?.dailyGoal!==dailyGoal)return;
  setSharingPng(true);
  setShareError(false);
  try{
   const approvedPath=pngPathRef.current;
   const approvedCounts=exportCountsRef.current;
   const approvedGeneration=exportGenerationRef.current;
   if(!await Sharing.isAvailableAsync())throw new Error('Sharing unavailable');
   if(!previewOpenRef.current||exportGenerationRef.current!==approvedGeneration||!approvedPath||pngPathRef.current!==approvedPath||exportCountsRef.current!==approvedCounts||latestCountsRef.current.todayCount!==approvedCounts?.todayCount||latestCountsRef.current.dailyGoal!==approvedCounts?.dailyGoal)return;
   await Sharing.shareAsync(approvedPath,{mimeType:'image/png',dialogTitle:'Dela dagens framsteg',UTI:'public.png'});
  }catch{setShareError(true);}finally{setSharingPng(false);}
 };
 const renderPng=()=>{
  const generation=++exportGenerationRef.current;
  setPngStatus('rendering');
  setShareError(false);
  pngPathRef.current=null;
  exportCountsRef.current=null;
  try{
   if(!artworkRef.current){setPngStatus('error');return;}
   artworkRef.current.toDataURL((base64)=>{
    void (async()=>{
    if(generation!==exportGenerationRef.current||latestCountsRef.current.todayCount!==todayCount||latestCountsRef.current.dailyGoal!==dailyGoal){if(generation===exportGenerationRef.current)setPngStatus('idle');return;}
    if(!base64){setPngStatus('error');return;}
    try{
     const directory=FileSystem.cacheDirectory;
     if(!directory)throw new Error('Cache unavailable');
     const path=directory+'smokeless-daily-progress-'+generation+'.png';
     await FileSystem.writeAsStringAsync(path,base64,{encoding:FileSystem.EncodingType.Base64});
     if(generation!==exportGenerationRef.current||latestCountsRef.current.todayCount!==todayCount||latestCountsRef.current.dailyGoal!==dailyGoal){if(generation===exportGenerationRef.current)setPngStatus('idle');return;}
     pngPathRef.current=path;
     exportCountsRef.current={todayCount,dailyGoal};
     setPngStatus('ready');
    }catch{if(generation===exportGenerationRef.current)setPngStatus('error');}
    })();
   },{width:680,height:840});
  }catch{if(generation===exportGenerationRef.current)setPngStatus('error');}
 };
 const loggedIn=accountEmail!==null;
 const shareSupport=async()=>{try{await Share.share({message:'Ett litet steg i taget kan göra skillnad. Jag hejar på dig! 💚'});}catch{/* Delningsappen kan avbrytas eller saknas. Ingen personlig data skickas av appen. */}};
 return <View style={styles.screen}>
  <Card style={{gap:14,padding:19,backgroundColor:'#1B2416',borderColor:'#425C29'}}>
   <View style={styles.inline}><View style={[styles.actionIcon,{width:54,height:54,borderRadius:18}]}><UserRound size={27} color={C.lime}/></View><View style={{flex:1,gap:5}}><Text accessibilityRole="header" style={{color:C.white,fontWeight:'900',fontSize:20,flexShrink:1}}>{loggedIn?'Mitt konto':'Din personliga resa'}</Text><Text selectable style={[styles.muted,{flexShrink:1}]}>{accountEmail||'Följ din utveckling i din egen takt'}</Text></View></View>
   <View style={{height:1,backgroundColor:'#425C29'}}/><View style={styles.sectionRow}><Text style={[styles.muted,{flexShrink:1}]}>Kontostatus</Text><Text style={{color:loggedIn?C.lime:'#E7B967',fontWeight:'800',fontSize:13,flexShrink:1,textAlign:'right'}}>{loggedIn?'● Inloggad':'● Gästläge'}</Text></View>
  </Card>
  <View style={styles.inline}><Target size={19} color={C.lime}/><Text accessibilityRole="header" style={styles.heading}>Din resa</Text></View>
  <Pressable accessibilityRole="button" accessibilityLabel="Öppna min plan" accessibilityHint="Visar dina mål och din plan" onPress={()=>onNavigate('plan')} style={[styles.row,{minHeight:72}]}><View style={styles.actionIcon}><Target size={22} color={C.lime}/></View><View style={{flex:1,minWidth:0,gap:5}}><Text style={[styles.cardTitle,{flexShrink:1}]}>{profile.mode==='quit'?'Sluta helt':'Minska gradvis'}</Text><Text style={[styles.muted,{flexShrink:1}]}>Planstart: {date(new Date(profile.startAt))}</Text></View><ChevronRight size={20} color={C.lime}/></Pressable>
  <View style={styles.inline}><Settings size={19} color={C.lime}/><Text accessibilityRole="header" style={styles.heading}>Snabbåtkomst</Text></View>
  {quickLinks.map(item=><Pressable key={item.label} accessibilityRole="button" accessibilityLabel={item.label} accessibilityHint={item.to==='account'?(loggedIn?'Hantera inloggning, e-post och lösenord':'Logga in eller skapa konto'):item.to==='backup'?(loggedIn?'Kontrollera kontots molnsynk':'Skapa konto för att synka mellan enheter'):item.detail} onPress={()=>onNavigate(item.to)} style={styles.row}><View style={styles.actionIcon}><item.icon size={21} color={C.lime}/></View><View style={{flex:1,minWidth:0,gap:3}}><Text style={[styles.cardTitle,{flexShrink:1}]}>{item.label}</Text><Text style={[styles.muted,{flexShrink:1}]}>{item.to==='account'?(loggedIn?'Inloggning, e-post och lösenord':'Logga in eller skapa konto'):item.to==='backup'?(loggedIn?'Kontrollera kontots molnsynk':'Skapa konto för att synka mellan enheter'):item.detail}</Text></View><ChevronRight size={19} color={C.dim}/></Pressable>)}
  <Card style={{gap:12}}>
   <View style={styles.inline}><Share2 size={21} color={C.lime}/><Text accessibilityRole="header" style={[styles.cardTitle,{flexShrink:1}]}>Dela framsteg eller uppmuntran</Text></View>
   <Pressable accessibilityRole="button" accessibilityLabel={showSharePreview?'Dölj dagens framstegskort':'Förhandsgranska dagens framstegskort'} accessibilityState={{expanded:showSharePreview}} onPress={()=>{++exportGenerationRef.current;previewOpenRef.current=!previewOpenRef.current;setShowSharePreview(previewOpenRef.current);setPngStatus('idle');exportCountsRef.current=null;pngPathRef.current=null;setShareError(false);}} style={[styles.row,{minHeight:56}]}><Text style={[styles.cardTitle,{flexShrink:1}]}>{showSharePreview?'Dölj dagens framsteg':'Visa dagens framsteg'}</Text><ChevronRight size={19} color={C.dim}/></Pressable>
   {showSharePreview?<><View style={{width:'100%',maxWidth:340,aspectRatio:340/420,alignSelf:'center'}}><DailyProgressShareArtwork ref={artworkRef} todayCount={todayCount} dailyGoal={dailyGoal}/></View><Pressable accessibilityRole="button" accessibilityLabel="Förbered dagens framsteg som bild" onPress={renderPng} disabled={pngStatus==='rendering'} accessibilityState={{disabled:pngStatus==='rendering',busy:pngStatus==='rendering'}} style={[styles.row,{minHeight:56}]}><Text style={[styles.cardTitle,{flexShrink:1}]}>{pngStatus==='rendering'?'Förbereder bilden…':'Förbered bild för delning'}</Text></Pressable>{pngStatus==='rendering'?<Text accessibilityLiveRegion="polite" accessibilityRole="text" style={styles.muted}>Bilden förbereds. Vänta tills den är klar innan du delar.</Text>:null}{pngStatus==='ready'&&exportCountsRef.current?.todayCount===todayCount&&exportCountsRef.current?.dailyGoal===dailyGoal?<><Text accessibilityLiveRegion="polite" style={styles.muted}>Bilden är klar. Tryck på Dela bilden och välj själv mottagare, eller avbryt.</Text><Pressable accessibilityRole="button" accessibilityLabel="Dela PNG-bild av dagens framsteg" accessibilityHint="Öppnar Androids delningsdialog för den förhandsgranskade bilden" onPress={()=>void sharePng()} disabled={sharingPng} accessibilityState={{disabled:sharingPng,busy:sharingPng}} style={[styles.row,{minHeight:56}]}><Share2 size={21} color={C.lime}/><Text style={[styles.cardTitle,{flexShrink:1}]}>{sharingPng?'Öppnar delning…':'Dela bilden'}</Text></Pressable>{shareError?<Text accessibilityLiveRegion="polite" style={styles.muted}>Det gick inte att öppna bilddelningen. Försök igen.</Text>:null}</>:pngStatus==='ready'?<Text accessibilityLiveRegion="polite" style={styles.muted}>Dagens värden har ändrats. Förbered bilden på nytt innan du delar.</Text>:pngStatus==='error'?<Text accessibilityLiveRegion="polite" style={styles.muted}>Det gick inte att skapa bilden. Försök igen.</Text>:null}<Text style={styles.muted}>Bilden innehåller bara dagens antal och mål, utan namn eller kontouppgifter. Inget skickas förrän du själv väljer att dela.</Text></>:null}
   <Text style={styles.muted}>Du kan också dela en allmän uppmuntran utan personliga uppgifter.</Text>
   <Text style={styles.muted}>Du kan alltid avbryta delningen. Appen du väljer kan ha egna integritetsvillkor.</Text>
   <Pressable accessibilityRole="button" accessibilityLabel="Dela ett stödmeddelande" accessibilityHint="Öppnar telefonens delningsdialog där du själv väljer mottagare eller avbryter. Inga personliga registreringar följer med." onPress={()=>void shareSupport()} style={[styles.row,{minHeight:56}]}><View style={styles.actionIcon}><Share2 size={21} color={C.lime}/></View><View style={{flex:1}}><Text style={styles.cardTitle}>Dela en uppmuntran</Text></View><ChevronRight size={19} color={C.dim}/></Pressable>
  </Card>
 </View>;
}
const styles=StyleSheet.create({
 screen:{gap:20},
 inline:{flexDirection:'row',alignItems:'center',gap:14},sectionRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12},
 muted:{fontSize:13,lineHeight:19,color:C.dim},cardTitle:{fontSize:16,fontWeight:'800',color:C.white},heading:{fontSize:19,fontWeight:'800',color:C.white},
 actionIcon:{width:42,height:42,borderRadius:13,backgroundColor:C.limeSoft,alignItems:'center',justifyContent:'center'},
 planAction:{minWidth:48,minHeight:48,alignItems:'center',justifyContent:'center'},
 row:{minHeight:64,flexDirection:'row',alignItems:'center',gap:14,borderRadius:17,backgroundColor:C.surface,borderWidth:1,borderColor:C.border,paddingHorizontal:15,paddingVertical:15}

});
