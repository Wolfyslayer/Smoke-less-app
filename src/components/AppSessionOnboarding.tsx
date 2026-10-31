import React from 'react';
import {OnboardingScreen} from '../screens/OnboardingScreen';
import type {useSmokeLessSessionModel} from '../hooks/useSmokeLessSessionModel';
type Model=ReturnType<typeof useSmokeLessSessionModel>;
export function AppSessionOnboarding({model}:{model:Model}){
 const {onStep,setOnStep,mode,setMode,baseline,setBaseline,packSize,setPackSize,packPrice,setPackPrice,begin}=model;
 return <OnboardingScreen onStep={onStep} setOnStep={setOnStep} mode={mode} setMode={setMode} baseline={baseline} setBaseline={setBaseline} packSize={packSize} setPackSize={setPackSize} packPrice={packPrice} setPackPrice={setPackPrice} begin={begin}/>;
}
