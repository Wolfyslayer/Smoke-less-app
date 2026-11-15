import React,{useState} from 'react';
import {Linking,Pressable,StyleSheet,Text,View} from 'react-native';
import {C} from '../theme';
import {openSupportSource,supportCards,supportCheckedAt,supportSources,supportTopics,type SupportTopic} from '../data/evidenceSupport';

export function EvidenceSupport(){
 const [topic,setTopic]=useState<SupportTopic>('Stöd i vardagen');
 const [failed,setFailed]=useState<keyof typeof supportSources|null>(null);
 return <View style={styles.section}>
  <Text accessibilityRole="header" style={styles.heading}>Kunskap och stöd</Text>
  <Text style={styles.body}>Välj vad du vill läsa. Valet sparas inte och används inte för att bedöma din hälsa.</Text>
  <View accessibilityRole="radiogroup" style={styles.section}>{supportTopics.map(item=><Pressable key={item} accessibilityRole="radio" accessibilityState={{checked:item===topic}} onPress={()=>{setTopic(item);setFailed(null);}} style={[styles.choice,item===topic&&styles.selected]}><Text style={styles.link}>{item}</Text></Pressable>)}</View>
  {supportCards[topic].map(card=><View key={card.title} style={styles.card}>
   <Text accessibilityRole="header" style={styles.title}>{card.title}</Text>
   <Text style={styles.body}>{card.text}</Text>
   {card.sources.map(id=><Pressable key={id} accessibilityRole="link" accessibilityLabel={`${supportSources[id].title}, öppnas i webbläsaren`} style={styles.choice} onPress={()=>void openSupportSource(id,url=>Linking.openURL(url)).then(ok=>setFailed(ok?null:id))}><Text style={styles.link}>{supportSources[id].title}</Text></Pressable>)}
  </View>)}
  {failed&&<View style={styles.card}><Text accessibilityRole="alert" style={styles.body}>Länken kunde inte öppnas. Försök igen via källänken eller kopiera adressen till din webbläsare.</Text><Text selectable style={styles.body}>{supportSources[failed].url}</Text></View>}
  <Text style={styles.body}>Källorna kontrollerades {supportCheckedAt}. Texterna kan läsas offline. Källänkar kräver internet och öppnas först när du trycker. Dina registreringar läggs inte till i länkarna.</Text>
  <Text style={styles.body}>Informationen är generell och ersätter inte individuell medicinsk bedömning. Appen rekommenderar inte preparat eller doser.</Text>
 </View>;
}
const styles=StyleSheet.create({
 section:{gap:12},heading:{fontSize:19,fontWeight:'800',color:C.white},
 card:{gap:8,backgroundColor:C.elevated,borderRadius:20,borderWidth:1,borderColor:C.border,padding:17},
 title:{fontSize:16,fontWeight:'800',color:C.white},body:{color:C.dim,fontSize:14,lineHeight:21},
 choice:{minHeight:48,padding:12,justifyContent:'center',borderRadius:12,borderWidth:1,borderColor:C.border},
 selected:{borderColor:C.lime,backgroundColor:C.limeSoft},link:{color:C.lime,fontSize:15,fontWeight:'700'},
});
