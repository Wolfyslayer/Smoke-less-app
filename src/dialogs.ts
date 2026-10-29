import {Alert,Platform} from 'react-native';
/** Native Alert is not implemented by React Native Web; use browser dialogs there. */
export function confirmAction(title:string,message:string,action:()=>void,destructive=false){
 if(Platform.OS==='web'){
  if(typeof window!=='undefined'&&window.confirm(title+'\n\n'+message))action();
  return;
 }
 Alert.alert(title,message,[{text:'Avbryt',style:'cancel'},{text:destructive?'Ta bort':'Bekräfta',style:destructive?'destructive':'default',onPress:action}]);
}
export function showMessage(title:string,message:string){
 if(Platform.OS==='web'){if(typeof window!=='undefined')window.alert(title+'\n\n'+message);return;}
 Alert.alert(title,message);
}
