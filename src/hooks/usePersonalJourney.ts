import AsyncStorage from '@react-native-async-storage/async-storage';
import {createLocalPreferences} from '../localPreferences';
import {normalizeJourney} from '../domain/personalJourney';
import {useLocalPreferences} from './useLocalPreferences';
const store=createLocalPreferences('journey',AsyncStorage,normalizeJourney);
export function usePersonalJourney(uid:string|null){return useLocalPreferences(store,uid);}
