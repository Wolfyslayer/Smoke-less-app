import React from 'react';
export default function ProgressRing({progress,size=222}:{progress:number;size?:number}){
 const clamped=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0));
 const radius=94;
 const circumference=2*Math.PI*radius;
 return <svg width={size} height={size} viewBox="0 0 222 222" aria-hidden="true" focusable="false" style={{position:'absolute',inset:0,overflow:'visible'}}>
  <defs><filter id="smokeless-ring-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4"/></filter></defs>
  <circle cx="111" cy="111" r={radius} fill="none" stroke="#19343E" strokeWidth="4"/>
  {clamped>0&&<><circle cx="111" cy="111" r={radius} fill="none" stroke="#5EDDE8" strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference*(1-clamped)} transform="rotate(-90 111 111)" filter="url(#smokeless-ring-glow)" opacity="0.55"/><circle cx="111" cy="111" r={radius} fill="none" stroke="#78E6EE" strokeWidth="4" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference*(1-clamped)} transform="rotate(-90 111 111)"/></>}
 </svg>;
}
