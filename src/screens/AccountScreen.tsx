import React from 'react';
import Constants from 'expo-constants';
import {Pressable,Text,TextInput,View,StyleSheet} from 'react-native';
import {ChevronRight,UserRound,Shield} from 'lucide-react-native';
import {useThemeColors,useThemeStyles,type ThemeColors} from '../theme';

type AccountUser={email?:string|null};
type Props={
 deletionEnabled:boolean;onDeleteAccount:()=>void;
 accountUser:AccountUser|null;emailVerified:boolean;verificationBusy:boolean;accountBusy:boolean;
 cloudPreviewBusy:boolean;migrationBusy:boolean;
 accountMode:'login'|'signup';accountEmail:string;accountPassword:string;
 onBack:()=>void;onVerification:(action:'send'|'refresh')=>void;
 onEmailChange:(value:string)=>void;
 onPasswordChange:(value:string)=>void;onAccountAction:(action:'login'|'signup'|'reset'|'logout')=>void;
 googleConfigured:boolean;onGoogleSignIn:()=>void;onLinkGoogle:()=>void;onToggleAccountMode:()=>void;onPasswordReset:()=>void;onOpenData:()=>void;
};
const validEmail=(value:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
function Card({children,style}:{children:React.ReactNode;style?:any}){
 const s=useThemeStyles(createS);
return <View style={[s.card,style]}>{children}</View>}
function Btn({title,onPress,secondary=false,disabled=false}:{title:string;onPress:()=>void;secondary?:boolean;disabled?:boolean}){
 const C=useThemeColors(); const s=useThemeStyles(createS);
return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={[s.button,secondary&&s.buttonSecondary,disabled&&{opacity:0.5}]}><Text style={[s.buttonText,secondary&&{color:C.white}]}>{title}</Text></Pressable>}
export function AccountScreen({deletionEnabled,onDeleteAccount,accountUser,emailVerified,verificationBusy,accountBusy,cloudPreviewBusy,migrationBusy,accountMode,accountEmail,accountPassword,onBack,onVerification,onEmailChange,onPasswordChange,onAccountAction,googleConfigured,onGoogleSignIn,onLinkGoogle,onToggleAccountMode,onPasswordReset,onOpenData}:Props){
 const C=useThemeColors(); const s=useThemeStyles(createS);

 return <View style={{gap:20}}>
 {Constants.expoConfig?.extra?.previewUsesSharedFirebase?<Text accessibilityRole="alert" style={s.muted}>Det här är Preview. Inloggning använder samma kontomiljö som din ordinarie app. Använd ett separat testkonto om du vill undvika att ändra din vanliga historik.</Text>:null}

 <Pressable accessibilityRole="button" accessibilityLabel="Tillbaka" accessibilityHint="Återgår till föregående vy" onPress={()=>onBack()} style={{minHeight:48,flexDirection:'row',alignItems:'center',gap:8,alignSelf:'flex-start',paddingVertical:7}}><ChevronRight size={18} color={C.lime} style={{transform:[{rotate:'180deg'}]}}/><Text style={s.link}>Tillbaka</Text></Pressable>
 <Card style={{gap:12,padding:19,backgroundColor:C.accentSubtle,borderColor:C.border}}>
  <View style={{flexDirection:'row',alignItems:'center',gap:13}}><View style={{width:48,height:48,borderRadius:15,backgroundColor:C.limeSoft,alignItems:'center',justifyContent:'center'}}><UserRound size={25} color={C.lime}/></View><View style={{flex:1,gap:4}}><Text style={s.cardTitle}>{accountUser?'Ditt Smoke Less-konto':'Skydda din resa'}</Text><Text style={s.muted}>{accountUser?.email||'Logga in eller skapa ett konto för kontosynk.'}</Text></View></View>
 </Card>
  {accountUser?<Card style={{gap:13,padding:18}}>
  <View style={{flexDirection:'row',alignItems:'center',gap:12}}><View style={s.actionIcon}><Shield size={22} color={C.lime}/></View><View style={{flex:1,gap:4}}><Text style={s.cardTitle}>Kontouppgifter</Text><Text style={s.muted}>E-post och inloggningssätt</Text></View></View>
  <View style={{gap:9,padding:13,borderRadius:14,backgroundColor:C.elevated,borderWidth:1,borderColor:C.border}}>
   <Text style={s.cardTitle} accessibilityRole="header">E-postverifiering</Text>
   <Text style={{color:emailVerified?C.lime:C.warning,fontSize:15,fontWeight:'800'}}>{emailVerified?'✓ Verifierad e-postadress':'E-postadressen är inte verifierad'}</Text>
   {!emailVerified?<><Text style={s.muted}>Verifiera din e-postadress för att skydda åtkomsten till ditt konto. Öppna länken i mejlet och kontrollera sedan status här.</Text><Btn title={verificationBusy?'Vänta…':'Skicka verifieringsmejl'} secondary disabled={verificationBusy||accountBusy} onPress={()=>onVerification('send')}/><Btn title={verificationBusy?'Kontrollerar…':'Kontrollera verifiering'} secondary disabled={verificationBusy||accountBusy} onPress={()=>onVerification('refresh')}/></>:null}
  </View>
  <View style={{gap:9,padding:13,borderRadius:14,backgroundColor:C.elevated,borderWidth:1,borderColor:C.border}}>
   <Text style={s.cardTitle} accessibilityRole="header">Koppla Google till kontot</Text>
   <Text style={s.muted}>Har du skapat kontot med e-post och lösenord? Koppla Google till samma konto utan att förlora historik. Verifiera med ditt nuvarande lösenord.</Text>
   <TextInput accessibilityLabel="Nuvarande lösenord för Google-koppling" secureTextEntry autoCapitalize="none" autoComplete="current-password" placeholder="Nuvarande lösenord" placeholderTextColor={C.dim} value={accountPassword} onChangeText={onPasswordChange} style={s.input}/>
   <Btn title={accountBusy?'Vänta…':'Koppla Google till mitt konto'} secondary disabled={accountBusy||!googleConfigured||!accountPassword} onPress={onLinkGoogle}/>
   {!googleConfigured?<Text style={s.muted}>Google-inloggning är inte konfigurerad i den här appversionen.</Text>:null}
  </View>
 </Card>:<Card style={{gap:14,padding:18}}>
  <View style={{flexDirection:'row',alignItems:'center',gap:12}}><View style={s.actionIcon}><Shield size={22} color={C.lime}/></View><View style={{flex:1,gap:4}}><Text style={s.cardTitle}>{accountMode==='login'?'Välkommen tillbaka':'Skapa ditt konto'}</Text><Text style={s.muted}>Spara din resa tryggt med molnsäkerhetskopiering.</Text></View></View>
  <TextInput accessibilityLabel="E-postadress" autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="E-postadress" placeholderTextColor={C.dim} value={accountEmail} onChangeText={onEmailChange} style={s.input}/>
  {accountEmail.trim()&&!validEmail(accountEmail)?<Text accessibilityRole="alert" style={s.muted}>Ange en giltig e-postadress, till exempel namn@exempel.se.</Text>:null}
  <TextInput accessibilityLabel="Lösenord" secureTextEntry autoCapitalize="none" autoComplete={accountMode==='signup'?'new-password':'current-password'} placeholder="Lösenord" placeholderTextColor={C.dim} value={accountPassword} onChangeText={onPasswordChange} style={s.input}/>
  {accountMode==='signup'&&accountPassword.length>0&&accountPassword.length<6?<Text accessibilityRole="alert" style={s.muted}>Lösenordet måste innehålla minst 6 tecken.</Text>:null}
  <Btn title={accountBusy?'Vänta…':accountMode==='login'?'Logga in':'Skapa konto'} disabled={accountBusy||!validEmail(accountEmail)||!accountPassword||(accountMode==='signup'&&accountPassword.length<6)} onPress={()=>onAccountAction(accountMode)}/>
  <Text style={[s.muted,{textAlign:'center'}]}>eller</Text>
  <Btn title={accountBusy?'Vänta…':'Fortsätt med Google'} secondary disabled={accountBusy||!googleConfigured} onPress={onGoogleSignIn}/>
  {!googleConfigured?<Text style={s.muted} accessibilityLiveRegion="polite">Google-inloggning är inte konfigurerad i den här appversionen. Använd e-post och lösenord tills en uppdaterad Android-build finns.</Text>:null}
  <Btn title={accountMode==='login'?'Skapa ett nytt konto':'Jag har redan ett konto'} secondary disabled={accountBusy} onPress={()=>onToggleAccountMode()}/>
  <Pressable disabled={accountBusy||!validEmail(accountEmail)} onPress={()=>onAccountAction('reset')} accessibilityRole="button" accessibilityLabel="Återställ lösenord" accessibilityState={{disabled:accountBusy||!validEmail(accountEmail)}} style={{minHeight:48,justifyContent:"center",paddingVertical:5,alignSelf:'center',opacity:accountBusy||!validEmail(accountEmail)?0.5:1}}><Text style={s.link}>Glömt lösenord?</Text></Pressable>
 </Card>}
 {accountUser?<Card style={{gap:12,padding:18}}>
  <View style={{flexDirection:'row',alignItems:'center',gap:12}}><View style={s.actionIcon}><Shield size={21} color={C.lime}/></View><View style={{flex:1,gap:3}}><Text style={s.cardTitle}>Kontosäkerhet</Text><Text style={s.muted}>Hantera åtkomsten till ditt konto.</Text></View></View>
  <Text style={s.muted}>Vill du byta lösenord skickar vi en återställningslänk till {accountUser.email||'din registrerade e-postadress'}. Din historik påverkas inte.</Text>
  <Btn title={accountBusy?'Skickar…':'Skicka länk för lösenordsbyte'} secondary disabled={accountBusy||!accountUser.email} onPress={onPasswordReset}/>
  <View style={{height:1,backgroundColor:C.border}}/>
  <Text style={s.cardTitle} accessibilityRole="header">Radera data och konto</Text>
  {deletionEnabled?<><Text style={s.muted}>Radera ditt konto och tillhörande kontohistorik permanent. Gästhistorik och andra kontons aktiva historik behålls. Logga in på nytt först; läs bekräftelsen innan du fortsätter.</Text><Btn title="Radera konto och kontohistorik" secondary disabled={accountBusy||migrationBusy||cloudPreviewBusy} onPress={onDeleteAccount}/></>:<Text style={s.muted}>Kontoradering är inte tillgänglig i den här förhandsversionen. Din kontohistorik synkroniseras via Firebase; gästhistorik finns bara på enheten.</Text>}
  <Btn title="Visa historik och synkronisering" secondary onPress={()=>onOpenData()}/>
 </Card>:null}
 {!accountUser?<Card style={{gap:10,padding:17,borderColor:C.warning,backgroundColor:C.surface}}>
  <Text style={[s.cardTitle,{color:C.warning}]}>⚠️ Skydda din historik</Text>
  <Text style={s.muted}>Utan konto lagras din historik bara på den här enheten. Den kan försvinna om du avinstallerar appen eller byter telefon.</Text>
 </Card>:<Card style={{gap:9,padding:16}}>
  <Text style={s.cardTitle}>Kontohantering</Text><Text style={s.muted}>Du kan logga ut utan att radera din lokala gästhistorik.</Text>
  <Btn title={accountBusy?'Vänta…':'Logga ut'} secondary disabled={migrationBusy||accountBusy} onPress={()=>onAccountAction('logout')}/>
 </Card>}
 </View>;
}
const createS=(C:ThemeColors)=>StyleSheet.create({
 card:{backgroundColor:C.surface,borderRadius:24,padding:15,borderWidth:1,borderColor:C.border,gap:9},
 cardTitle:{fontSize:16,fontWeight:'800',color:C.white},
 muted:{fontSize:15,color:C.muted,lineHeight:23},
 actionIcon:{width:36,height:36,borderRadius:11,backgroundColor:C.elevated,alignItems:'center',justifyContent:'center'},
 link:{color:C.lime,fontSize:15,fontWeight:'800'},
 input:{backgroundColor:C.elevated,borderRadius:14,borderWidth:1,borderColor:C.border,color:C.white,padding:12,fontSize:15,minHeight:48},
 button:{backgroundColor:C.lime,padding:13,borderRadius:14,alignItems:'center',justifyContent:'center',minHeight:48},
 buttonSecondary:{backgroundColor:C.elevated,borderWidth:1,borderColor:C.border},
 buttonText:{color:C.onAccent,fontWeight:'900',fontSize:15},
});
