import React from 'react';
import {Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import {ChevronRight,Cloud,Download,Shield} from 'lucide-react-native';
import {C} from '../theme';
import {AppCard,AppButton} from '../components/ui';

type Props={
 accountEmail:string|null;syncStatus:string;backup:string;
 onBackupChange:(value:string)=>void;onExportBackup:()=>void;
 onRestoreBackup:()=>void;onGuestReset:()=>void;onOpenAccount:()=>void;onBack:()=>void;
};
export function BackupScreen({accountEmail,syncStatus,backup,onBackupChange,onExportBackup,onRestoreBackup,onGuestReset,onOpenAccount,onBack}:Props){
 const loggedIn=accountEmail!==null;
 return <View style={s.screen}>
  <Pressable accessibilityRole="button" accessibilityLabel="Tillbaka till Profil" accessibilityHint="Återgår till din profil" onPress={onBack} style={s.back}><ChevronRight size={18} color={C.lime} style={{transform:[{rotate:'180deg'}]}}/><Text style={s.link}>Tillbaka till Profil</Text></Pressable>
  <View style={s.heading}><Download size={25} color={C.lime}/><Text style={s.title}>Säkerhetskopiering</Text></View>
  <AppCard tone="surface" style={s.card}>
   <View style={s.heading}><Cloud size={22} color={C.lime}/><Text style={s.cardTitle}>Molnsynkronisering</Text></View>
   <Text style={s.muted}>{loggedIn?'Inloggad som '+accountEmail:'Gästläge – din historik sparas lokalt på enheten.'}</Text>
   <Text style={s.muted} accessibilityLiveRegion="polite">{loggedIn?(syncStatus||'Molnsynkronisering är tillgänglig när du är inloggad.'): 'Utan konto kan historiken försvinna om appen avinstalleras eller telefonen byts.'}</Text>
   <AppButton title={loggedIn?'Hantera konto och molnhistorik':'Logga in eller skapa konto'} secondary secondaryTone="elevated" onPress={onOpenAccount}/>
  </AppCard>
  <AppCard tone="surface" style={s.card}>
   <View style={s.heading}><Download size={22} color={C.lime}/><Text style={s.cardTitle}>Manuell säkerhetskopia</Text></View>
   <Text style={s.muted}>Exportera din historik som JSON och förvara kopian säkert. Återställning kan ändra din lokala historik och kräver bekräftelse.</Text>
   <AppButton title="Skapa JSON-säkerhetskopia" secondary secondaryTone="elevated" onPress={onExportBackup}/>
   <TextInput accessibilityLabel="JSON-säkerhetskopia" accessibilityHint="Klistra in en säkerhetskopia i JSON-format för återställning" multiline placeholder="Klistra in JSON här för att återställa, eller kopiera din exporterade text" placeholderTextColor={C.dim} value={backup} onChangeText={onBackupChange} style={s.input}/>
   <AppButton title="Återställ från JSON" secondary secondaryTone="elevated" onPress={onRestoreBackup}/>
  </AppCard>
  {!loggedIn?<AppCard tone="surface" style={s.card}>
   <View style={s.heading}><Shield size={22} color="#E7B967"/><Text style={s.cardTitle}>Hantera gästhistorik</Text></View>
   <Text style={s.muted}>En separat lokal återställningskopia skapas innan gästhistoriken rensas. Kopian försvinner också om appen avinstalleras. Åtgärden påverkar inte molndata.</Text>
   <AppButton title="Radera gästhistorik (med bekräftelse)" secondary secondaryTone="elevated" onPress={onGuestReset}/>
  </AppCard>:null}
 </View>;
}
const s=StyleSheet.create({
 screen:{gap:20},back:{flexDirection:'row',alignItems:'center',gap:8,alignSelf:'flex-start',minHeight:44,paddingVertical:7,paddingHorizontal:4},
 link:{color:C.lime,fontSize:13,fontWeight:'800'},heading:{flexDirection:'row',alignItems:'center',gap:10},
 title:{fontSize:23,fontWeight:'900',color:C.white},cardTitle:{fontSize:17,fontWeight:'800',color:C.white},
 muted:{fontSize:13,color:C.muted,lineHeight:20},card:{gap:13,padding:18},
 input:{backgroundColor:C.elevated,borderRadius:14,borderWidth:1,borderColor:C.border,color:C.white,padding:12,minHeight:110,textAlignVertical:'top',fontSize:13},
});
