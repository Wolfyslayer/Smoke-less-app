import React,{useState} from 'react';
import {ActivityIndicator,Pressable,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppSessionOnboarding} from './AppSessionOnboarding';
import {AppScreenRouter} from './AppScreenRouter';
import {SectionIntroCard} from './SectionIntroCard';
import {BottomNavigation} from './BottomNavigation';
import {ScreenHeader} from './ScreenHeader';
import {AppSessionOverlays} from './AppSessionOverlays';
import type {useSmokeLessSessionModel} from '../hooks/useSmokeLessSessionModel';
import type {Tab} from '../hooks/useSessionNavigation';
import {C} from '../theme';

type SessionModel=ReturnType<typeof useSmokeLessSessionModel>;
export function AppSessionView({model}:{model:SessionModel}){
 const insets=useSafeAreaInsets();
 const [showLogin,setShowLogin]=useState(false);
 const {ready,loadError,tab,clock,p,go,accountUser,syncStatus}=model;
 if(loadError)return <View style={[s.root,{justifyContent:'center',alignItems:'center',padding:24,gap:16}]}><Text style={{color:C.white,textAlign:'center'}}>{loadError}</Text><Text style={{color:C.dim,textAlign:'center'}}>Ingen historik har skrivits över. Starta om appen efter att problemet åtgärdats.</Text></View>;
 if(!ready)return <View style={[s.root,{justifyContent:'center',alignItems:'center'}]}><ActivityIndicator color={C.lime}/></View>;
 // On a new device, an authenticated account may have no local profile yet.
 // Wait for the first cloud read before deciding that onboarding is needed.
 if(!p && accountUser && syncStatus!=='Synkroniserad med Firestore') {
  return <View style={[s.root,{justifyContent:'center',alignItems:'center',padding:24,gap:14}]}>
   {(!syncStatus || syncStatus==='Synkroniserar…')?<ActivityIndicator color={C.lime}/>:null}
   <Text style={{color:C.white,textAlign:'center'}}>{syncStatus||'Hämtar din sparade plan…'}</Text>
   <Text style={{color:C.dim,textAlign:'center'}}>Din onboarding visas inte förrän kontots molndata har kontrollerats. Kontrollera internetanslutningen om hämtningen misslyckas.</Text>
  </View>;
 }
 if(!p)return <View style={s.root}>{showLogin && !accountUser?
 <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingHorizontal:24,paddingTop:Math.max(insets.top,30)+36,paddingBottom:40,gap:18}}>
 <Pressable accessibilityRole="button" onPress={()=>setShowLogin(false)}><Text style={{color:C.lime,fontWeight:'800'}}>‹ Tillbaka till onboarding</Text></Pressable>
 <Text style={{fontSize:32,fontWeight:'900',color:C.white}}>Välkommen tillbaka</Text>
 <Text style={{color:C.muted,lineHeight:22}}>Logga in för att hämta din sparade plan och historik utan att göra om onboarding.</Text>
 <TextInput accessibilityLabel="E-postadress" autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="E-postadress" placeholderTextColor={C.dim} value={model.accountEmail} onChangeText={model.setAccountEmail} style={s.input}/>
 <TextInput accessibilityLabel="Lösenord" autoCapitalize="none" autoComplete="current-password" secureTextEntry placeholder="Lösenord" placeholderTextColor={C.dim} value={model.accountPassword} onChangeText={model.setAccountPassword} style={s.input}/>
 <Pressable accessibilityRole="button" accessibilityState={{disabled:model.accountBusy||!model.accountEmail.includes('@')||!model.accountPassword}} disabled={model.accountBusy||!model.accountEmail.includes('@')||!model.accountPassword} onPress={()=>model.accountAction('login')} style={[s.loginButton,{opacity:model.accountBusy||!model.accountEmail.includes('@')||!model.accountPassword?0.5:1}]}><Text style={{fontWeight:'900',color:C.background}}>{model.accountBusy?'Loggar in…':'Logga in'}</Text></Pressable>
 </ScrollView>:
 <View style={{flex:1}}><AppSessionOnboarding model={model}/>{!accountUser?<Pressable accessibilityRole="button" onPress={()=>setShowLogin(true)} style={{padding:16,alignItems:'center',backgroundColor:C.background}}><Text style={{color:C.lime,fontWeight:'800'}}>Har du redan ett konto? Logga in</Text></Pressable>:null}</View>}
 <AppSessionOverlays model={model}/></View>;
 return <View style={s.root}><ScrollView key={tab} contentContainerStyle={{paddingHorizontal:20,paddingTop:Math.max(insets.top,18)+12,paddingBottom:32,gap:20}} showsVerticalScrollIndicator={false}>
 <ScreenHeader tab={tab} clock={clock} onNavigate={go}/>
 {(['home','plan','register','stats','history','sos','benefits'] as Tab[]).includes(tab)?<SectionIntroCard tab={tab as 'home'|'plan'|'register'|'stats'|'history'|'sos'|'benefits'}/>:null}
 <AppScreenRouter model={model}/>
 </ScrollView><BottomNavigation tab={tab} onNavigate={go}/><AppSessionOverlays model={model}/></View>
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:C.background},input:{backgroundColor:C.surface,color:C.white,borderColor:C.border,borderWidth:1,borderRadius:14,padding:14,minHeight:50},loginButton:{backgroundColor:C.lime,borderRadius:14,minHeight:50,alignItems:'center',justifyContent:'center'}});
