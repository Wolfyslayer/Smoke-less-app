import {useState} from 'react';
export type ConfirmationDialogState={title:string;message:string;confirm?:()=>void};
export function useConfirmationDialog(){
 const [dialog,setDialog]=useState<ConfirmationDialogState|null>(null);
 const showMessage=(title:string,message:string)=>setDialog({title,message});
 const ask=(title:string,message:string,confirm:()=>void)=>setDialog({title,message,confirm});
 return {dialog,setDialog,showMessage,ask};
}
