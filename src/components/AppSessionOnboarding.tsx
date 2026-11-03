import React from 'react';
import {OnboardingScreen} from '../screens/OnboardingScreen';
import type {useSmokeLessSessionModel} from '../hooks/useSmokeLessSessionModel';
type Model=ReturnType<typeof useSmokeLessSessionModel>;
export function AppSessionOnboarding({model,onCompleted}:{model:Model;onCompleted?:()=>void}){
 const {onStep,setOnStep,mode,setMode,scheduled,setScheduled,quitDay,setQuitDay,baseline,setBaseline,packSize,setPackSize,packPrice,setPackPrice,begin}=model;
 return <OnboardingScreen onStep={onStep} setOnStep={setOnStep} mode={mode} setMode={setMode} scheduled={scheduled} setScheduled={setScheduled} quitDay={quitDay} setQuitDay={setQuitDay} baseline={baseline} setBaseline={setBaseline} packSize={packSize} setPackSize={setPackSize} packPrice={packPrice} setPackPrice={setPackPrice} begin={begin}/>;
}
