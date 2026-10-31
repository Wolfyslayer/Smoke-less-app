// Offline, royalty-free breath-like audio. 44.1 kHz / 16-bit PCM for clean playback.
// Deterministic synthesis: no downloads, no speech, no third-party recordings.
const fs=require('node:fs');
const path=require('node:path');
const dir=path.join(__dirname,'../assets/audio');
fs.mkdirSync(dir,{recursive:true});
const RATE=44100;
function create(name,seconds,seed,inhale){
 const n=RATE*seconds;
 const b=Buffer.allocUnsafe(44+n*2);
 b.write('RIFF',0);b.writeUInt32LE(36+n*2,4);b.write('WAVEfmt ',8);
 b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);
 b.writeUInt32LE(RATE,24);b.writeUInt32LE(RATE*2,28);
 b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);
 b.write('data',36);b.writeUInt32LE(n*2,40);
 let r=seed>>>0,low=0,body=0,air=0;
 for(let i=0;i<n;i++){
  r=(Math.imul(1664525,r)+1013904223)>>>0;
  const white=(r/4294967295)*2-1;
  // Filter white noise into overlapping, soft air and breath bands.
  low+=0.018*(white-low);
  body+=0.09*(white-body);
  air+=0.27*(white-air);
  const t=i/RATE,progress=t/seconds;
  // Smooth starts and finishes, with a gentle, asymmetrical breathing envelope.
  const fadeIn=Math.min(1,t/(inhale?0.65:0.85));
  const fadeOut=Math.min(1,(seconds-t)/(inhale?0.9:1.25));
  const envelope=Math.pow(Math.max(0,fadeIn*fadeOut),1.4);
  const swell=inhale?(0.58+0.42*Math.sin(Math.PI*progress)):(0.9-0.38*progress);
  const texture=inhale?(0.66*(body-low)+0.34*(air-body)):(0.78*(body-low)+0.22*(air-body));
  const sample=Math.max(-1,Math.min(1,texture*envelope*swell*(inhale?0.92:1.08)));
  b.writeInt16LE(Math.round(sample*32767),44+i*2);
 }
 fs.writeFileSync(path.join(dir,name+'.wav'),b);
}
create('inhale',4,141,true);
create('exhale',6,812,false);
