import React from 'react';
import {Text,View,StyleSheet} from 'react-native';
import {Leaf} from 'lucide-react-native';
import {C} from '../theme';
import {savings,type Data} from '../domain';

const formatMoney=(n:number)=>new Intl.NumberFormat('sv-SE',{maximumFractionDigits:0}).format(n);

export function BenefitsScreen({data}:{data:Data}){
 return <View style={styles.screen}>
  <View style={[styles.card,styles.hero]}>
   <Text style={styles.eyebrow}>UPPSKATTAD BESPARING</Text>
   <Text style={styles.heroNumber}>{formatMoney(savings(data))} kr</Text>
   <Text style={styles.muted}>Beräknat från din startnivå och registreringar. En uppskattning.</Text>
  </View>
  <Text style={styles.heading}>Din utveckling</Text>
  {([['Din första dag','Varje steg räknas.'],['En vecka','Fortsätt bygga hållbara vanor.'],['En månad','Se tillbaka på dina framsteg.']] as const).map(([title,description])=>
   <View key={title} style={[styles.card,styles.inline]}>
    <View style={styles.milestone}><Leaf size={21} color={C.lime}/></View>
    <View style={{flex:1,gap:4}}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.muted}>{description}</Text></View>
   </View>)}
  <Text style={styles.muted}>Hälsoeffekter varierar mellan personer. Appen ersätter inte medicinsk rådgivning.</Text>
 </View>;
}

const styles=StyleSheet.create({
 screen:{gap:20},
 card:{backgroundColor:C.elevated,borderRadius:20,borderWidth:1,borderColor:C.border,padding:17},
 hero:{backgroundColor:'#1B2416',borderColor:'#425C29',padding:19},
 eyebrow:{fontSize:11,fontWeight:'800',letterSpacing:1.5,color:C.lime},
 heroNumber:{fontSize:42,fontWeight:'900',color:C.lime},
 muted:{color:C.dim,fontSize:13,lineHeight:19},
 heading:{fontSize:19,fontWeight:'800',color:C.white},
 inline:{flexDirection:'row',alignItems:'center',gap:14},
 milestone:{width:42,height:42,borderRadius:13,backgroundColor:C.limeSoft,alignItems:'center',justifyContent:'center'},
 cardTitle:{fontSize:16,fontWeight:'800',color:C.white},
});
