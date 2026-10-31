import React from 'react';
import {ActivityIndicator,View} from 'react-native';
import {useAuthObserver} from './hooks/useAuthObserver';
import {SmokeLessSession} from './SmokeLessSession';
import {C} from './theme';

export default function SmokeLess(){
 const {authState,activeUidRef}=useAuthObserver();
 if(!authState.initialized)return <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:C.background}}><ActivityIndicator color={C.lime}/></View>;
 return <SmokeLessSession key={authState.user?.uid??'guest'} sessionUser={authState.user} verifyCurrentUid={()=>activeUidRef.current}/>;
}
