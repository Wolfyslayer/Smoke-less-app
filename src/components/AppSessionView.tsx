import React from 'react';
import {ActivityIndicator,ScrollView,StyleSheet,Text,View} from 'react-native';
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
 const {ready,loadError,tab,clock,p,go,accountUser,syncStatus}=model;
 if(loadError)return <View style={[s.root,{justifyContent:'center',alignItems:'center',padding:24,gap:16}]}><Text style={{color:C.white,textAlign:'center'}}>{loadError}</Text><Text style={{color:C.dim,textAlign:'center'}}>Ingen historik har skrivits över. Starta om appen efter att problemet åtgärdats.</Text></View>;
 if(!ready)return <View style={[s.root,{justifyContent:'center',alignItems:'center'}]}><ActivityIndicator color={C.lime}/></View>;
 // On a new device, an authenticated account may have no local profile yet.\n // Wait for the first cloud read before deciding that onboarding is needed.\n if(!p && accountUser && syncStatus!=='Synkroniserad med Firestore') {\n  return <View style={[s.root,{justifyContent:'center',alignItems:'center',padding:24,gap:14}]}>\n   {(!syncStatus || syncStatus==='Synkroniserar…')?<ActivityIndicator color={C.lime}/>:null}\n   <Text style={{color:C.white,textAlign:'center'}}>{syncStatus||'Hämtar din sparade plan…'}</Text>\n   <Text style={{color:C.dim,textAlign:'center'}}>Din onboarding visas inte förrän kontots molndata har kontrollerats. Kontrollera internetanslutningen om hämtningen misslyckas.</Text>\n  </View>;\n }\n if(!p)return <View style={s.root}><AppSessionOnboarding model={model}/><AppSessionOverlays model={model}/></View>;
 return <View style={s.root}><ScrollView key={tab} contentContainerStyle={{paddingHorizontal:20,paddingTop:Math.max(insets.top,18)+12,paddingBottom:32,gap:20}} showsVerticalScrollIndicator={false}>
 <ScreenHeader tab={tab} clock={clock} onNavigate={go}/>
 {(['home','plan','register','stats','history','sos','benefits'] as Tab[]).includes(tab)?<SectionIntroCard tab={tab as 'home'|'plan'|'register'|'stats'|'history'|'sos'|'benefits'}/>:null}
 <AppScreenRouter model={model}/>
 </ScrollView><BottomNavigation tab={tab} onNavigate={go}/><AppSessionOverlays model={model}/></View>
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:C.background}});
