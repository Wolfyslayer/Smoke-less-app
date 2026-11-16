import React,{useEffect,useMemo,useState,useSyncExternalStore} from 'react';
import {ActivityIndicator,View,useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';
import {ThemeContext,palettes} from './theme';
import {createThemePreference} from './themePreference';
import {resolveTheme} from './themeTokens';
import {getPreviewUpdateService} from './updates/previewUpdateClient';
export function ThemeProvider({children}:{children:React.ReactNode}){
 const [preference]=useState(()=>createThemePreference(AsyncStorage));
 const state=useSyncExternalStore(preference.subscribe,preference.getSnapshot,preference.getSnapshot);
 const system=useColorScheme();
 const name=resolveTheme(state.mode,system);
 const colors=palettes[name];
 useEffect(()=>{void preference.load();},[preference]);
 useEffect(()=>{const updates=getPreviewUpdateService();if(updates)void updates.check().catch(()=>{});},[]);
 useEffect(()=>{void SystemUI.setBackgroundColorAsync(colors.background).catch(()=>{});},[colors]);
 const value=useMemo(()=>({...state,name,colors,setMode:preference.setMode}),[state,name,colors,preference]);
 return <ThemeContext.Provider value={value}>{state.ready?children:<View style={{flex:1,backgroundColor:colors.background,justifyContent:'center',alignItems:'center'}}><ActivityIndicator color={colors.accent} accessibilityLabel="Läser utseende"/></View>}</ThemeContext.Provider>;
}
