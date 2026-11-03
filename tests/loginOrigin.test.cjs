const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const source=ts.transpileModule(fs.readFileSync('src/loginOrigin.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function session(){const exports={};vm.runInNewContext(source,{exports});return exports;}
test('onboarding login does not qualify for automatic guest migration',()=>{const x=session();x.setLoginOrigin('onboarding');assert.equal(x.consumeLoginOrigin(),'onboarding');assert.equal(x.consumeLoginOrigin(),null);});
test('profile login qualifies exactly once',()=>{const x=session();x.setLoginOrigin('profile');assert.equal(x.consumeLoginOrigin(),'profile');assert.equal(x.consumeLoginOrigin(),null);});
test('failed login can clear pending origin',()=>{const x=session();x.setLoginOrigin('profile');x.setLoginOrigin(null);assert.equal(x.consumeLoginOrigin(),null);});
