import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialProfile, Profile } from './model';
const KEY = 'smokeless-profile-v1';
export async function loadProfile(): Promise<Profile> {
 try { const raw = await AsyncStorage.getItem(KEY); return raw ? {...initialProfile,...JSON.parse(raw)} : initialProfile; }
 catch { return initialProfile; }
}
export async function saveProfile(profile: Profile) { await AsyncStorage.setItem(KEY,JSON.stringify(profile)); }
