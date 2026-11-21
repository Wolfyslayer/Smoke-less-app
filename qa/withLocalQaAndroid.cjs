const {withAndroidManifest}=require('expo/config-plugins');
module.exports=config=>{
 if(config.android?.package!=='com.smokeless.app.deletionqa'||config.extra?.localAccountDeletionQa!==true)throw Error('Not the isolated deletion QA app');
 return withAndroidManifest(config,c=>{c.modResults.manifest.application[0].$['android:usesCleartextTraffic']='true';return c;});
};
