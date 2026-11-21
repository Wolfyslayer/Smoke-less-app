const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(path,deps={}){const context={exports:{},require:id=>{if(id==='./accountDeletionSafety')return load('src/accountDeletionSafety.ts');if(!(id in deps))throw Error(id);return deps[id];}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);return context.exports;}
const catalog=load('src/data/sosIdeas.ts');
const {normalizeActionPlans:normalize,toggleActionStep:toggle,moveActionStep:move,rememberActionStrategy:remember,clearActionPlan:clear}=load('src/domain/actionPlans.ts',{'../data/sosIdeas':catalog});
const {createLocalPreferences:create}=load('src/localPreferences.ts');
const plain=v=>JSON.parse(JSON.stringify(v));
test('plans normalize version, unknown steps, duplicates and length without personal fields',()=>{
 for(const value of [null,{},'bad',{version:2,plans:{Stress:['water']}}])assert.deepEqual(plain(normalize(value)),{version:1,plans:{}});
 const actual=normalize({version:1,email:'private',plans:{Stress:['water','bad','water','move','hands','wait'],unknown:['water']}});
 assert.deepEqual(plain(actual),{version:1,plans:{Stress:['water','move','hands']}});
 assert.equal(new Set(catalog.sosIdeas.map(s=>s.id)).size,catalog.sosIdeas.length);
});
test('selection is immutable, bounded, ordered and reversible per situation',()=>{
 const initial=normalize(null);let plan=toggle(initial,'Stress','water');plan=toggle(plan,'Stress','move');plan=toggle(plan,'Stress','hands');
 assert.deepEqual(plain(toggle(plan,'Stress','wait')),plain(plan));
 assert.deepEqual(plain(move(plan,'Stress','hands',-1).plans.Stress),['water','hands','move']);
 assert.deepEqual(plain(move(plan,'Stress','water',-1)),plain(plan));
 assert.equal(initial.plans.Stress,undefined);
 plan=toggle(plan,'Efter mat','after-meal');const cleared=clear(plan,'Stress');
 assert.equal(cleared.plans.Stress,undefined);assert.deepEqual(plain(cleared.plans['Efter mat']),['after-meal']);
 assert.equal(toggle(plan,'Stress','unknown').plans.Stress.length,3);
});
test('remembering a selected strategy is idempotent and never invents an old unknown strategy',()=>{
 const title=catalog.sosIdeas.find(s=>s.id==='water').title;
 const saved=remember(normalize(null),'Stress',title),again=remember(saved,'Stress',title);
 assert.deepEqual(plain(again),plain(saved));
 assert.deepEqual(plain(remember(saved,'Stress','old missing text')),plain(saved));
});
test('saved plans survive reopening and remain isolated from guests, accounts and history',async()=>{
 const records=new Map([['history','untouched']]),store=create('action-plans',{getItem:async k=>records.get(k)??null,setItem:async(k,v)=>records.set(k,v)},normalize);
 await store.save(null,toggle(normalize(null),'Stress','water'));await store.save('guest',toggle(normalize(null),'Vana','wait'));
 assert.deepEqual(plain((await store.load(null)).plans.Stress),['water']);assert.equal((await store.load('new')).plans.Stress,undefined);
 assert.deepEqual(plain((await store.load('guest')).plans.Vana),['wait']);assert.equal(records.get('history'),'untouched');
 await store.save(null,clear(await store.load(null),'Stress'));assert.deepEqual(plain((await store.load(null)).plans),{});
});
test('using or saving a plan never logs a craving automatically',()=>{
 const view=fs.readFileSync('src/components/PersonalActionPlan.tsx','utf8');
 assert.match(view,/onPress=\{\(\)=>onUseStep\(id\)\}/);
 assert.doesNotMatch(view,/addCravingEntry|onSave\(|setData\(|fetch\(/);
 assert.match(view,/accessibilityRole="checkbox"/);assert.match(view,/minWidth:48,minHeight:48/);
 const routes=fs.readFileSync('src/components/ProgressScreenRoutes.tsx','utf8');assert.match(routes,/sosProps\.onSelectTip\(index\)/);
});
