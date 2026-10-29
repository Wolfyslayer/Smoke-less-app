import AsyncStorage from '@react-native-async-storage/async-storage';
import {initialIntervalPlan,IntervalPlan} from './interval';
const KEY='smokeless-interval-v1';
export async function loadIntervalPlan():Promise<IntervalPlan>{
 try{const value=await AsyncStorage.getItem(KEY);return value?{...initialIntervalPlan,...JSON.parse(value)}:initialIntervalPlan;}catch{return initialIntervalPlan;}
}
export async function saveIntervalPlan(plan:IntervalPlan){await AsyncStorage.setItem(KEY,JSON.stringify(plan));}
