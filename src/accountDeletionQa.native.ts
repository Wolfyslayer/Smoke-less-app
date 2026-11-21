import Constants from 'expo-constants';
import {getApp} from '@react-native-firebase/app';
import {getAuth} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {localDeletionQa} from './accountDeletionQaPolicy.cjs';

const enabled=Constants.expoConfig?.extra?.localAccountDeletionQa===true;
export const localDeletionQaConfig=localDeletionQa({enabled,development:__DEV__,packageId:Constants.expoConfig?.android?.package,firebaseProject:enabled?getApp().options.projectId:null});
// Execute before any auth observer or Firestore access. There is no live fallback.
if(localDeletionQaConfig){
 getAuth().useEmulator(localDeletionQaConfig.auth);
 firestore().useEmulator(localDeletionQaConfig.firestoreHost,localDeletionQaConfig.firestorePort);
}
