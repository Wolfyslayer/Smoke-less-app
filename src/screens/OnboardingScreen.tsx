import React,{useEffect,useRef,useState} from 'react';
import {Animated,Image,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {C} from '../theme';
import type {Mode} from '../domain';
import {AppCard,AppButton} from '../components/ui';
import {OnboardingField,OnboardingChoice} from '../components/OnboardingControls';

export function OnboardingScreen({onStep,setOnStep,mode,setMode,scheduled,setScheduled,quitDay,setQuitDay,baseline,setBaseline,packSize,setPackSize,packPrice,setPackPrice,begin}:{
 onStep:number;setOnStep:React.Dispatch<React.SetStateAction<number>>;
 mode:Mode;setMode:React.Dispatch<React.SetStateAction<Mode>>;
 scheduled:boolean;setScheduled:(value:boolean)=>void;quitDay:string;setQuitDay:(value:string)=>void;
 baseline:string;setBaseline:(value:string)=>void;
 packSize:string;setPackSize:(value:string)=>void;
 packPrice:string;setPackPrice:(value:string)=>void;
 begin:()=>void;
}){
 const insets=useSafeAreaInsets();
 const [benefitIndex,setBenefitIndex]=useState(0);
 const [benefitWidth,setBenefitWidth]=useState(300);
 const slideX=useRef(new Animated.Value(0)).current;
 const benefits=['Varje liten förändring räknas.','Följ dina framsteg, dag för dag.','Få stöd när röksuget kommer.','Ta kontroll i din egen takt.'];
 useEffect(()=>{
  if(onStep!==0)return;
  let active=true;
  const timer=setTimeout(()=>{
   slideX.setValue(benefitWidth);
   Animated.timing(slideX,{toValue:0,duration:550,useNativeDriver:true}).start(({finished})=>{
    if(active && finished)setBenefitIndex(i=>(i+1)%benefits.length);
   });
  },3000);
  return ()=>{active=false;clearTimeout(timer);slideX.stopAnimation();};
 },[onStep,benefitIndex,benefitWidth,slideX]);
 return <ScrollView style={styles.root} contentContainerStyle={{paddingHorizontal:24,paddingTop:Math.max(insets.top,30)+20,paddingBottom:40,gap:22}} keyboardShouldPersistTaps="handled"><Label>SMOKE LESS</Label><View style={styles.welcomeArt}><View style={styles.artOuter}><View style={styles.artInner}><Image source={require('../../assets/branding/adaptive-icon-foreground.png')} resizeMode="contain" style={styles.brandLogo} accessibilityLabel="Smoke Less-logotyp"/></View></View></View><Text style={styles.display}>{['Ta tillbaka\nkontrollen.','Välj din\nväg.','Dina vanor.','Din nya\nstart.'][onStep]}</Text>{onStep===0?<View style={styles.benefitArea}><View style={styles.benefitWindow} onLayout={event=>setBenefitWidth(event.nativeEvent.layout.width)}><Animated.Text accessibilityLiveRegion="polite" style={[styles.benefitLine,{transform:[{translateX:slideX}]}]}>{benefits[benefitIndex]}</Animated.Text></View><View style={styles.benefitDots}>{benefits.map((_,i)=><View key={i} style={[styles.benefitDot,i===benefitIndex&&styles.benefitDotActive]}/>)}</View></View>:<Text style={styles.subhead}>{['','Du bestämmer hur din resa ska se ut.','Vi använder dina uppgifter för att skapa en personlig plan.','Du är redo att ta första steget.'][onStep]}</Text>}<View style={styles.progressTrack}><View style={[styles.progressFill,{width:((onStep+1)*25)+'%' as `${number}%`}]}/></View>{onStep===1?<View style={{gap:12}}><OnboardingChoice title="Minska gradvis" subtitle="Trappa ner steg för steg med en personlig plan." selected={mode==='reduce'} onPress={()=>setMode('reduce')}/><OnboardingChoice title="Sluta helt" subtitle="Följ din resa mot ett rökfritt liv." selected={mode==='quit'} onPress={()=>setMode('quit')}/>{mode==='reduce'?<View style={styles.dateOptions}><Text style={styles.dateHeading}>Ditt stoppdatum</Text><Pressable accessibilityRole="radio" accessibilityState={{selected:!scheduled}} onPress={()=>setScheduled(false)} style={styles.dateOption}><Text style={styles.dateOptionText}>{!scheduled?'●':'○'} Anpassa takten efter hand</Text></Pressable><Pressable accessibilityRole="radio" accessibilityState={{selected:scheduled}} onPress={()=>setScheduled(true)} style={styles.dateOption}><Text style={styles.dateOptionText}>{scheduled?'●':'○'} Välj eget stoppdatum</Text></Pressable>{scheduled?<View style={{gap:6}}><OnboardingField label="Stoppdatum (ÅÅÅÅ-MM-DD)" value={quitDay} onChange={setQuitDay} keyboardType="default"/><Text style={styles.dateHint}>Ange ett framtida datum, exempelvis 2027-03-16.</Text></View>:null}</View>:null}</View>:null}{onStep===2?<View style={{gap:15}}><OnboardingField label="Cigaretter per dag" value={baseline} onChange={setBaseline}/><OnboardingField label="Cigaretter per paket" value={packSize} onChange={setPackSize}/><OnboardingField label="Pris per paket (kr)" value={packPrice} onChange={setPackPrice}/></View>:null}{onStep===3?<AppCard><Label>DIN STARTPUNKT</Label><Text style={styles.statValue}>{baseline} <Text style={styles.muted}>cigaretter/dag</Text></Text><Text style={styles.muted}>{mode==='quit'?'Mål: rökfri från start':'Balanserad nedtrappning'} · {packPrice} kr/paket</Text></AppCard>:null}<AppButton title={onStep===3?'Starta min resa':onStep===0?'Kom igång':'Fortsätt'} onPress={()=>onStep===3?begin():setOnStep(v=>v+1)}/>{onStep>0?<AppButton title="Tillbaka" secondary onPress={()=>setOnStep(v=>v-1)}/>:null}</ScrollView>;
}
function Label({children}:{children:React.ReactNode}){return <Text style={styles.eyebrow}>{children}</Text>}
const styles=StyleSheet.create({
 root:{flex:1,backgroundColor:C.background},
 brandLogo:{width:225,height:225},
 benefitArea:{gap:10},
 benefitWindow:{height:32,overflow:'hidden',justifyContent:'center'},
 benefitLine:{fontSize:16,color:C.muted,lineHeight:24},
 benefitDots:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7},
 benefitDot:{width:6,height:6,borderRadius:3,backgroundColor:C.dim},
 benefitDotActive:{width:18,backgroundColor:C.lime},
 dateOptions:{gap:12,padding:14,borderRadius:16,backgroundColor:C.surface},
 dateHeading:{color:C.white,fontSize:16,fontWeight:'800'},
 dateOption:{minHeight:44,justifyContent:'center'},
 dateOptionText:{color:C.white,fontSize:14},
 dateHint:{color:C.muted,fontSize:12},
 eyebrow:{fontSize:11,color:C.muted,fontWeight:'800',letterSpacing:1.7},
 display:{fontSize:44,fontWeight:'900',letterSpacing:-1.8,lineHeight:48,color:C.white},
 subhead:{fontSize:16,color:C.muted,lineHeight:24},
 statValue:{fontSize:25,fontWeight:'900',color:C.white,letterSpacing:-1},
 muted:{fontSize:13,color:C.muted,lineHeight:20},
 welcomeArt:{height:220,borderRadius:30,backgroundColor:'#171D10',alignItems:'center',justifyContent:'center',overflow:'hidden'},
 artOuter:{width:190,height:190,borderWidth:2,borderColor:'#485E1B',borderRadius:100,alignItems:'center',justifyContent:'center'},
 artInner:{width:135,height:135,borderRadius:90,backgroundColor:C.limeSoft,borderWidth:12,borderColor:C.lime,alignItems:'center',justifyContent:'center'},
 progressTrack:{height:5,borderRadius:4,backgroundColor:C.soft,overflow:'hidden'},
 progressFill:{height:'100%',backgroundColor:C.lime,borderRadius:4}
});
