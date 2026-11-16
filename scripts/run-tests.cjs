// Discover unit suites automatically so an added test cannot silently miss CI.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const separate=new Set(['firestore.rules.test.cjs','localSessionStorage.test.cjs','accountMigration.test.cjs']);
const files=['tests','functions'].flatMap(dir=>fs.readdirSync(dir).filter(file=>file.endsWith('.test.cjs')&&!separate.has(file)).sort().map(file=>path.join(dir,file)));
const result=spawnSync(process.execPath,['--test',...files],{stdio:'inherit'});
if(result.error)throw result.error;
process.exit(result.status??1);
