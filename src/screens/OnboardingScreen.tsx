import React,{useEffect,useRef,useState} from 'react';
import {Animated,Image,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {C} from '../theme';
import type {Mode,Speed} from '../domain';
import {AppCard,AppButton} from '../components/ui';
import {OnboardingField,OnboardingChoice} from '../components/OnboardingControls';
import {CompactDateModal} from '../components/CompactDateModal';

export function OnboardingScreen({onStep,setOnStep,mode,setMode,speed,setSpeed,scheduled,setScheduled,quitDay,setQuitDay,baseline,setBaseline,packSize,setPackSize,packPrice,setPackPrice,begin}:{
 onStep:number;setOnStep:React.Dispatch<React.SetStateAction<number>>;
 mode:Mode;setMode:React.Dispatch<React.SetStateAction<Mode>>;
 speed:Speed;setSpeed:React.Dispatch<React.SetStateAction<Speed>>;
 scheduled:boolean;setScheduled:(value:boolean)=>void;quitDay:string;setQuitDay:(value:string)=>void;
 baseline:string;setBaseline:(value:string)=>void;
 packSize:string;setPackSize:(value:string)=>void;
 packPrice:string;setPackPrice:(value:string)=>void;
 begin:()=>void;
}){
 const insets=useSafeAreaInsets();
 const [datePickerOpen,setDatePickerOpen]=useState(false);
 const [benefitIndex,setBenefitIndex]=useState(0);
 const [benefitWidth,setBenefitWidth]=useState(300);
 const slideX=useRef(new Animated.Value(0)).current;
 const benefits=['Varje liten förändring räknas.','Följ dina framsteg, dag för dag.','Få stöd när röksuget kommer.','Ta kontroll i din egen takt.'];
 useEffect(()=>{
  if(onStep!==0)return;
  slideX.setValue(benefitIndex===0?0:benefitWidth);
  if(benefitIndex!==0)Animated.timing(slideX,{toValue:0,duration:550,useNativeDriver:true}).start();
  const timer=setTimeout(()=>setBenefitIndex(i=>(i+1)%benefits.length),3500);
  return ()=>{clearTimeout(timer);slideX.stopAnimation();};
 },[onStep,benefitIndex,benefitWidth,slideX]);
 return <><ScrollView style={styles.root} contentContainerStyle={{paddingHorizontal:24,paddingTop:Math.max(insets.top,30)+20,paddingBottom:40,gap:22}} keyboardShouldPersistTaps="handled"><Label>SMOKE LESS</Label><View style={styles.welcomeArt}><View style={styles.artOuter}><View style={styles.artInner}><Image source={require('../../assets/branding/adaptive-icon-foreground.png')} resizeMode="contain" style={styles.brandLogo} accessibilityLabel="Smoke Less-logotyp"/></View></View></View><Text style={styles.display}>{['Ta tillbaka\nkontrollen.','Välj din\nväg.','Dina vanor.','Din nya\nstart.'][onStep]}</Text>{onStep===0?<View style={styles.benefitArea}><View style={styles.benefitWindow} onLayout={event=>setBenefitWidth(event.nativeEvent.layout.width)}><Animated.Text accessibilityLiveRegion="polite" style={[styles.benefitLine,{transform:[{translateX:slideX}]}]}>{benefits[benefitIndex]}</Animated.Text></View><View style={styles.benefitDots}>{benefits.map((_,i)=><View key={i} style={[styles.benefitDot,i===benefitIndex&&styles.benefitDotActive]}/>)}</View></View>:<Text style={styles.subhead}>{['','Du bestämmer hur din resa ska se ut.','Vi använder dina uppgifter för att skapa en personlig plan.','Du är redo att ta första steget.'][onStep]}</Text>}<View style={styles.progressTrack}><View style={[styles.progressFill,{width:((onStep+1)*25)+'%' as `${number}%`}]}/></View>{onStep===1?<View style={{gap:12}}>
 <OnboardingChoice title="Minska gradvis" subtitle="Trappa ner steg för steg i en takt som passar dig." selected={mode==='reduce'&&!scheduled} onPress={()=>{setMode('reduce');setScheduled(false);}}/>
 {mode==='reduce'&&!scheduled?<View style={styles.dateOptions}><Text style={styles.dateHeading}>Välj din takt</Text><OnboardingChoice title="Lugn takt" subtitle="Minska med en cigarett per vecka." selected={speed==='gentle'} onPress={()=>setSpeed('gentle')}/><OnboardingChoice title="Balanserad takt" subtitle="Minska med en cigarett var fjärde dag." selected={speed==='balanced'} onPress={()=>setSpeed('balanced')}/><OnboardingChoice title="Snabb takt" subtitle="Minska med en cigarett varannan dag." selected={speed==='fast'} onPress={()=>setSpeed('fast')}/></View>:null}
 <OnboardingChoice title="Sluta helt" subtitle="Sätt målet till noll cigaretter från första dagen." selected={mode==='quit'} onPress={()=>{setMode('quit');setScheduled(false);}}/>
 <OnboardingChoice title="Välj eget datum" subtitle="Välj när du vill vara rökfri, så anpassas nedtrappningen automatiskt till datumet." selected={mode==='reduce'&&scheduled} onPress={()=>{setMode('reduce');setScheduled(true);}}/>
 {mode==='reduce'&&scheduled?<View style={styles.dateOptions}><Text style={styles.dateHeading}>När vill du vara rökfri?</Text><Pressable accessibilityRole="button" onPress={()=>setDatePickerOpen(true)} style={styles.dateSelect}><Text style={styles.dateOptionText}>{quitDay||'Välj stoppdatum i kalendern'}</Text></Pressable><Text style={styles.dateHint}>Ditt dagsmål minskar automatiskt mot noll på det valda datumet.</Text></View>:null}
 </View>:null}{onStep===2?<View style={{gap:15}}><OnboardingField label="Cigaretter per dag" value={baseline} onChange={setBaseline}/><OnboardingField label="Cigaretter per paket" value={packSize} onChange={setPackSize}/><OnboardingField label="Pris per paket (kr)" value={packPrice} onChange={setPackPrice}/></View>:null}{onStep===3?<AppCard><Label>DIN STARTPUNKT</Label><View style={styles.startValueRow}><Text style={styles.statValue}>{baseline}</Text><Text style={styles.startValueUnit}>cigaretter/dag</Text></View><Text style={styles.muted}>{mode==='quit'?'Mål: rökfri från start':scheduled?`Planerat stopp: ${quitDay||'Välj datum'}`:speed==='gentle'?'Lugn nedtrappning':speed==='fast'?'Snabb nedtrappning':'Balanserad nedtrappning'} · {packPrice} kr/paket</Text></AppCard>:null}<AppButton title={onStep===3?'Starta min resa':onStep===0?'Kom igång':'Fortsätt'} onPress={()=>{if(onStep===3){begin();return;}if(onStep===1&&mode==='reduce'&&scheduled&&!quitDay){setDatePickerOpen(true);return;}setOnStep(v=>v+1);}}/>{onStep>0?<AppButton title="Tillbaka" secondary onPress={()=>setOnStep(v=>v-1)}/>:null}</ScrollView><CompactDateModal visible={datePickerOpen&&onStep===1&&scheduled&&mode==='reduce'} value={/^\d{4}-\d{2}-\d{2}$/.test(quitDay)?new Date(quitDay+'T12:00:00'):null} onCancel={()=>setDatePickerOpen(false)} onConfirm={date=>{setQuitDay(date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0'));setDatePickerOpen(false);}}/></>;
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
 dateSelect:{backgroundColor:C.elevated,borderColor:C.border,borderWidth:1,borderRadius:12,minHeight:48,paddingHorizontal:14,justifyContent:'center'},
 dateOptions:{gap:12,padding:14,borderRadius:16,backgroundColor:C.surface},
 dateHeading:{color:C.white,fontSize:16,fontWeight:'800'},
 dateOption:{minHeight:44,justifyContent:'center'},
 dateOptionText:{color:C.white,fontSize:14},
 dateHint:{color:C.muted,fontSize:12},
 eyebrow:{fontSize:11,color:C.muted,fontWeight:'800',letterSpacing:1.7},
 display:{fontSize:44,fontWeight:'900',letterSpacing:-1.8,lineHeight:48,color:C.white},
 subhead:{fontSize:16,color:C.muted,lineHeight:24},
 startValueRow:{flexDirection:'row',alignItems:'baseline',flexWrap:'wrap',columnGap:10,rowGap:4,minHeight:38},
 statValue:{fontSize:28,lineHeight:38,fontWeight:'900',color:C.white,letterSpacing:-.5,includeFontPadding:true},
 startValueUnit:{fontSize:15,lineHeight:24,color:C.muted,includeFontPadding:true},
 muted:{fontSize:13,color:C.muted,lineHeight:20},
 welcomeArt:{height:220,borderRadius:30,backgroundColor:'#171D10',alignItems:'center',justifyContent:'center',overflow:'hidden'},
 artOuter:{width:190,height:190,borderWidth:2,borderColor:'#485E1B',borderRadius:100,alignItems:'center',justifyContent:'center'},
 artInner:{width:135,height:135,borderRadius:90,backgroundColor:C.limeSoft,borderWidth:12,borderColor:C.lime,alignItems:'center',justifyContent:'center'},
 progressTrack:{height:5,borderRadius:4,backgroundColor:C.soft,overflow:'hidden'},
 progressFill:{height:'100%',backgroundColor:C.lime,borderRadius:4}
});
