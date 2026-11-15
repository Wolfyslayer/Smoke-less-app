import React from 'react';
import {Text,View} from 'react-native';
import Constants from 'expo-constants';
import {AppButton,AppCard} from '../components/ui';
import {useThemeColors} from '../theme';
import type {Tab} from '../hooks/useSessionNavigation';
export function AboutScreen({onNavigate}:{onNavigate:(tab:Tab)=>void}){
 const C=useThemeColors();const version=Constants.expoConfig?.version;
 return <View style={{gap:24}}><AppCard><Text accessibilityRole="header" style={{fontSize:26,fontWeight:'700',color:C.text}}>Smoke Less</Text><Text selectable style={{fontSize:15,color:C.textMuted}}>{version?`Appversion ${version}`:'Utvecklingsversion'}</Text><Text style={{fontSize:16,lineHeight:24,color:C.textMuted}}>Följ dina vanor och hitta stöd i din egen takt. Appen ersätter inte medicinsk rådgivning.</Text></AppCard><AppButton title="Kunskap och källor" secondary onPress={()=>onNavigate('benefits')}/><AppButton title="Hjälp vid röksug" secondary onPress={()=>onNavigate('sos')}/><AppButton title="Data och integritet" secondary onPress={()=>onNavigate('backup')}/></View>;
}
