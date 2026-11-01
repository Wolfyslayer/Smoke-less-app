import React from 'react';
import {Pressable,Text,TextInput,View,StyleSheet} from 'react-native';
import {ChevronRight,UserRound,Shield} from 'lucide-react-native';
import {C} from '../theme';

type AccountUser={email?:string|null};
type Props={
 accountUser:AccountUser|null;emailVerified:boolean;verificationBusy:boolean;accountBusy:boolean;
 syncStatus:string;cloudPreviewResult:string|null;cloudPreviewBusy:boolean;migrationBusy:boolean;
 accountMode:'login'|'signup';accountEmail:string;accountPassword:string;
 onBack:()=>void;onVerification:(action:'send'|'refresh')=>void;onGuestMigration:()=>void;
 onCloudPreview:()=>void;onCloudImport:()=>void;onEmailChange:(value:string)=>void;
 onPasswordChange:(value:string)=>void;onAccountAction:(action:'login'|'signup'|'reset'|'logout')=>void;
 onToggleAccountMode:()=>void;onPasswordReset:()=>void;onInspectCloud:()=>void;onOpenSettings:()=>void;
};
function Card({children,style}:{children:React.ReactNode;style?:any}){return <View style={[s.card,style]}>{children}</View>}
function Btn({title,onPress,secondary=false,disabled=false}:{title:string;onPress:()=>void;secondary?:boolean;disabled?:boolean}){return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={[s.button,secondary&&s.buttonSecondary,disabled&&{opacity:0.5}]}><Text style={[s.buttonText,secondary&&{color:C.white}]}>{title}</Text></Pressable>}
export function AccountScreen({accountUser,emailVerified,verificationBusy,accountBusy,syncStatus,cloudPreviewResult,cloudPreviewBusy,migrationBusy,accountMode,accountEmail,accountPassword,onBack,onVerification,onGuestMigration,onCloudPreview,onCloudImport,onEmailChange,onPasswordChange,onAccountAction,onToggleAccountMode,onPasswordReset,onInspectCloud,onOpenSettings}:Props){
 return <View style={{gap:20}}>

 <Pressable accessibilityRole="button" accessibilityLabel="Tillbaka till Profil" accessibilityHint="Återgår till din profil" onPress={()=>onBack()} style={{minHeight:44,flexDirection:'row',alignItems:'center',gap:8,alignSelf:'flex-start',paddingVertical:7}}><ChevronRight size={18} color={C.lime} style={{transform:[{rotate:'180deg'}]}}/><Text style={s.link}>Tillbaka till Profil</Text></Pressable>
 <Card style={{gap:12,padding:19,backgroundColor:'#1B2416',borderColor:'#425C29'}}>
  <View style={{flexDirection:'row',alignItems:'center',gap:13}}><View style={{width:48,height:48,borderRadius:15,backgroundColor:C.limeSoft,alignItems:'center',justifyContent:'center'}}><UserRound size={25} color={C.lime}/></View><View style={{flex:1,gap:4}}><Text style={s.cardTitle}>{accountUser?'Ditt Smoke Less-konto':'Skydda din resa'}</Text><Text style={s.muted}>{accountUser?.email||'Logga in eller skapa ett konto för molnsäkerhetskopiering.'}</Text></View></View>
 </Card>
  {accountUser?<Card style={{gap:13,padding:18}}>
  <View style={{flexDirection:'row',alignItems:'center',gap:12}}><View style={s.actionIcon}><Shield size={22} color={C.lime}/></View><View style={{flex:1,gap:4}}><Text style={s.cardTitle}>Molnsäkerhetskopia</Text><Text style={s.muted}>Automatisk Firestore-synkronisering</Text></View></View>
  <View style={{gap:9,padding:13,borderRadius:14,backgroundColor:C.elevated,borderWidth:1,borderColor:C.border}}>
   <Text style={s.cardTitle}>E-postverifiering</Text>
   <Text style={{color:emailVerified?C.lime:'#E7B967',fontSize:13,fontWeight:'800'}}>{emailVerified?'✓ Verifierad e-postadress':'E-postadressen är inte verifierad'}</Text>
   {!emailVerified?<><Text style={s.muted}>Verifiera din e-postadress för att skydda åtkomsten till ditt konto. Öppna länken i mejlet och kontrollera sedan status här.</Text><Btn title={verificationBusy?'Vänta…':'Skicka verifieringsmejl'} secondary disabled={verificationBusy||accountBusy} onPress={()=>onVerification('send')}/><Btn title={verificationBusy?'Kontrollerar…':'Kontrollera verifiering'} secondary disabled={verificationBusy||accountBusy} onPress={()=>onVerification('refresh')}/></>:null}
  </View>
  <Text style={s.muted} accessibilityLiveRegion="polite">{syncStatus||'Din historik synkroniseras automatiskt när appen öppnas och när du gör ändringar. Vid konflikt skyddas dina befintliga data.'}</Text>
  {cloudPreviewResult?<Text style={s.muted} accessibilityLiveRegion="polite">{cloudPreviewResult}</Text>:null}
  <Btn title={migrationBusy?'Kopierar gästhistorik…':'Kopiera gästhistorik till kontot'} secondary disabled={migrationBusy||cloudPreviewBusy||accountBusy} onPress={onGuestMigration}/>
  <Btn title={cloudPreviewBusy?'Läser molndata…':'Förhandsgranska molndata'} secondary disabled={migrationBusy||cloudPreviewBusy||accountBusy} onPress={onCloudPreview}/>
  <Btn title={cloudPreviewBusy?'Vänta…':'Importera molnhistorik (med bekräftelse)'} secondary disabled={migrationBusy||cloudPreviewBusy||accountBusy} onPress={onCloudImport}/>
 </Card>:<Card style={{gap:14,padding:18}}>
  <View style={{flexDirection:'row',alignItems:'center',gap:12}}><View style={s.actionIcon}><Shield size={22} color={C.lime}/></View><View style={{flex:1,gap:4}}><Text style={s.cardTitle}>{accountMode==='login'?'Välkommen tillbaka':'Skapa ditt konto'}</Text><Text style={s.muted}>Spara din resa tryggt med molnsäkerhetskopiering.</Text></View></View>
  <TextInput accessibilityLabel="E-postadress" autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="E-postadress" placeholderTextColor={C.dim} value={accountEmail} onChangeText={onEmailChange} style={s.input}/>
  <TextInput accessibilityLabel="Lösenord" secureTextEntry autoCapitalize="none" autoComplete={accountMode==='signup'?'new-password':'current-password'} placeholder="Lösenord" placeholderTextColor={C.dim} value={accountPassword} onChangeText={onPasswordChange} style={s.input}/>
  <Btn title={accountBusy?'Vänta…':accountMode==='login'?'Logga in':'Skapa konto'} disabled={accountBusy||!accountEmail.trim()||!accountPassword} onPress={()=>onAccountAction(accountMode)}/>
  <Btn title={accountMode==='login'?'Skapa ett nytt konto':'Jag har redan ett konto'} secondary disabled={accountBusy} onPress={()=>onToggleAccountMode()}/>
  <Pressable disabled={accountBusy||!accountEmail.trim()} onPress={()=>onAccountAction('reset')} accessibilityRole="button" accessibilityLabel="Återställ lösenord" style={{minHeight:44,justifyContent:"center",paddingVertical:5,alignSelf:'center'}}><Text style={s.link}>Glömt lösenord?</Text></Pressable>
 </Card>}
 {accountUser?<Card style={{gap:12,padding:18}}>
  <View style={{flexDirection:'row',alignItems:'center',gap:12}}><View style={s.actionIcon}><Shield size={21} color={C.lime}/></View><View style={{flex:1,gap:3}}><Text style={s.cardTitle}>Kontosäkerhet</Text><Text style={s.muted}>Hantera åtkomsten till ditt konto.</Text></View></View>
  <Text style={s.muted}>Vill du byta lösenord skickar vi en återställningslänk till {accountUser.email||'din registrerade e-postadress'}. Din historik påverkas inte.</Text>
  <Btn title={accountBusy?'Skickar…':'Skicka länk för lösenordsbyte'} secondary disabled={accountBusy||!accountUser.email} onPress={onPasswordReset}/>
  <View style={{height:1,backgroundColor:C.border}}/>
  <Text style={s.cardTitle}>Radera data och konto</Text>
  <Btn title={cloudPreviewBusy?'Kontrollerar…':'Kontrollera vad som finns i molnet'} secondary disabled={cloudPreviewBusy||migrationBusy||accountBusy} onPress={onInspectCloud}/>
  <Text style={s.muted}>Att radera lokal historik, molnhistorik och Firebase-kontot är tre olika åtgärder. De är ännu inte tillgängliga här eftersom säker radering och skydd mot att synkronisering återskapar data behöver färdigställas först. Använd JSON-säkerhetskopian under Profil → Säkerhetskopiering för att spara en kopia.</Text>
  <Btn title="Öppna säkerhetskopiering" secondary onPress={()=>onOpenSettings()}/>
 </Card>:null}
 {!accountUser?<Card style={{gap:10,padding:17,borderColor:'#9D793E',backgroundColor:'#272218'}}>
  <Text style={[s.cardTitle,{color:'#E7B967'}]}>⚠️ Skydda din historik</Text>
  <Text style={s.muted}>Utan konto lagras din historik bara på den här enheten. Den kan försvinna om du avinstallerar appen eller byter telefon.</Text>
 </Card>:<Card style={{gap:9,padding:16}}>
  <Text style={s.cardTitle}>Kontohantering</Text><Text style={s.muted}>Du kan logga ut utan att radera din lokala gästhistorik.</Text>
  <Btn title={accountBusy?'Vänta…':'Logga ut'} secondary disabled={migrationBusy||accountBusy} onPress={()=>onAccountAction('logout')}/>
 </Card>}
 </View>;
}
const s=StyleSheet.create({
 card:{backgroundColor:C.surface,borderRadius:20,padding:15,borderWidth:1,borderColor:C.border,gap:9},
 cardTitle:{fontSize:16,fontWeight:'800',color:C.white},
 muted:{fontSize:13,color:C.muted,lineHeight:20},
 actionIcon:{width:36,height:36,borderRadius:11,backgroundColor:C.elevated,alignItems:'center',justifyContent:'center'},
 link:{color:C.lime,fontSize:13,fontWeight:'800'},
 input:{backgroundColor:C.elevated,borderRadius:14,borderWidth:1,borderColor:C.border,color:C.white,padding:12,fontSize:15,minHeight:48},
 button:{backgroundColor:C.lime,padding:13,borderRadius:14,alignItems:'center',justifyContent:'center',minHeight:48},
 buttonSecondary:{backgroundColor:C.elevated,borderWidth:1,borderColor:C.border},
 buttonText:{color:C.background,fontWeight:'900',fontSize:15},
});
