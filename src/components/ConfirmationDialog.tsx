import React from 'react';
import {Modal,StyleSheet,Text,View} from 'react-native';
import {AppButton} from './ui';
import {C} from '../theme';

export type ConfirmationDialogState={title:string;message:string;confirm?:()=>void}|null;
export function ConfirmationDialog({dialog,onClose}:{dialog:ConfirmationDialogState;onClose:()=>void}){
 return <Modal visible={dialog!==null} transparent animationType="fade" onRequestClose={onClose}><View style={styles.dialogOverlay}><View style={styles.dialog}><Text style={styles.title}>{dialog?.title}</Text><Text style={styles.hint}>{dialog?.message}</Text>{dialog?.confirm?<AppButton title="Bekräfta" onPress={()=>{const fn=dialog.confirm;onClose();fn?.()}}/>:null}<AppButton title={dialog?.confirm?'Avbryt':'Okej'} secondary onPress={onClose}/></View></View></Modal>;
}
const styles=StyleSheet.create({
 dialogOverlay:{flex:1,justifyContent:'center',backgroundColor:'rgba(0,0,0,.72)',padding:24},
 dialog:{backgroundColor:'#221F1E',borderRadius:26,padding:24,gap:14,borderWidth:1,borderColor:'#403B39'},
 title:{fontSize:21,fontWeight:'800',color:'#FFF',flexShrink:1},
 hint:{fontSize:14,color:'#A6A1A0',lineHeight:21}
});
