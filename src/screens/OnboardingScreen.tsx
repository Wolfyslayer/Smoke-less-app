import {JourneyLandscape} from '../components/JourneyLandscape';
import {BrandMark} from '../components/BrandMark';
import {parseOnboardingNumbers} from '../utils/onboardingValidation';
import React,{useState} from 'react';
import {Image,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useThemeStyles,type ThemeColors} from '../theme';
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
 const styles=useThemeStyles(createStyles);

 const insets=useSafeAreaInsets();
 const [datePickerOpen,setDatePickerOpen]=useState(false);
 const [speedOpen,setSpeedOpen]=useState(false);
 const [economyOpen,setEconomyOpen]=useState(false);
 const [fieldError,setFieldError]=useState('');
 return <><ScrollView style={styles.root} contentContainerStyle={{paddingLeft:Math.max(insets.left,24),paddingRight:Math.max(insets.right,24),paddingTop:Math.max(insets.top,24)+8,paddingBottom:24,gap:18}} keyboardShouldPersistTaps="handled"><Label>SMOKE LESS</Label>{onStep===0?<View style={styles.welcomeArt}><JourneyLandscape/><View style={{alignItems:'center',gap:8}}><BrandMark size={76}/><Text style={styles.brandName}>Smoke Less</Text><Text style={styles.muted}>Din väg till ett rökfritt liv</Text></View></View>:null}<Text accessibilityRole="header" style={styles.display}>{['Varje liten förändring räknas.','Välj din\nväg.','Dina vanor.','Din nya\nstart.'][onStep]}</Text><Text style={styles.subhead}>{['Följ din dag och hitta stöd vid röksug. Du kan börja utan konto.','Välj ett mål. Du kan ändra planen senare.','Ange din vanliga nivå. Ekonomiuppgifter är frivilliga.','Kontrollera din plan och börja i din egen takt.'][onStep]}</Text><View accessible accessibilityRole="progressbar" accessibilityValue={{min:1,max:4,now:onStep+1,text:`Steg ${onStep+1} av 4`}} style={styles.progressTrack}><View style={[styles.progressFill,{width:((onStep+1)*25)+'%' as `${number}%`}]}/></View>{onStep===1?<View style={{gap:12}}>
 <OnboardingChoice title="Minska gradvis" subtitle="Trappa ner steg för steg i en takt som passar dig." selected={mode==='reduce'&&!scheduled} onPress={()=>{setMode('reduce');setScheduled(false);}}/>
 {mode==='reduce'&&!scheduled?<View style={styles.dateOptions}><Text style={styles.muted}>{speed==='gentle'?'Vald takt: lugn':speed==='fast'?'Vald takt: snabb':'Vald takt: balanserad'}</Text><Pressable accessibilityRole="button" accessibilityState={{expanded:speedOpen}} onPress={()=>setSpeedOpen(v=>!v)} style={styles.dateSelect}><Text style={styles.dateOptionText}>{speedOpen?'Dölj taktval':'Välj annan takt'}</Text></Pressable>{speedOpen?<View style={{gap:12}}><Text style={styles.dateHeading}>Välj din takt</Text><OnboardingChoice title="Lugn takt" subtitle="Minska med en cigarett per vecka." selected={speed==='gentle'} onPress={()=>setSpeed('gentle')}/><OnboardingChoice title="Balanserad takt" subtitle="Minska med en cigarett var fjärde dag." selected={speed==='balanced'} onPress={()=>setSpeed('balanced')}/><OnboardingChoice title="Snabb takt" subtitle="Minska med en cigarett varannan dag." selected={speed==='fast'} onPress={()=>setSpeed('fast')}/></View>:null}</View>:null}
 <OnboardingChoice title="Sluta helt" subtitle="Sätt målet till noll cigaretter från första dagen." selected={mode==='quit'} onPress={()=>{setMode('quit');setScheduled(false);}}/>
 <OnboardingChoice title="Välj eget datum" subtitle="Välj när du vill vara rökfri, så anpassas nedtrappningen automatiskt till datumet." selected={mode==='reduce'&&scheduled} onPress={()=>{setMode('reduce');setScheduled(true);}}/>
 {mode==='reduce'&&scheduled?<View style={styles.dateOptions}><Text style={styles.dateHeading}>När vill du vara rökfri?</Text><Pressable accessibilityRole="button" onPress={()=>setDatePickerOpen(true)} style={styles.dateSelect}><Text style={styles.dateOptionText}>{quitDay||'Välj stoppdatum i kalendern'}</Text></Pressable><Text style={styles.dateHint}>Ditt dagsmål minskar automatiskt mot noll på det valda datumet.</Text></View>:null}
 </View>:null}{onStep===2?<View style={{gap:15}}><OnboardingField label="Cigaretter per dag" value={baseline} onChange={setBaseline}/><Text style={styles.muted}>Paketstorlek 20 och pris 0 kr används tills du anger egna uppgifter. Med pris 0 beräknas ingen ekonomisk besparing.</Text><Pressable accessibilityRole="button" accessibilityState={{expanded:economyOpen}} onPress={()=>setEconomyOpen(v=>!v)} style={styles.dateSelect}><Text style={styles.dateOptionText}>{economyOpen?'Dölj ekonomiuppgifter':'Lägg till ekonomi (frivilligt)'}</Text></Pressable>{economyOpen?<View style={{gap:15}}><OnboardingField label="Cigaretter per paket" value={packSize} onChange={setPackSize}/><OnboardingField label="Pris per paket (kr)" value={packPrice} onChange={setPackPrice}/></View>:null}</View>:null}{onStep===3?<AppCard><Label>DIN STARTPUNKT</Label><View style={styles.startValueRow}><Text style={styles.statValue}>{baseline}</Text><Text style={styles.startValueUnit}>cigaretter/dag</Text></View><Text style={styles.muted}>{mode==='quit'?'Mål: rökfri från start':scheduled?`Planerat stopp: ${quitDay||'Välj datum'}`:speed==='gentle'?'Lugn nedtrappning':speed==='fast'?'Snabb nedtrappning':'Balanserad nedtrappning'} · {packPrice} kr/paket</Text></AppCard>:null}{fieldError?<Text accessibilityRole="alert" style={styles.muted}>{fieldError}</Text>:null}<AppButton title={onStep===3?'Starta min resa':onStep===0?'Kom igång':'Fortsätt'} onPress={()=>{setFieldError('');if(onStep===2&&!parseOnboardingNumbers(baseline,packSize,packPrice)){setFieldError('Ange 0–200 cigaretter per dag. Paketstorlek ska vara 1–200 och pris 0–100000 kr.');return;}if(onStep===3){begin();return;}if(onStep===1&&mode==='reduce'&&scheduled&&!quitDay){setDatePickerOpen(true);return;}setOnStep(v=>v+1);}}/>{onStep>0?<AppButton title="Tillbaka" secondary onPress={()=>{setFieldError('');setOnStep(v=>v-1);}}/>:null}</ScrollView><CompactDateModal visible={datePickerOpen&&onStep===1&&scheduled&&mode==='reduce'} value={/^\d{4}-\d{2}-\d{2}$/.test(quitDay)?new Date(quitDay+'T12:00:00'):null} onCancel={()=>setDatePickerOpen(false)} onConfirm={date=>{setQuitDay(date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0'));setDatePickerOpen(false);}}/></>;
}
function Label({children}:{children:React.ReactNode}){
 const styles=useThemeStyles(createStyles);
return <Text style={styles.eyebrow}>{children}</Text>}
const createStyles=(C:ThemeColors)=>StyleSheet.create({
 root:{flex:1,backgroundColor:C.background},
 brandLogo:{width:225,height:225},
 dateSelect:{backgroundColor:C.elevated,borderColor:C.border,borderWidth:1,borderRadius:12,minHeight:48,paddingHorizontal:14,justifyContent:'center'},
 dateOptions:{gap:12,padding:14,borderRadius:16,backgroundColor:C.surface},
 dateHeading:{color:C.white,fontSize:16,fontWeight:'800'},
 dateOption:{minHeight:48,justifyContent:'center'},
 dateOptionText:{color:C.white,fontSize:14},
 dateHint:{color:C.muted,fontSize:12},
 eyebrow:{fontSize:11,color:C.muted,fontWeight:'800',letterSpacing:1.7},
 display:{fontSize:30,fontWeight:'900',letterSpacing:-1.8,lineHeight:37,color:C.white},
 subhead:{fontSize:16,color:C.muted,lineHeight:24},
 startValueRow:{flexDirection:'row',alignItems:'baseline',flexWrap:'wrap',columnGap:10,rowGap:4,minHeight:38},
 statValue:{fontSize:28,lineHeight:38,fontWeight:'900',color:C.white,letterSpacing:-.5,includeFontPadding:true},
 startValueUnit:{fontSize:15,lineHeight:24,color:C.muted,includeFontPadding:true},
 muted:{fontSize:15,color:C.muted,lineHeight:23},
 brandName:{fontSize:28,fontWeight:'800',color:C.text},
 welcomeArt:{height:250,borderRadius:16,backgroundColor:C.accentSubtle,alignItems:'center',justifyContent:'center',overflow:'hidden'},
 artOuter:{width:190,height:190,borderWidth:2,borderColor:C.accent,borderRadius:100,alignItems:'center',justifyContent:'center'},
 artInner:{width:135,height:135,borderRadius:90,backgroundColor:C.limeSoft,borderWidth:12,borderColor:C.lime,alignItems:'center',justifyContent:'center'},
 progressTrack:{height:5,borderRadius:4,backgroundColor:C.soft,overflow:'hidden'},
 progressFill:{height:'100%',backgroundColor:C.lime,borderRadius:4}
});
