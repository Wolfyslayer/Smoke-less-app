import React from 'react';
import {Animated,Pressable,StyleSheet,Text,View} from 'react-native';
import {Wind} from 'lucide-react-native';
import {C} from '../theme';

type Idea={title:string;detail:string};
type Props={
 breathScale:Animated.Value;breathing:boolean;breathSeconds:number;onToggleBreathing:()=>void;
 hapticsEnabled:boolean;onToggleHaptics:()=>void;
 sosIdeas:Idea[];sosTip:number;onNextTip:()=>void;
 sosTimer:number;sosTimerActive:boolean;onToggleTimer:()=>void;onResetTimer:()=>void;
 sosStartIntensity:number|null;intensity:number;onStartIntensity:(n:number)=>void;onIntensity:(n:number)=>void;
 trigger:string;onTrigger:(value:string)=>void;onSave:()=>void;
};
const triggerGuidance:Record<string,string>={
 Stress:'Prova att andas lugnt och ge dig själv en kort paus innan du bestämmer nästa steg.',
 'Efter mat':'Testa att borsta tänderna, dricka vatten eller ta en kort promenad efter måltiden.',
 Socialt:'Om du kan, byt plats en stund eller berätta för någon att du försöker minska rökningen.',
 Vana:'Välj en liten ersättningsrutin som du kan upprepa nästa gång suget dyker upp.',
 Annat:'Lägg märke till vad som hände precis innan suget. Välj sedan ett tips som passar dig.'
};
function Card({children,style}:{children:React.ReactNode;style?:any}){return <View style={[styles.card,style]}>{children}</View>}
function Label({children}:{children:React.ReactNode}){return <Text style={styles.label}>{children}</Text>}
function Heading({children}:{children:React.ReactNode}){return <Text style={styles.heading}>{children}</Text>}
function Button({title,onPress,secondary=false}:{title:string;onPress:()=>void;secondary?:boolean}){return <Pressable accessibilityRole="button" onPress={onPress} style={[styles.button,secondary&&styles.buttonSecondary]}><Text style={[styles.buttonText,secondary&&{color:C.white}]}>{title}</Text></Pressable>}
function Intensity({value,onChange,prefix}:{value:number|null;onChange:(n:number)=>void;prefix:string}){return <View style={styles.segment}>{[1,2,3,4,5].map(n=><Pressable key={n} accessibilityRole="button" accessibilityLabel={`${prefix} ${n} av 5`} accessibilityState={{selected:value===n}} onPress={()=>onChange(n)} style={[styles.segmentItem,value===n&&{backgroundColor:C.lime}]}><Text style={{color:value===n?C.background:C.white,fontWeight:'800'}}>{n}</Text></Pressable>)}</View>}
export function SOSScreen({breathScale,breathing,breathSeconds,onToggleBreathing,hapticsEnabled,onToggleHaptics,sosIdeas,sosTip,onNextTip,sosTimer,sosTimerActive,onToggleTimer,onResetTimer,sosStartIntensity,intensity,onStartIntensity,onIntensity,trigger,onTrigger,onSave}:Props){
 return <View style={styles.screen}>
  <Card style={{alignItems:'center',gap:15,paddingVertical:22,backgroundColor:'#171D10',borderColor:'#425C29'}}>
   <Label>TA ETT ANDETAG I TAGET</Label>
   <Animated.View style={[styles.breathCircle,{transform:[{scale:breathScale.interpolate({inputRange:[0,1],outputRange:[0.82,1.12]})}]}]}><Wind size={42} color={C.lime}/><Text style={styles.cardTitle}>{!breathing?'Hitta ditt lugn':breathSeconds%12<4?'Andas in':breathSeconds%12<6?'Håll':'Andas ut'}</Text><Text style={styles.muted}>{breathing?(breathSeconds%12<4?'4 sekunder':breathSeconds%12<6?'2 sekunder':'6 sekunder'):'4 in · 2 håll · 6 ut'}</Text></Animated.View>
   <Text style={[styles.subhead,{textAlign:'center'}]}>Du behöver inte bestämma något just nu.</Text>
   <View style={{width:'100%'}}><Button title={breathing?'Avsluta övning':'Starta andningsövning'} onPress={onToggleBreathing}/><Pressable accessibilityRole="switch" accessibilityLabel="Vibration under andningsövningen" accessibilityState={{checked:hapticsEnabled}} onPress={onToggleHaptics} style={[styles.sectionRow,{paddingVertical:8}]}><Text style={styles.muted}>Diskreta vibrationer</Text><Text style={{color:C.lime,fontWeight:'800'}}>{hapticsEnabled?'På':'Av'}</Text></Pressable></View>
  </Card>
  <Heading>Ta dig igenom röksuget</Heading>
  <Card style={{gap:9}}><Label>DIN PLAN JUST NU</Label><Text style={styles.cardTitle}>Tre små steg</Text><Text style={styles.muted}>1. Lägg undan cigaretterna och stanna där du är en stund.</Text><Text style={styles.muted}>2. Andas lugnt eller starta tvåminuterspausen ovan.</Text><Text style={styles.muted}>3. Välj ett konkret tips nedan och känn efter igen. Om det känns svårt kan du kontakta någon du litar på.</Text></Card>
  <Card style={{gap:10}}><Label>EN SAK I TAGET</Label><Text style={styles.cardTitle}>{sosIdeas[sosTip].title}</Text><Text style={styles.muted}>{sosIdeas[sosTip].detail}</Text><Button title="Visa ett annat tips" secondary onPress={onNextTip}/></Card>
  <Card style={{gap:10}}><Label>TVÅ MINUTERS PAUS</Label><Text accessibilityRole="timer" accessibilityLabel={`Tid kvar: ${Math.floor(sosTimer/60)} minuter och ${sosTimer%60} sekunder`} style={styles.statValue}>{Math.floor(sosTimer/60)}:{String(sosTimer%60).padStart(2,'0')}</Text><Text style={styles.muted}>En kort paus kan hjälpa dig att välja nästa steg. Du kan avbryta när som helst.</Text><Button title={sosTimerActive?'Pausa':'Starta två minuter'} onPress={onToggleTimer}/>{sosTimer>0?<Button title="Återställ" secondary onPress={onResetTimer}/>:null}</Card>
  <Heading>Följ upp ditt röksug</Heading>
  <Card style={{gap:10}}><Text style={styles.muted}>Välj hur starkt röksuget var när du började, och jämför med hur det känns nu.</Text><Text style={styles.cardTitle}>Vid start</Text><Intensity prefix="Röksug vid start" value={sosStartIntensity} onChange={onStartIntensity}/><Text style={styles.cardTitle}>Just nu</Text><Intensity prefix="Röksug just nu" value={intensity} onChange={onIntensity}/>{sosStartIntensity!==null?<Text style={styles.muted}>{intensity<sosStartIntensity?'Röksuget känns mindre starkt nu. Bra att du gav dig själv en paus.':intensity===sosStartIntensity?'Röksuget är oförändrat. Det är okej – prova gärna ett annat tips.':'Röksuget känns starkare just nu. Fortsätt i din takt och sök stöd om du behöver.'}</Text>:null}</Card>
  <Heading>Vad utlöste det?</Heading>
  <View style={{gap:9}}>{['Stress','Efter mat','Socialt','Vana','Annat'].map(x=><Pressable accessibilityRole="button" accessibilityLabel={`Utlösare: ${x}`} accessibilityState={{selected:trigger===x}} key={x} onPress={()=>onTrigger(x)} style={[styles.choice,trigger===x&&styles.selected]}><Text style={styles.cardTitle}>{x}</Text></Pressable>)}</View>
  <Card style={{gap:9}}><Label>ETT TIPS FÖR DIN SITUATION</Label><Text style={styles.muted}>{triggerGuidance[trigger]??triggerGuidance.Annat}</Text></Card>
  <Button title="Spara röksug" onPress={onSave}/>
 </View>;
}
const styles=StyleSheet.create({
 screen:{gap:20},card:{backgroundColor:C.elevated,borderRadius:20,borderWidth:1,borderColor:C.border,padding:17,gap:8},
 label:{fontSize:11,fontWeight:'800',letterSpacing:1.5,color:C.lime},heading:{fontSize:19,fontWeight:'800',color:C.white},
 cardTitle:{fontSize:16,fontWeight:'800',color:C.white},subhead:{fontSize:16,fontWeight:'700',color:C.white},
 statValue:{fontSize:26,fontWeight:'800',color:C.white},muted:{fontSize:13,lineHeight:19,color:C.dim},
 breathCircle:{width:205,height:205,borderRadius:103,backgroundColor:C.limeSoft,borderWidth:2,borderColor:C.lime,alignItems:'center',justifyContent:'center',gap:9},
 sectionRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10},
 segment:{flexDirection:'row',gap:5,padding:5,backgroundColor:C.elevated,borderRadius:15},segmentItem:{flex:1,paddingVertical:11,borderRadius:11,alignItems:'center'},
 button:{backgroundColor:C.lime,borderRadius:14,minHeight:49,alignItems:'center',justifyContent:'center',paddingHorizontal:14,marginTop:5},buttonSecondary:{backgroundColor:C.soft},
 buttonText:{fontWeight:'800',color:C.background,fontSize:14},choice:{padding:17,borderRadius:16,backgroundColor:C.elevated,borderWidth:1,borderColor:C.border},selected:{borderColor:C.lime,backgroundColor:C.limeSoft},
});
