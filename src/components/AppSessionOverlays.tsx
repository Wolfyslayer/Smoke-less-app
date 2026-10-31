import React from 'react';
import {CigaretteRegisterModal} from './CigaretteRegisterModal';
import {ConfirmationDialog} from './ConfirmationDialog';
import type {useSmokeLessSessionModel} from '../hooks/useSmokeLessSessionModel';
type Model=ReturnType<typeof useSmokeLessSessionModel>;
export function AppSessionOverlays({model}:{model:Model}){
 const {registerOpen,setRegisterOpen,feeling,setFeeling,cigTrigger,setCigTrigger,register,skipRegister,dialog,setDialog}=model;
 return <><CigaretteRegisterModal visible={registerOpen} feeling={feeling} onFeelingChange={setFeeling} cigTrigger={cigTrigger} onTriggerChange={setCigTrigger} onClose={()=>setRegisterOpen(false)} onRegister={register} onSkip={skipRegister}/><ConfirmationDialog dialog={dialog} onClose={()=>setDialog(null)}/></>;
}
