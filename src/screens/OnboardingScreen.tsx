import React from 'react';
import {ScrollView,StyleSheet,Text,View} from 'react-native';
import {Leaf} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {C} from '../theme';
import type {Mode} from '../domain';
import {AppCard,AppButton} from '../components/ui';
import {OnboardingField,OnboardingChoice} from '../components/OnboardingControls';

export function OnboardingScreen({onStep,setOnStep,mode,setMode,baseline,setBaseline,packSize,setPackSize,packPrice,setPackPrice,begin}:{
 onStep:number;setOnStep:React.Dispatch<React.SetStateAction<number>>;
 mode:Mode;setMode:React.Dispatch<React.SetStateAction<Mode>>;
 baseline:string;setBaseline:(value:string)=>void;
 packSize:string;setPackSize:(value:string)=>void;
 packPrice:string;setPackPrice:(value:string)=>void;
 begin:()=>void;
}){
 const insets=useSafeAreaInsets();
 return <ScrollView style={styles.root} contentContainerStyle={{paddingHorizontal:24,paddingTop:Math.max(insets.top,30)+20,paddingBottom:40,gap:22}} keyboardShouldPersistTaps="handled"><Label>SMOKE LESS / 06</Label><View style={styles.welcomeArt}><View style={styles.artOuter}><View style={styles.artInner}><Leaf size={58} color={C.lime}/></View></View></View><Text style={styles.display}>{['Ta tillbaka\nkontrollen.','Välj din\nväg.','Dina vanor.','Din nya\nstart.'][onStep]}</Text><Text style={styles.subhead}>{['Varje liten förändring räknas. Bygg ett liv med mindre rökning, i din egen takt.','Du bestämmer hur din resa ska se ut.','Vi använder dina uppgifter för att skapa en personlig plan.','Du är redo att ta första steget.'][onStep]}</Text><View style={styles.progressTrack}><View style={[styles.progressFill,{width:((onStep+1)*25)+'%' as `${number}%`}]}/></View>{onStep===1?<View style={{gap:12}}><OnboardingChoice title="Minska gradvis" subtitle="Trappa ner steg för steg med en personlig plan." selected={mode==='reduce'} onPress={()=>setMode('reduce')}/><OnboardingChoice title="Sluta helt" subtitle="Följ din resa mot ett rökfritt liv." selected={mode==='quit'} onPress={()=>setMode('quit')}/></View>:null}{onStep===2?<View style={{gap:15}}><OnboardingField label="Cigaretter per dag" value={baseline} onChange={setBaseline}/><OnboardingField label="Cigaretter per paket" value={packSize} onChange={setPackSize}/><OnboardingField label="Pris per paket (kr)" value={packPrice} onChange={setPackPrice}/></View>:null}{onStep===3?<AppCard><Label>DIN STARTPUNKT</Label><Text style={styles.statValue}>{baseline} <Text style={styles.muted}>cigaretter/dag</Text></Text><Text style={styles.muted}>{mode==='quit'?'Mål: rökfri från start':'Balanserad nedtrappning'} · {packPrice} kr/paket</Text></AppCard>:null}<AppButton title={onStep===3?'Starta min resa':onStep===0?'Kom igång':'Fortsätt'} onPress={()=>onStep===3?begin():setOnStep(v=>v+1)}/>{onStep>0?<AppButton title="Tillbaka" secondary onPress={()=>setOnStep(v=>v-1)}/>:null}</ScrollView>;
}
function Label({children}:{children:React.ReactNode}){return <Text style={styles.eyebrow}>{children}</Text>}
const styles=StyleSheet.create({
 root:{flex:1,backgroundColor:C.background},
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
