import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {CalendarDays,Trash2} from 'lucide-react-native';
import {C} from '../theme';
import type {Cigarette} from '../domain';

type Props={entries:Cigarette[];sorted:Cigarette[];onRemove:(id:string)=>void};
const date=(d:Date)=>d.toLocaleDateString('sv-SE',{day:'numeric',month:'long',year:'numeric'});

export function HistoryScreen({entries,sorted,onRemove}:Props){
 return <View style={styles.screen}>
  <View style={[styles.card,{padding:19,borderColor:'#425C29'}]}>
   <Text style={styles.label}>REGISTRERINGAR TOTALT</Text>
   <Text style={styles.heroNumber}>{entries.length}</Text>
  </View>
  {sorted.length===0?<View style={styles.card}><Text style={styles.muted}>Ingen historik ännu.</Text></View>:
   sorted.map(entry=><View key={entry.id} style={[styles.card,styles.inline]}>
    <CalendarDays size={20} color={C.lime}/>
    <View style={{flex:1}}>
     <Text style={styles.cardTitle}>{date(new Date(entry.at))}</Text>
     <Text style={styles.muted}>{new Date(entry.at).toLocaleTimeString('sv-SE',{hour:'2-digit',minute:'2-digit'})}</Text>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel="Ta bort" onPress={()=>onRemove(entry.id)}>
     <Trash2 color={C.danger} size={20}/>
    </Pressable>
   </View>)}
 </View>;
}
const styles=StyleSheet.create({
 screen:{gap:20},
 card:{backgroundColor:C.elevated,borderWidth:1,borderColor:C.border,borderRadius:20,padding:17},
 inline:{flexDirection:'row',alignItems:'center',gap:14},
 label:{fontSize:11,fontWeight:'800',letterSpacing:1.5,color:C.lime},
 heroNumber:{fontSize:48,fontWeight:'900',color:C.white},
 muted:{fontSize:13,lineHeight:19,color:C.dim},
 cardTitle:{fontSize:16,fontWeight:'800',color:C.white},
});
