import React from 'react';
import {Text,View,StyleSheet} from 'react-native';
import {EvidenceSupport} from '../components/EvidenceSupport';
import {useThemeStyles,type ThemeColors} from '../theme';
import {savings,type Data} from '../domain';

const formatMoney=(n:number)=>new Intl.NumberFormat('sv-SE',{maximumFractionDigits:0}).format(n);

export function BenefitsScreen({data}:{data:Data}){
 const styles=useThemeStyles(createStyles);

 return <View style={styles.screen}>
  <View style={[styles.card,styles.hero]}>
   <Text style={styles.eyebrow}>UPPSKATTAD BESPARING</Text>
   <Text style={styles.heroNumber}>{formatMoney(savings(data))} kr</Text>
   <Text style={styles.muted}>Beräknat från din startnivå och registreringar. En uppskattning.</Text>
  </View>
  <EvidenceSupport/>
 </View>;
}

const createStyles=(C:ThemeColors)=>StyleSheet.create({
 screen:{gap:16},
 card:{backgroundColor:C.elevated,borderRadius:16,borderWidth:1,borderColor:C.border,padding:17},
 hero:{backgroundColor:C.accentSubtle,borderColor:C.border,padding:19},
 eyebrow:{fontSize:11,fontWeight:'800',letterSpacing:1.5,color:C.lime},
 heroNumber:{fontSize:42,fontWeight:'900',color:C.lime},
 muted:{color:C.dim,fontSize:15,lineHeight:23},
 heading:{fontSize:19,fontWeight:'800',color:C.white},
 inline:{flexDirection:'row',alignItems:'center',gap:14},
 milestone:{width:42,height:42,borderRadius:13,backgroundColor:C.limeSoft,alignItems:'center',justifyContent:'center'},
 cardTitle:{fontSize:16,fontWeight:'800',color:C.white},
 resourceLink:{minHeight:48,justifyContent:'center',alignSelf:'flex-start',paddingVertical:10,paddingHorizontal:4},
 resourceText:{color:C.lime,fontSize:15,fontWeight:'800',textDecorationLine:'underline'},
});
