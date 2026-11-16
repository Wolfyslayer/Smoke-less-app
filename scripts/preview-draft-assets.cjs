'use strict';
const crypto=require('node:crypto');
function assetDigest(data){return `sha256:${crypto.createHash('sha256').update(data).digest('hex')}`;}
// A retry may add missing assets, but may never replace or trust foreign bytes.
function missingDraftAssets(release,assets,expected,sha,tag){
 if(!Number.isSafeInteger(release?.id)||release.id<1||release.draft!==true||release.prerelease!==true||release.tag_name!==tag||release.target_commitish!==sha)throw Error('Draft identity does not match the approved source');
 if(!Array.isArray(assets)||assets.length>expected.length)throw Error('Unexpected draft assets');
 const seen=new Set();
 for(const asset of assets){
  const match=expected.find(([name])=>name===asset.name);
  if(!match||seen.has(asset.name)||asset.state!=='uploaded'||asset.size!==match[1].length||asset.digest!==assetDigest(match[1]))throw Error('Existing draft asset differs; preserve and inspect manually');
  seen.add(asset.name);
 }
 return expected.filter(([name])=>!seen.has(name));
}
module.exports={assetDigest,missingDraftAssets};
