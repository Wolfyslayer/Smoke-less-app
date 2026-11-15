import AsyncStorage from '@react-native-async-storage/async-storage';import {Data,EMPTY,validateData} from './domain';const KEY='smoke-less-v6';export async function load():Promise<Data>{try{const raw=await AsyncStorage.getItem(KEY);if(!raw)return EMPTY;const value:unknown=JSON.parse(raw);return validateData(value)?value:EMPTY;}catch{return EMPTY;}}export async function save(value:Data){await AsyncStorage.setItem(KEY,JSON.stringify(value));}

/** A separate, immutable-by-convention recovery copy created before a cloud import. */
export async function backupBeforeCloudImport(value:Data,uid:string|null=null):Promise<string>{
 if(!validateData(value))throw new Error('Ogiltig lokal historik');
 if(uid!==null&&!/^[A-Za-z0-9_-]{1,128}$/.test(uid))throw new Error('Ogiltigt konto-ID');
 const identity=uid===null?'guest':'account:'+uid;
 const key='smoke-less-pre-cloud-import:v2:'+identity+':'+Date.now()+'-'+Math.random().toString(36).slice(2);
 await AsyncStorage.setItem(key,JSON.stringify(value));return key;
}
