const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const context={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/domain/productLinks.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);
test('product help opens fixed public pages without account/history parameters',async()=>{
 const calls=[];for(const page of ['support','privacy'])assert.equal(await context.exports.openProductPage(page,async url=>calls.push(url)),true);
 assert.deepEqual(calls,['https://wolfyslayer.online/support','https://wolfyslayer.online/privacy']);
 for(const page of ['__proto__','constructor','https://evil.test',null])assert.equal(await context.exports.openProductPage(page,async()=>assert.fail('Unknown destinations must not open')),false);
});
test('external browser failure is recoverable without returning private provider errors',async()=>{assert.equal(await context.exports.openProductPage('support',async()=>{throw Error('private provider details')}),false);});
