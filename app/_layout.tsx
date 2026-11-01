import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider} from 'react-native-safe-area-context';

// Android's system splash is only a brief launch placeholder.
// The full-screen image below is a normal React Native view.
export default function RootLayout() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // The React overlay has mounted, so the native launch screen can go away.
    void SplashScreen.hideAsync().catch(() => {});
    const timeout = setTimeout(() => setShowIntro(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" hidden={showIntro} />
      <View style={styles.root}>
        <Stack screenOptions={{headerShown: false, contentStyle: {backgroundColor: '#090A0C'}}} />
        {showIntro && (
          <View style={styles.intro} accessibilityLabel="Smoke Less startar" accessibilityRole="image">
            <Image
              source={require('../assets/branding/splash.png')}
              resizeMode="cover"
              style={styles.image}
            />
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#101a15'},
  intro: {position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#101a15', zIndex: 10},
  image: {width: '100%', height: '100%'},
});
