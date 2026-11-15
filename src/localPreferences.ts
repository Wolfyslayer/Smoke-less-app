type Storage={getItem:(key:string)=>Promise<string|null>;setItem:(key:string,value:string)=>Promise<void>};
export function createLocalPreferences<T>(namespace:string,storage:Storage,normalize:(value:unknown)=>T){
 const pending=new Map<string,Promise<unknown>>();
 const key=(uid:string|null)=>`smokeless:${namespace}:v1:${uid===null?'guest':`account:${encodeURIComponent(uid)}`}`;
 return {key,defaults:()=>normalize(null),
  async load(uid:string|null):Promise<T>{
   const id=key(uid);await pending.get(id)?.catch(()=>{});
   const raw=await storage.getItem(id);
   try{return normalize(raw===null?null:JSON.parse(raw));}catch{return normalize(null);}
  },
  save(uid:string|null,value:T):Promise<void>{
   const id=key(uid),snapshot=JSON.stringify(normalize(value));
   const write=(pending.get(id)??Promise.resolve()).catch(()=>{}).then(()=>storage.setItem(id,snapshot));
   pending.set(id,write);
   void write.finally(()=>{if(pending.get(id)===write)pending.delete(id);}).catch(()=>{});
   return write;
  },
 };
}
export type LocalPreferences<T>=ReturnType<typeof createLocalPreferences<T>>;
