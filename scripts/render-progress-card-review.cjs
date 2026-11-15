const fs=require('fs'),vm=require('vm'),ts=require('typescript');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {Resvg}=require('../.tmp/phase17-render/node_modules/@resvg/resvg-js');
function load(file,deps={}){const context={exports:{},require:id=>{if(!(id in deps))throw Error(id);return deps[id];}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.React,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);return context.exports;}
const model=load('src/domain/dailyShareCard.ts'),theme=load('src/theme.ts');let fontScale=1;
const Svg=React.forwardRef(({accessible,accessibilityRole,accessibilityLabel,...props},ref)=>React.createElement('svg',{...props,xmlns:'http://www.w3.org/2000/svg',role:accessibilityRole,'aria-label':accessibilityLabel}));
const svg={__esModule:true,default:Svg,Rect:'rect',Text:'text',TSpan:'tspan',Circle:({rotation,origin,...props})=>React.createElement('circle',{...props,transform:rotation?`rotate(${rotation} ${origin.replace(',',' ')})`:undefined})};
const {DailyProgressShareArtwork:Artwork}=load('src/components/DailyProgressShareArtwork.tsx',{'react':{__esModule:true,default:React,...React},'react-native':{View:({children})=>React.createElement('div',null,children),useWindowDimensions:()=>({fontScale})},'react-native-svg':svg,'../domain/dailyShareCard':model,'../theme':theme});
const samples=[[3,10,1],[0,0,1],[15,10,1],[2,0,1],[900000,1000000,1],[3,10,2.5]];
let y=40;const parts=[];
samples.forEach(([todayCount,dailyGoal,scale],index)=>{fontScale=scale;const layout=model.progressCardLayout(model.buildDailyShareCard({todayCount,dailyGoal}),scale);let output=renderToStaticMarkup(React.createElement(Artwork,{todayCount,dailyGoal}));output=output.slice(output.indexOf('<svg'),output.lastIndexOf('</svg>')+6).replace('width="100%"','width="340"').replace('height="100%"',`height="${layout.height}"`);parts.push(`<text x="20" y="${y-10}" fill="white" font-family="Arial" font-size="14">${todayCount} / ${dailyGoal}, text scale ${scale}</text><g transform="translate(20 ${y})">${output}</g>`);y+=layout.height+50;});
const sheet=`<svg xmlns="http://www.w3.org/2000/svg" width="380" height="${y}" viewBox="0 0 380 ${y}"><rect width="100%" height="100%" fill="#090A0C"/>${parts.join('')}</svg>`;
fs.writeFileSync('docs/assets/phase17-progress-review.svg',sheet);
fs.writeFileSync('docs/assets/phase17-progress-review.png',new Resvg(sheet,{font:{loadSystemFonts:true,defaultFontFamily:'Arial'},fitTo:{mode:'width',value:760}}).render().asPng());
console.log('Rendered six cases from the actual SVG component via a web adapter. Not an Android export test.');
