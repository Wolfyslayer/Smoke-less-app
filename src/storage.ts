import AsyncStorage from '@react-native-async-storage/async-storage';
import {type Data,validateData} from './domain';
import {writeAccountScoped} from './accountDeletionSafety';
const KEY='smoke-less-v6';
export async function load():Promise<Data>{
 let raw:string|null;
 try{raw=await AsyncStorage.getItem(KEY);}catch{throw new Error('Gästhistoriken kunde inte läsas. Ingen data har ändrats. Försök igen.');}
 if(raw===null)return {profile:null,entries:[],cravings:[],checkins:[]};
 let value:unknown;
 try{value=JSON.parse(raw);}catch{throw new Error('Gästhistoriken är skadad. Ingen data har ändrats.');}
 if(!validateData(value))throw new Error('Gästhistoriken har ogiltigt format. Ingen data har ändrats.');
 return value;
}
export async function save(value:Data){
 if(!validateData(value))throw new Error('Ogiltig gästhistorik. Ingen data har ändrats.');
 await AsyncStorage.setItem(KEY,JSON.stringify(value));
}

/** A separate, immutable-by-convention recovery copy created before a cloud import. */
export async function backupBeforeCloudImport(value:Data,uid:string|null=null):Promise<string>{
 if(!validateData(value))throw new Error('Ogiltig lokal historik');
 if(uid!==null&&!/^[A-Za-z0-9_-]{1,128}$/.test(uid))throw new Error('Ogiltigt konto-ID');
 const identity=uid===null?'guest':'account:'+uid;
 const key='smoke-less-pre-cloud-import:v2:'+identity+':'+Date.now()+'-'+Math.random().toString(36).slice(2);
 await writeAccountScoped(AsyncStorage,uid,key,JSON.stringify(value));return key;
}
