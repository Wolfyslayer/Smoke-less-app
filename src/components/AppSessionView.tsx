import {AccountDeletionStatus} from './AccountDeletionStatus';
import {useWidgetNavigation} from '../hooks/useWidgetNavigation';
import React,{useEffect,useRef,useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {validateData} from '../domain';
import {previewGuestMerge} from '../guestMerge';
import {consumeLoginOrigin} from '../loginOrigin';
import {AccountSyncGate} from './AccountSyncGate';
import {ActivityIndicator,BackHandler,Platform,Pressable,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppSessionOnboarding} from './AppSessionOnboarding';
import {OnboardingAuthModal,type OnboardingAuthStep} from './OnboardingAuthModal';
import {AppScreenRouter} from './AppScreenRouter';
import {BottomNavigation} from './BottomNavigation';
import {ScreenHeader} from './ScreenHeader';
import {AppSessionOverlays} from './AppSessionOverlays';
import type {useSmokeLessSessionModel} from '../hooks/useSmokeLessSessionModel';
import type {Tab} from '../hooks/useSessionNavigation';
import {useThemeColors,useThemeStyles,type ThemeColors} from '../theme';

type SessionModel=ReturnType<typeof useSmokeLessSessionModel>;
export function AppSessionView({model}:{model:SessionModel}){
 const C=useThemeColors(); const s=useThemeStyles(createS);

 const insets=useSafeAreaInsets();
 const [showLogin,setShowLogin]=useState(false);
 const [authPrompt,setAuthPrompt]=useState<OnboardingAuthStep>(null);
 const completedOnboardingRef=useRef(false);
 const [showSyncDetails,setShowSyncDetails]=useState(false);
 const {ready,loadError,tab,clock,p,go,accountUser,syncStatus,syncPhase}=model;
 const widgetNavigationReady=ready&&!!p&&model.deletion.ready&&!loadError&&!showLogin&&authPrompt===null&&!model.dialog&&!model.registerOpen&&!model.accountBusy&&!model.migrationBusy&&!model.cloudPreviewBusy&&(tab!=='account'||(!model.accountEmail.trim()&&!model.accountPassword));
 useWidgetNavigation(widgetNavigationReady,go);
 useEffect(()=>{if(!model.deletion.ready){model.setDialog(null);model.setRegisterOpen(false);}},[model.deletion.ready]);
 const leaveLogin=()=>{
  if(model.accountEmail.trim()||model.accountPassword){
   model.ask('Lämna inloggningen?','E-post och lösenord som du har skrivit in kommer inte att användas.',()=>setShowLogin(false),'Lämna inloggningen');
  }else setShowLogin(false);
 };
 const backStateRef=useRef({ready,loadError,tab,p,accountUser,showLogin,authPrompt,model});
 backStateRef.current={ready,loadError,tab,p,accountUser,showLogin,authPrompt,model};
 useEffect(()=>{
  if(Platform.OS!=='android')return;
  const subscription=BackHandler.addEventListener('hardwareBackPress',()=>{
   const state=backStateRef.current;
   const current=state.model;
   if(!current.deletion.ready)return true;
   // A native Modal owns its own Android back event through onRequestClose.
   if(state.authPrompt!==null){
    setAuthPrompt(state.authPrompt==='email'||state.authPrompt==='benefits'?'choice':null);
    return true;
   }
   if(state.showLogin){
    if(current.accountEmail.trim()||current.accountPassword){
     current.ask('Lämna inloggningen?','E-post och lösenord som du har skrivit in kommer inte att användas.',()=>setShowLogin(false),'Lämna inloggningen');
    }else setShowLogin(false);
    return true;
   }
   if(!state.ready||state.loadError||!state.p)return true;
   if(current.dialog){current.setDialog(null);return true;}
   if(current.registerOpen){current.setRegisterOpen(false);return true;}
   if(state.tab==='account' && !state.accountUser && (current.accountEmail.trim()||current.accountPassword)){
    current.ask('Lämna inloggningen?','E-post och lösenord som du har skrivit in kommer inte att användas.',()=>{current.setAccountEmail('');current.setAccountPassword('');if(!current.goBack())current.resetToHome();},'Lämna inloggningen');
    return true;
   }
   if(state.tab!=='home'){
    // Return to the previous in-app view, not the Expo Router root.
    if(!current.goBack())current.resetToHome();
    return true;
   }
   current.ask('Avsluta Smoke Less?','Vill du avsluta appen?',()=>BackHandler.exitApp(),'Avsluta appen');
   return true;
  });
  return ()=>subscription.remove();
 },[]);

 useEffect(()=>{
  if(ready && p && !accountUser && completedOnboardingRef.current){
   completedOnboardingRef.current=false;
   setAuthPrompt('choice');
  }
 },[ready,p,accountUser]);
 useEffect(()=>{
  if(accountUser && authPrompt!==null)setAuthPrompt(null);
 },[accountUser,authPrompt]);
 const [loginOrigin]=useState(()=>accountUser?consumeLoginOrigin():null);
 const guestPromptedRef=useRef(false);
 useEffect(()=>{
  if(!ready || !accountUser || loginOrigin!=='profile' || guestPromptedRef.current || syncPhase!=='synced')return;
  guestPromptedRef.current=true;
  let cancelled=false;
  void (async()=>{
   try{
    const raw=await AsyncStorage.getItem('smoke-less-v6');
    if(!raw || cancelled)return;
    const guest:unknown=JSON.parse(raw);
    if(!validateData(guest))return;
    const preview=previewGuestMerge(model.data,guest);
    const additions=preview.added.entries+preview.added.cravings+preview.added.checkins;
    if(!cancelled && additions>0 && preview.conflicts.length===0)model.requestGuestMigration();
   }catch{
    // Invalid guest data must never block the signed-in session.
   }
  })();
  return ()=>{cancelled=true;};
 },[ready,accountUser?.uid,syncPhase,model.data]);

 if(loadError)return <ScrollView style={s.root} contentContainerStyle={{flexGrow:1,justifyContent:'center',alignItems:'center',padding:24,paddingTop:Math.max(insets.top,24),paddingBottom:Math.max(insets.bottom,24),gap:16}}><Text style={{color:C.white,textAlign:'center'}}>{loadError}</Text><Text style={{color:C.dim,textAlign:'center'}}>Ingen historik har skrivits över. Starta om appen efter att problemet åtgärdats.</Text></ScrollView>;
 if(!model.deletion.ready)return <AccountDeletionStatus deletion={model.deletion}/>;
 if(!ready)return <View style={[s.root,{justifyContent:'center',alignItems:'center'}]}><ActivityIndicator color={C.lime}/></View>;
 // On a new device, an authenticated account may have no local profile yet.
 // Wait for the first cloud read before deciding that onboarding is needed.
 if(!p && accountUser && syncPhase!=='synced')return <AccountSyncGate phase={syncPhase} message={syncStatus} onRetry={model.retrySync}/>;

 const authModal=<OnboardingAuthModal step={authPrompt}
 onEmail={()=>setAuthPrompt('email')}
 googleConfigured={!!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim()}
 googleBusy={model.accountBusy}
 hasEmailDraft={!!(model.accountEmail.trim()||model.accountPassword)}
 onGoogle={()=>{void model.googleAccountAction(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID??'','onboarding')}}
 onLater={()=>setAuthPrompt('benefits')}
 onDecline={()=>setAuthPrompt(null)}
 onBack={()=>{if(authPrompt==='email'){model.setAccountEmail('');model.setAccountPassword('');}setAuthPrompt('choice');}}
 emailForm={<View style={{gap:12}}>
  <Text style={{color:C.muted}}>Har du redan ett konto? När du loggar in hämtas kontots sparade plan och historik. Den nya onboarding-planen ersätter aldrig ditt befintliga konto. Gästregistreringar kan läggas till separat efter ditt godkännande.</Text>
  <TextInput accessibilityLabel="E-postadress" autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="E-postadress" placeholderTextColor={C.dim} value={model.accountEmail} onChangeText={model.setAccountEmail} style={s.input}/>
  <TextInput accessibilityLabel="Lösenord" autoCapitalize="none" autoComplete={model.accountMode==='signup'?'new-password':'current-password'} secureTextEntry placeholder="Lösenord" placeholderTextColor={C.dim} value={model.accountPassword} onChangeText={model.setAccountPassword} style={s.input}/>
  <Pressable accessibilityRole="button" disabled={model.accountBusy||!model.accountEmail.includes('@')||model.accountPassword.length<6} onPress={()=>model.accountAction(model.accountMode,'onboarding')} style={[s.loginButton,{opacity:model.accountBusy||!model.accountEmail.includes('@')||model.accountPassword.length<6?.5:1}]}><Text style={{fontWeight:'900',color:C.onAccent}}>{model.accountBusy?'Vänta…':model.accountMode==='signup'?'Skapa konto':'Logga in'}</Text></Pressable>
  <Pressable accessibilityRole="button" onPress={()=>model.setAccountMode(model.accountMode==='signup'?'login':'signup')} style={{minHeight:48,justifyContent:'center',alignItems:'center'}}><Text style={{color:C.lime,fontWeight:'800'}}>{model.accountMode==='signup'?'Jag har redan ett konto':'Skapa ett nytt konto'}</Text></Pressable>
 </View>}/>;
 if(!p)return <View style={s.root}>{showLogin && !accountUser?
 <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingLeft:Math.max(insets.left,24),paddingRight:Math.max(insets.right,24),paddingTop:Math.max(insets.top,30)+36,paddingBottom:Math.max(insets.bottom,40),gap:18}}>
 <Pressable accessibilityRole="button" onPress={leaveLogin} style={{minHeight:48,justifyContent:'center',alignSelf:'flex-start'}}><Text style={{color:C.lime,fontWeight:'800'}}>‹ Tillbaka till onboarding</Text></Pressable>
 <Text style={{fontSize:32,fontWeight:'900',color:C.white}}>Välkommen tillbaka</Text>
 <Text style={{color:C.muted,lineHeight:22}}>Logga in för att hämta din sparade plan och historik utan att göra om onboarding.</Text>
 <TextInput accessibilityLabel="E-postadress" autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="E-postadress" placeholderTextColor={C.dim} value={model.accountEmail} onChangeText={model.setAccountEmail} style={s.input}/>
 <TextInput accessibilityLabel="Lösenord" autoCapitalize="none" autoComplete="current-password" secureTextEntry placeholder="Lösenord" placeholderTextColor={C.dim} value={model.accountPassword} onChangeText={model.setAccountPassword} style={s.input}/>
 <Pressable accessibilityRole="button" accessibilityState={{disabled:model.accountBusy||!model.accountEmail.includes('@')||!model.accountPassword}} disabled={model.accountBusy||!model.accountEmail.includes('@')||!model.accountPassword} onPress={()=>model.accountAction('login','onboarding')} style={[s.loginButton,{opacity:model.accountBusy||!model.accountEmail.includes('@')||!model.accountPassword?0.5:1}]}><Text style={{fontWeight:'900',color:C.onAccent}}>{model.accountBusy?'Loggar in…':'Logga in'}</Text></Pressable>
 <Pressable accessibilityRole="button" accessibilityLabel="Fortsätt med Google" accessibilityState={{disabled:model.accountBusy||!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim()}} disabled={model.accountBusy||!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim()} onPress={()=>{void model.googleAccountAction(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID??'','onboarding')}} style={[s.loginButton,{backgroundColor:C.surface,borderWidth:1,borderColor:C.border,opacity:!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim()?.5:1}]}><Text style={{fontWeight:'800',color:C.white}}>{model.accountBusy?'Vänta…':'Fortsätt med Google'}</Text></Pressable>
 {!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim()?<Text style={{color:C.muted}}>Google-inloggning är inte konfigurerad i den här appversionen. Använd e-post tills vidare.</Text>:null}
 </ScrollView>:
 <View style={{flex:1}}><AppSessionOnboarding model={model} onCompleted={()=>{completedOnboardingRef.current=true;}}/>{!accountUser?<Pressable accessibilityRole="button" onPress={()=>setShowLogin(true)} style={{padding:16,paddingBottom:Math.max(insets.bottom,16),paddingLeft:Math.max(insets.left,16),paddingRight:Math.max(insets.right,16),minHeight:48,alignItems:'center',backgroundColor:C.background}}><Text style={{color:C.lime,fontWeight:'800'}}>Har du redan ett konto? Logga in</Text></Pressable>:null}</View>}
 <AppSessionOverlays model={model}/></View>;
 if(authPrompt!==null && !accountUser)return <View style={s.root}><AppSessionOnboarding model={model}/><AppSessionOverlays model={model}/>{authModal}</View>;
 return <View style={s.root}><ScrollView key={tab} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{width:'100%',maxWidth:680,alignSelf:'center',paddingLeft:Math.max(insets.left,16),paddingRight:Math.max(insets.right,16),paddingTop:Math.max(insets.top,16)+4,paddingBottom:24,gap:16}} showsVerticalScrollIndicator={false}>
 <ScreenHeader tab={tab} clock={clock} onNavigate={go} onBack={()=>{const leave=()=>{if(!model.goBack())go('profile');};if(tab==='account'&&!accountUser&&(model.accountEmail.trim()||model.accountPassword)){model.ask('Lämna inloggningen?','E-post och lösenord som du har skrivit in kommer inte att användas.',()=>{model.setAccountEmail('');model.setAccountPassword('');leave();},'Lämna inloggningen');}else leave();}}/>
 <AppScreenRouter model={model}/>
 </ScrollView><BottomNavigation tab={tab} onNavigate={go}/><AppSessionOverlays model={model}/>
 {authModal}
 </View>
}
const createS=(C:ThemeColors)=>StyleSheet.create({root:{flex:1,backgroundColor:C.background},input:{backgroundColor:C.surface,color:C.white,borderColor:C.border,borderWidth:1,borderRadius:14,padding:14,minHeight:50},loginButton:{backgroundColor:C.lime,borderRadius:14,minHeight:50,alignItems:'center',justifyContent:'center'}});
