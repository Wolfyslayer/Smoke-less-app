const test=require('node:test');
const assert=require('node:assert/strict');
process.env.TZ='Europe/Stockholm';
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(path,deps={}){const context={exports:{},Date,require:id=>{if(!(id in deps))throw Error(id);return deps[id];}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);return context.exports;}
const domain=load('src/domain.ts'),{buildPersonalTrends:build}=load('src/domain/personalTrends.ts',{'../domain':domain});
const blank=()=>({profile:null,entries:[],cravings:[],checkins:[]});
const time=day=>new Date(day+'T12:00:00').getTime();
const confirmed=day=>({date:day,complete:true,smokeFree:true});
test('empty periods have explicit missing coverage and no invented smoke-free days',()=>{
 const result=build(blank(),time('2026-11-15'));
 assert.equal(result.week.current.start,'2026-11-02');assert.equal(result.week.current.end,'2026-11-08');
 assert.equal(result.week.current.days,7);assert.equal(result.week.current.confirmedDays,0);
 assert.equal(result.week.entryChange,null);assert.equal(result.longestStreak,0);
 assert.equal(result.recentDays.every(d=>!d.complete&&!d.smokeFree&&d.goal===null),true);
});
test('calendar months compare daily averages rather than unequal month totals',()=>{
 const data=blank();
 for(const [month,days] of [[9,30],[10,31]])for(let d=1;d<=days;d++){
  const day=`2026-${month}-${String(d).padStart(2,'0')}`.replace('2026-9-','2026-09-');
  data.checkins.push({date:day,complete:true,smokeFree:false});
  data.entries.push({id:day,at:new Date(time(day)).toISOString()});
  data.cravings.push({id:day,at:new Date(time(day)).toISOString()});
 }
 const result=build(data,time('2026-11-15'));
 assert.equal(result.month.current.days,31);assert.equal(result.month.previous.days,30);
 assert.equal(result.month.current.entries,31);assert.equal(result.month.entryChange,0);
 assert.equal(result.month.cravingChange,0);
});
test('a directional consumption comparison requires complete check-ins in both weeks',()=>{
 const data=blank();
 for(let day=2;day<=15;day++){
  const key=`2026-11-${String(day).padStart(2,'0')}`;
  data.checkins.push({date:key,complete:true,smokeFree:false});
  for(let i=0;i<(day>=9?2:1);i++)data.entries.push({id:`${key}:${i}`,at:new Date(time(key)).toISOString()});
 }
 assert.equal(build(data,time('2026-11-16')).week.entryChange,1);
 data.checkins.pop();assert.equal(build(data,time('2026-11-16')).week.entryChange,null);
});
test('future/invalid entries and check-ins cannot inflate records or streaks',()=>{
 const data=blank();data.entries=[{id:'future',at:'2026-12-01T12:00:00Z'},{id:'bad',at:'bad'}];
 data.cravings=[{id:'future',at:'2026-12-01T12:00:00Z'},{id:'bad',at:'bad'}];
 data.checkins=[confirmed('2026-11-14'),confirmed('2026-11-16'),confirmed('2026-02-30')];
 const r=build(data,time('2026-11-15'));assert.equal(r.confirmedSmokeFreeDays,1);assert.equal(r.currentStreak,1);
 assert.equal(r.streakEnd,'2026-11-14');assert.equal(r.week.current.entries,0);assert.equal(r.month.current.cravings,0);
});
test('unconfirmed gaps and contradictory data break records without erasing longest run',()=>{
 const data=blank();data.checkins=['2026-11-07','2026-11-08','2026-11-10','2026-11-13','2026-11-14'].map(confirmed);
 data.entries=[{id:'c',at:new Date(time('2026-11-14')).toISOString()}];
 const r=build(data,time('2026-11-15'));assert.equal(r.longestStreak,2);assert.equal(r.currentStreak,0);
 assert.equal(r.recentDays.find(d=>d.day==='2026-11-14').complete,false);
 data.checkins.push({date:'2026-11-13',complete:false,smokeFree:false});
 assert.equal(build(data,time('2026-11-15')).recentDays.find(d=>d.day==='2026-11-13').complete,false);
});
test('plan changes never manufacture historical goals or rewrite records',()=>{
 const data=blank();data.profile={mode:'reduce',baseline:12,packSize:20,packPrice:80,speed:'balanced',startAt:'2026-11-13T12:00:00Z',originalStartAt:'2026-10-01T12:00:00Z',planStartTarget:5,dailyTargetOverride:null};
 const before=JSON.stringify(data),r=build(data,time('2026-11-15'));
 assert.equal(r.recentDays.find(d=>d.day==='2026-11-12').goal,null);
 assert.equal(r.recentDays.find(d=>d.day==='2026-11-13').goal,5);
 assert.equal(JSON.stringify(data),before);
 data.profile.mode='quit';assert.equal(build(data,time('2026-11-15')).recentDays.at(-1).goal,0);
});
test('calendar days survive Swedish DST and year boundaries',()=>{
 for(const day of ['2026-03-30','2026-10-26','2027-01-01']){
  const r=build(blank(),time(day));assert.equal(r.week.current.days,7);assert.equal(r.week.previous.days,7);
  assert.equal(new Set(r.recentDays.map(d=>d.day)).size,7);assert.equal(r.recentDays.at(-1).day,day);
 }
});
test('large histories are aggregated without an input-sized calendar-day expansion',()=>{
 const data=blank();data.entries=Array.from({length:20000},(_,i)=>({id:String(i),at:'2026-11-03T12:00:00Z'}));
 assert.equal(build(data,time('2026-11-15')).week.current.entries,20000);
});
test('dashboard and trends exclude future counts while history remains available',()=>{
 const {getDashboardMetrics}=load('src/utils/dashboardMetrics.ts',{'../domain':domain});
 const data=blank();data.entries=[{id:'past',at:'2026-11-15T08:00:00Z'},{id:'future',at:'2026-11-15T23:00:00Z'}];
 data.cravings=[{id:'future',at:'2026-12-01T12:00:00Z'}];
 const result=getDashboardMetrics(data,time('2026-11-15'));
 assert.equal(result.todayCount,1);assert.equal(result.weekly.at(-1),1);assert.equal(result.last.id,'past');
 assert.equal(result.recentCravings.length,0);assert.equal(result.sorted.length,2);
 assert.equal(build(data,time('2026-11-15')).recentDays.at(-1).entries,result.todayCount);
});
