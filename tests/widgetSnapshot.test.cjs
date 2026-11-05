const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const source=fs.readFileSync('src/domain/widgetSnapshot.ts','utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const context={exports:{},Number,Math,Date,Object};
vm.runInNewContext(js,context);
const {makeWidgetSnapshot,readWidgetSnapshot}=context.exports;
test('opt-in required and snapshot contains only approved aggregates',()=>{
 assert.equal(makeWidgetSnapshot({enabled:false,date:'2026-11-05',todayCount:1,dailyGoal:19}),null);
 const card=makeWidgetSnapshot({enabled:true,date:'2026-11-05',todayCount:1,dailyGoal:19,email:'secret@example.com',entries:[{id:'secret'}]});
 assert.deepEqual(Object.keys(card).sort(),['version','date','todayCount','dailyGoal','remaining','progressPercent'].sort());
 assert.equal(card.remaining,18);assert.equal(card.progressPercent,5);
 assert.doesNotMatch(JSON.stringify(card),/secret/);
});
test('zero goal, over goal and malformed counts',()=>{
 assert.equal(makeWidgetSnapshot({enabled:true,date:'2026-11-05',todayCount:0,dailyGoal:0}).progressPercent,0);
 assert.equal(makeWidgetSnapshot({enabled:true,date:'2026-11-05',todayCount:2,dailyGoal:0}).progressPercent,100);
 const over=makeWidgetSnapshot({enabled:true,date:'2026-11-05',todayCount:15,dailyGoal:10});
 assert.equal(over.remaining,0);assert.equal(over.progressPercent,100);assert.equal(over.todayCount,15);
 assert.equal(makeWidgetSnapshot({enabled:true,date:'2026-11-05',todayCount:-3,dailyGoal:NaN}).dailyGoal,0);
});
test('clamp extreme numbers to the Android bridge signed 32-bit range',()=>{
 const card=makeWidgetSnapshot({enabled:true,date:'2026-11-05',todayCount:Number.MAX_SAFE_INTEGER,dailyGoal:Infinity});
 assert.equal(card.todayCount,2147483647);
 assert.equal(card.dailyGoal,0);
 assert.equal(readWidgetSnapshot(card,'2026-11-05').todayCount,2147483647);
 assert.equal(readWidgetSnapshot({...card,todayCount:Number.MAX_SAFE_INTEGER},'2026-11-05'),null);
});
test('reject stale, tampered, extra-field and invalid-date snapshots',()=>{
 const card=makeWidgetSnapshot({enabled:true,date:'2026-11-05',todayCount:1,dailyGoal:19});
 assert.equal(readWidgetSnapshot(card,'2026-11-06'),null);
 assert.equal(readWidgetSnapshot({...card,remaining:19},'2026-11-05'),null);
 assert.equal(readWidgetSnapshot({...card,token:'secret'},'2026-11-05'),null);
 assert.equal(readWidgetSnapshot({...card,todayCount:-1},'2026-11-05'),null);
 assert.equal(readWidgetSnapshot(card,'2026-11-05').remaining,18);
 assert.equal(makeWidgetSnapshot({enabled:true,date:'2026-02-30',todayCount:1,dailyGoal:19}),null);
});
