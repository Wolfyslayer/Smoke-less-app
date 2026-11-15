const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(path,deps={}){const scope={exports:{},Date,require:id=>{if(!(id in deps))throw Error(id);return deps[id];}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,scope);return scope.exports;}
const domain=load('src/domain.ts'),trends=load('src/domain/personalTrends.ts',{'../domain':domain});
const {maintenanceSummary:summary,reminderPattern:pattern,normalizeReminderFrequency:frequency}=load('src/domain/maintenance.ts',{'./personalTrends':trends});
const clock=new Date('2026-11-15T12:00:00').getTime(),blank=()=>({profile:null,entries:[],cravings:[],checkins:[]});
test('maintenance never manufactures smoke-free days or changes plans and history',()=>{
 const data=blank(),before=JSON.stringify(data),view=summary(data,clock);
 assert.equal(view.confirmedDays,0);assert.equal(view.checked,false);assert.equal(JSON.stringify(data),before);
 data.checkins=[{date:'2026-11-12',complete:true,smokeFree:true},{date:'2026-11-13',complete:true,smokeFree:true}];
 data.entries=[{id:'today',at:new Date(clock).toISOString()}];
 const withEntry=summary(data,clock);assert.equal(withEntry.longestStreak,2);assert.equal(withEntry.confirmedDays,2);assert.equal(withEntry.todayCount,1);assert.match(withEntry.message,/historik finns kvar/);
 assert.equal(data.entries.length,1);assert.equal(data.checkins.length,2);
});
test('reminder frequency is backward compatible and weekly is explicitly Monday',()=>{
 assert.equal(frequency(null),'daily');assert.equal(frequency('unknown'),'daily');assert.equal(frequency('weekly'),'weekly');
 assert.equal(pattern('weekly',19,0).weekday,2);assert.equal(pattern('weekly',19,0).type,'weekly');assert.equal(pattern('daily',19,0).type,'daily');
 for(const [h,m] of [[24,0],[-1,0],[12,60],[12,1.5],[NaN,0]])assert.throws(()=>pattern('weekly',h,m));
});
test('switching frequency cancels the old notification and leaves explicit reactivation',()=>{
 const settings=fs.readFileSync('src/screens/SettingsScreen.tsx','utf8');
 const action=settings.slice(settings.indexOf(' const changeReminderFrequency='),settings.indexOf(' const cancelReminder='));
 assert.ok(action.indexOf('await cancelReminder()')<action.indexOf("AsyncStorage.setItem('smokeless:reminder-frequency'"));
 assert.doesNotMatch(action,/scheduleNotificationAsync/);
 assert.match(settings,/SchedulableTriggerInputTypes\.WEEKLY,weekday:WEEKLY_REMINDER_DAY/);
 assert.match(settings,/if\(!reminderPreference\|\|reminderBusy\)return/);
 const routes=fs.readFileSync('src/components/ProgressScreenRoutes.tsx','utf8');assert.match(routes,/journey\.value\.phase==='maintenance'\?<MaintenanceSupport/);
});
