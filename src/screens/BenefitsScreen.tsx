import React from 'react';
import {Linking,Pressable,Text,View,StyleSheet} from 'react-native';
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
  <Text accessibilityRole="header" style={styles.heading}>Din utveckling</Text>
  {([['Din första dag','Varje steg räknas.'],['En vecka','Fortsätt bygga hållbara vanor.'],['En månad','Se tillbaka på dina framsteg.']] as const).map(([title,description])=>
   <View key={title} style={[styles.card,styles.inline]}>
    <View style={styles.milestone}><Leaf size={21} color={C.lime}/></View>
    <View style={{flex:1,gap:4}}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.muted}>{description}</Text></View>
   </View>)}
  <Text accessibilityRole="header" style={styles.heading}>Kunskap som hjälper</Text>
  {([
   ['Vad är nikotinberoende?','Nikotin kan skapa ett beroende. När kroppen vant sig vid nikotin kan det kännas svårt att avstå, även när du vill sluta.'],
   ['När röksuget kommer','Röksug kan kopplas till både nikotinberoende och inlärda vanor, till exempel en paus eller en måltid. Pröva att byta rutin och ge suget lite tid.'],
   ['Om abstinens','När du minskar eller slutar kan du tillfälligt känna irritation, oro, rastlöshet eller koncentrationssvårigheter. Besvären brukar minska med tiden, men upplevelsen varierar.'],
   ['Om du röker mer än planerat','En svår dag betyder inte att dina tidigare försök saknar värde. Fortsätt registrera, fundera på vad som utlöste situationen och justera planen vid behov.']
  ] as const).map(([title,description])=>
   <View key={title} style={[styles.card,{gap:7}]}><Text accessibilityRole="header" style={styles.cardTitle}>{title}</Text><Text style={styles.muted}>{description}</Text></View>)}
  <Text accessibilityRole="header" style={styles.heading}>Svenska stödresurser och källor</Text>
  <View style={[styles.card,{gap:12}]}>
   <Text accessibilityRole="header" style={styles.cardTitle}>1177 – Hjälp att sluta röka</Text>
   <Text style={styles.muted}>Information om nikotinberoende, abstinens, stöd och behandling från svensk sjukvård.</Text>
   <Pressable accessibilityRole="link" accessibilityLabel="Läs om rökstopp på 1177, öppnas i webbläsaren" onPress={()=>void Linking.openURL('https://www.1177.se/liv--halsa/tobak-och-alkohol/tobak/hjalp-att-sluta-roka/')} style={styles.resourceLink}><Text style={styles.resourceText}>Läs på 1177</Text></Pressable>
  </View>
  <View style={[styles.card,{gap:12}]}>
   <Text accessibilityRole="header" style={styles.cardTitle}>Sluta-röka-linjen</Text>
   <Text style={styles.muted}>Kostnadsfritt samtalsstöd på telefon 020-84 00 00 och chatt. Se webbplatsen för aktuella öppettider.</Text>
   <Pressable accessibilityRole="link" accessibilityLabel="Öppna Sluta-röka-linjens webbplats i webbläsaren" onPress={()=>void Linking.openURL('https://www.slutarokalinjen.se/')} style={styles.resourceLink}><Text style={styles.resourceText}>Besök Sluta-röka-linjen</Text></Pressable>
  </View>
  <View style={[styles.card,{gap:8}]}>
   <Text accessibilityRole="header" style={styles.cardTitle}>Om informationen och dina uppgifter</Text>
   <Text style={styles.muted}>Källor: 1177 och Sluta-röka-linjen. Kontrollera aktuella råd, öppettider och kontaktvägar på deras webbplatser. Länkarna öppnar externa sidor utan att lägga till dina registreringar i webbadressen.</Text>
   <Text style={styles.muted}>Informationen är generell och ersätter inte medicinsk bedömning. Abstinens och hälsoeffekter varierar. Kontakta vården om du behöver individuell rådgivning eller behandling.</Text>
  </View>
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
 resourceLink:{minHeight:48,justifyContent:'center',alignSelf:'flex-start',paddingVertical:10,paddingHorizontal:4},
 resourceText:{color:C.lime,fontSize:15,fontWeight:'800',textDecorationLine:'underline'},
});
