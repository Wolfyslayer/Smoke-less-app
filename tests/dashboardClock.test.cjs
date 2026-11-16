const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(file,deps={}){const c={exports:{},Date,require:id=>{assert(id in deps,id);return deps[id]}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,c);return c.exports;}
test('a fresh registration enters dashboard totals on the next clock tick within the same minute',()=>{
 const domain=load('src/domain.ts');let clock=Date.parse('2026-11-16T12:00:00.000Z');
 const data={profile:null,entries:[{id:'qa-entry',at:new Date(clock+500).toISOString()}],cravings:[],checkins:[]};
 let previousDeps,result;
 const react={useState:initial=>[initial===domain.EMPTY?data:initial,()=>{}],useRef:value=>({current:value}),useEffect:()=>{},useMemo:(fn,deps)=>{if(!previousDeps||deps.some((d,i)=>!Object.is(d,previousDeps[i]))){result=fn();previousDeps=deps}return result}};
 const deps={react,'../domain':domain,'../utils/dashboardMetrics':load('src/utils/dashboardMetrics.ts',{'../domain':domain}),'./useLiveClock':{useLiveClock:()=>clock}};
 for(const name of ['useAccountDeletion','useActionPlans','usePersonalJourney','useCloudSync','useLocalSession','useConfirmationDialog','useOnboardingFlow','useCigaretteRegistration','useAccountFlow','useSosFlow','useSettingsFlow','useSessionNavigation','useSessionActions'])deps[`./${name}`]={[name]:()=>({ready:true,sessionReady:true,tab:'home'})};
 const {useSmokeLessSessionModel:render}=load('src/hooks/useSmokeLessSessionModel.ts',deps);
 assert.equal(render(null,()=>null).todayCount,0,'genuinely future timestamps remain excluded');
 clock+=1000;
 const current=render(null,()=>null);assert.equal(current.todayCount,1);assert.equal(current.last.id,'qa-entry');assert.equal(current.duration,'0 min');
 clock+=60000;assert.equal(render(null,()=>null).duration,'1 min');
});
