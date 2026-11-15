const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(path,deps={}){const scope={exports:{},require:id=>{if(!(id in deps))throw Error(id);return deps[id];}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,scope);return scope.exports;}
const maintenance=load('src/domain/maintenance.ts',{'./personalTrends':{}}),domain=load('src/domain/reminders.ts',{'./maintenance':maintenance});
const {createReminderService:create}=load('src/reminderService.ts',{'./domain/reminders':domain});
const {reminderDefaults:defaults,isQuietTime:quiet,reminderRequests:requests,normalizeReminders:normalize}=domain;
function fixture(initial={}){const values=new Map(Object.entries(initial)),active=new Map(),events=[];let denied=false,failSchedule=0,failStore=false,failCancel=false;
 const storage={getItem:async key=>values.get(key)??null,setItem:async(key,value)=>{if(failStore)throw Error('disk');values.set(key,value);},removeItem:async key=>values.delete(key)};
 const service=create(storage,{permission:async()=>{events.push('permission');return !denied;},cancel:async id=>{events.push('cancel:'+id);if(failCancel)throw Error('cancel');active.delete(id);},scheduled:async()=>[...active.keys()],schedule:async r=>{events.push('schedule:'+r.identifier);if(failSchedule&&--failSchedule===0)throw Error('native');active.set(r.identifier,r);}});
 return {service,values,active,events,deny:()=>denied=true,failSchedule:()=>failSchedule=2,failStore:()=>failStore=true,failCancel:()=>failCancel=true};
}
test('quiet window handles overnight, boundaries and all-day silence',()=>{
 assert.equal(quiet(22,0,defaults),true);assert.equal(quiet(6,59,defaults),true);assert.equal(quiet(7,0,defaults),false);assert.equal(quiet(21,59,defaults),false);
 assert.equal(quiet(10,0,{...defaults,quietStart:9,quietEnd:17}),true);assert.equal(quiet(12,0,{...defaults,quietStart:7,quietEnd:7}),true);assert.equal(quiet(23,0,{...defaults,quiet:false}),false);
 assert.throws(()=>requests({...defaults,checkin:true,hour:23}));assert.throws(()=>requests({...defaults,hour:NaN}));assert.throws(()=>requests({...defaults,minute:60}));
 assert.equal(normalize(null).checkin,false);assert.equal(requests(defaults).length,0);
});
test('content is generic and schedules never read health or profile data',()=>{
 const list=requests({...defaults,checkin:true,risk:true,frequency:'weekly'});assert.equal(list.length,2);assert.equal(list[0].weekly,true);assert.equal(list[1].weekly,false);
 for(const item of list)assert.doesNotMatch(item.body,/rök|cigarett|antal|missat|konto|nedtrappning/i);
});
test('legacy preferences migrate without requesting permission or rescheduling',async()=>{
 const f=fixture({'smokeless:reminder-preference':'true','smokeless:reminder-hour':'18','smokeless:reminder-minute':'30','smokeless:reminder-frequency':'weekly','smokeless:reminder-id':'old'});f.active.set('old',{});
 const view=await f.service.read();assert.equal(view.settings.checkin,true);assert.equal(view.settings.frequency,'weekly');assert.equal(view.settings.hour,18);assert.equal(view.settings.minute,30);assert.equal(view.active,0);assert.equal(f.active.size,0);assert.ok(!f.events.includes('permission'));
});
test('parallel activations serialize, use stable IDs and leave only the final choices',async()=>{
 const f=fixture();await Promise.all([f.service.apply({...defaults,checkin:true,risk:true}),f.service.apply({...defaults,risk:true,riskHour:16})]);
 assert.equal(f.active.size,1);assert.equal([...f.active.values()][0].hour,16);assert.equal((await f.service.read()).active,1);
 await f.service.disable();assert.equal(f.active.size,0);assert.equal((await f.service.read()).settings.risk,false);
});
test('permission denial, disk failure and partial schedule failure leave no newly active reminders',async()=>{
 for(const failure of ['deny','failStore','failSchedule']){const f=fixture();f[failure]();await assert.rejects(f.service.apply({...defaults,checkin:true,risk:true}));assert.equal(f.active.size,0);}
 const f=fixture();f.failSchedule();await assert.rejects(f.service.apply({...defaults,checkin:true,risk:true}));await f.service.apply({...defaults,checkin:true});assert.equal(f.active.size,1);
});
test('cancel errors are surfaced and invalid preferences cannot cause automatic activation',async()=>{
 const f=fixture();f.failCancel();await assert.rejects(f.service.disable(),/telefonens inställningar/);
 const bad=fixture({'smokeless:reminders:v2':'broken'});bad.active.set('smokeless-checkin-v2',{});await assert.rejects(bad.service.read(),/kunde inte läsas/);assert.equal(bad.active.size,0);assert.ok(!bad.events.includes('permission'));
});
