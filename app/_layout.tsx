import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import {Leaf} from 'lucide-react-native';
import {ThemeProvider} from '../src/ThemeProvider';
import {useAppTheme} from '../src/theme';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider} from 'react-native-safe-area-context';

// Android's system splash is only a brief launch placeholder.
// The themed launch overlay below is a normal React Native view.
export default function RootLayout() {
 return <SafeAreaProvider><ThemeProvider><ThemedLayout/></ThemeProvider></SafeAreaProvider>;
}
function ThemedLayout(){
  const {colors:C,name}=useAppTheme();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // The React overlay has mounted, so the native launch screen can go away.
    void SplashScreen.hideAsync().catch(() => {});
    const timeout = setTimeout(() => setShowIntro(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <StatusBar style={name==='dark'?'light':'dark'} hidden={showIntro} />
      <View style={{flex:1,backgroundColor:C.background}}>
        <Stack screenOptions={{headerShown: false, contentStyle: {backgroundColor:C.background}}} />
        {showIntro && (
          <View style={{position:'absolute',inset:0,backgroundColor:C.background,zIndex:10,alignItems:'center',justifyContent:'center',gap:20}} accessibilityLabel="Smoke Less startar">
            <Leaf color={C.accent} size={56}/>
            <Text style={{fontSize:32,fontWeight:'800',color:C.text}}>Smoke Less</Text>
            <ActivityIndicator color={C.accent}/>
          </View>
        )}
      </View>
    </>
  );
}
