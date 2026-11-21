'use strict';
const project='demo-smokeless-qa',packageName='com.smokeless.app.deletionqa';
function localDeletionQa({enabled,development,packageId,firebaseProject}){
 if(enabled!==true)return null;
 if(development!==true||packageId!==packageName||firebaseProject!==project)throw Error('Local deletion QA requires a disposable debug app and demo Firebase project');
 return {project,auth:'http://10.0.2.2:9099',firestoreHost:'10.0.2.2',firestorePort:8088,deletionUrl:`http://10.0.2.2:5001/${project}/europe-west1/deleteMyAccount`};
}
module.exports={localDeletionQa};
