import {useState} from 'react';
export type ConfirmationDialogState={title:string;message:string;confirm?:()=>void;confirmLabel?:string};
export function useConfirmationDialog(){
 const [dialog,setDialog]=useState<ConfirmationDialogState|null>(null);
 const showMessage=(title:string,message:string)=>setDialog({title,message});
 const ask=(title:string,message:string,confirm:()=>void,confirmLabel?:string)=>setDialog({title,message,confirm,confirmLabel});
 return {dialog,setDialog,showMessage,ask};
}
