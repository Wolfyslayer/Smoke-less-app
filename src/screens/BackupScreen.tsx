import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {ChevronRight,Cloud,Shield} from 'lucide-react-native';
import {C} from '../theme';
import {AppCard,AppButton} from '../components/ui';

type Props={
 accountEmail:string|null;syncStatus:string;
 onGuestReset:()=>void;onOpenAccount:()=>void;onBack:()=>void;
};
export function BackupScreen({accountEmail,syncStatus,onGuestReset,onOpenAccount,onBack}:Props){
 const loggedIn=accountEmail!==null;
 return <View style={s.screen}>
  <Pressable accessibilityRole="button" accessibilityLabel="Tillbaka till Profil" accessibilityHint="Återgår till din profil" onPress={onBack} style={s.back}><ChevronRight size={18} color={C.lime} style={{transform:[{rotate:'180deg'}]}}/><Text style={s.link}>Tillbaka till Profil</Text></Pressable>
  <View style={s.heading}><Shield size={25} color={C.lime}/><Text style={s.title} accessibilityRole="header">Din historik</Text></View>
  <AppCard tone="surface" style={s.card}>
   <View style={s.heading}><Cloud size={22} color={C.lime}/><Text style={s.cardTitle} accessibilityRole="header">Molnsynkronisering</Text></View>
   <Text style={s.muted}>{loggedIn?'Inloggad som '+accountEmail:'Gästläge – din historik sparas lokalt på enheten.'}</Text>
   <Text style={s.muted} accessibilityLiveRegion="polite">{loggedIn?(syncStatus||'Molnsynkronisering är tillgänglig när du är inloggad.'): 'Utan konto kan historiken försvinna om appen avinstalleras eller telefonen byts.'}</Text>
   <AppButton title={loggedIn?'Hantera konto och molnhistorik':'Logga in eller skapa konto'} secondary secondaryTone="elevated" onPress={onOpenAccount}/>
  </AppCard>
  {!loggedIn?<AppCard tone="surface" style={s.card}>
   <View style={s.heading}><Shield size={22} color="#E7B967"/><Text style={s.cardTitle} accessibilityRole="header">Hantera gästhistorik</Text></View>
   <Text style={s.muted}>En lokal skyddskopia skapas innan gästhistoriken rensas. Den kan inte exporteras eller återställas från den här vyn och försvinner vid avinstallation. Åtgärden påverkar inte molndata.</Text>
   <AppButton title="Radera gästhistorik (med bekräftelse)" secondary secondaryTone="elevated" onPress={onGuestReset}/>
  </AppCard>:null}
 </View>;
}
const s=StyleSheet.create({
 screen:{gap:20},back:{flexDirection:'row',alignItems:'center',gap:8,alignSelf:'flex-start',minHeight:48,paddingVertical:10,paddingHorizontal:8},
 link:{color:C.lime,fontSize:13,fontWeight:'800'},heading:{flexDirection:'row',alignItems:'center',gap:10},
 title:{fontSize:23,fontWeight:'900',color:C.white},cardTitle:{fontSize:17,fontWeight:'800',color:C.white},
 muted:{fontSize:13,color:C.muted,lineHeight:20},card:{gap:13,padding:18},
 
});
