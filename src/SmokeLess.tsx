import React from 'react';
import {ActivityIndicator,View} from 'react-native';
import {useAuthObserver} from './hooks/useAuthObserver';
import {SmokeLessSession} from './SmokeLessSession';
import {useThemeColors,type ThemeColors} from './theme';

export default function SmokeLess(){
 const C=useThemeColors();

 const {authState,activeUidRef}=useAuthObserver();
 if(!authState.initialized)return <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:C.background}}><ActivityIndicator color={C.lime}/></View>;
 return <SmokeLessSession key={authState.user?.uid??'guest'} sessionUser={authState.user} verifyCurrentUid={()=>activeUidRef.current}/>;
}
