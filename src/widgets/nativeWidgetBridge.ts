import {NativeModules,Platform} from 'react-native';
import type {WidgetSnapshot} from '../domain/widgetSnapshot';

type WidgetNativeModule={
 publish(date:string,todayCount:number,dailyGoal:number):Promise<void>;
 clear():Promise<void>;
};

/** A missing native module must never be mistaken for a successful privacy clear. */
function getWidgetModule():WidgetNativeModule|null{
 if(Platform.OS!=='android')return null;
 const module=NativeModules.SmokeLessWidget as WidgetNativeModule|undefined;
 if(!module||typeof module.publish!=='function'||typeof module.clear!=='function')return null;
 return module;
}

export async function publishNativeWidget(snapshot:WidgetSnapshot):Promise<void>{
 const module=getWidgetModule();
 if(!module)throw new Error('Android-widgetmodulen saknas. Bygg om Android-appen.');
 await module.publish(snapshot.date,snapshot.todayCount,snapshot.dailyGoal);
}

export async function clearNativeWidget():Promise<void>{
 const module=getWidgetModule();
 if(Platform.OS!=='android')return;
 if(!module)throw new Error('Android-widgetmodulen saknas. Bygg om Android-appen.');
 await module.clear();
}
