import AsyncStorage from '@react-native-async-storage/async-storage';
import {createLocalPreferences} from '../localPreferences';
import {normalizeActionPlans} from '../domain/actionPlans';
import {useLocalPreferences} from './useLocalPreferences';
const store=createLocalPreferences('action-plans',AsyncStorage,normalizeActionPlans);
export function useActionPlans(uid:string|null){return useLocalPreferences(store,uid);}
