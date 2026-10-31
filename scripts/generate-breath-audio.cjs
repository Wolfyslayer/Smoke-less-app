// Generate quiet, royalty-free breath-like noise locally; no recorded voice or remote files.
const fs=require('node:fs');const path=require('node:path');
const dir=path.join(__dirname,'../assets/audio');fs.mkdirSync(dir,{recursive:true});
function make(name,seconds,seed,volume){const rate=8000,n=seconds*rate,b=Buffer.alloc(44+n);b.write('RIFF',0);b.writeUInt32LE(36+n,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate,28);b.writeUInt16LE(1,32);b.writeUInt16LE(8,34);b.write('data',36);b.writeUInt32LE(n,40);let low=0,r=seed;for(let i=0;i<n;i++){r=(Math.imul(r,1664525)+1013904223)>>>0;const noise=r/4294967295*2-1;low=low*.76+noise*.24;const t=i/rate,fade=Math.pow(Math.sin(Math.PI*t/seconds),.8),sample=(low*.8+noise*.2)*fade*volume;b[44+i]=Math.max(0,Math.min(255,Math.round(128+sample))) }fs.writeFileSync(path.join(dir,name+'.wav'),b)}
make('inhale',4,141,36);make('exhale',6,812,32);
