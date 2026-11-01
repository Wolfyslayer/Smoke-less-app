import React from 'react';
import {ProfileScreen} from '../screens/ProfileScreen';
import {AccountScreen} from '../screens/AccountScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {BackupScreen} from '../screens/BackupScreen';
import type {useSmokeLessSessionModel} from '../hooks/useSmokeLessSessionModel';
type SessionModel=ReturnType<typeof useSmokeLessSessionModel>;
export function AccountSettingsRoutes({model}:{model:SessionModel}){
 const {tab,p,accountUser,syncStatus,go,emailVerified,verificationBusy,accountBusy,cloudPreviewResult,cloudPreviewBusy,migrationBusy,accountMode,accountEmail,accountPassword,verificationAction,requestGuestMigration,previewCloud,requestCloudImport,setAccountEmail,setAccountPassword,accountAction,setAccountMode,sendSignedInPasswordReset,inspectCloudData,backup,setBackup,onChangeMode,changeProfile,goal,requestGuestReset,onExportBackup,onRestoreBackup}=model;
 if(!p)return null;
 return <>
  {tab==='profile'?<ProfileScreen profile={p} accountEmail={accountUser?accountUser.email||'':null} syncStatus={syncStatus} onNavigate={go}/>:null}
 {tab==='account'?<AccountScreen accountUser={accountUser} emailVerified={emailVerified} verificationBusy={verificationBusy} accountBusy={accountBusy} syncStatus={syncStatus} cloudPreviewResult={cloudPreviewResult} cloudPreviewBusy={cloudPreviewBusy} migrationBusy={migrationBusy} accountMode={accountMode} accountEmail={accountEmail} accountPassword={accountPassword} onBack={()=>go('profile')} onVerification={verificationAction} onGuestMigration={requestGuestMigration} onCloudPreview={previewCloud} onCloudImport={requestCloudImport} onEmailChange={setAccountEmail} onPasswordChange={setAccountPassword} onAccountAction={accountAction} onToggleAccountMode={()=>setAccountMode(v=>v==='login'?'signup':'login')} onPasswordReset={sendSignedInPasswordReset} onInspectCloud={inspectCloudData} onOpenSettings={()=>go('backup')}/>:null}
{tab==='settings'?<SettingsScreen profile={p} goal={goal} accountEmail={accountUser?accountUser.email||'':null} syncStatus={syncStatus} backup={backup} onBackupChange={setBackup} onChangeMode={onChangeMode} onChangeDailyTarget={dailyTargetOverride=>changeProfile({dailyTargetOverride})} onOpenProfile={()=>go('profile')} onGuestReset={requestGuestReset} onExportBackup={onExportBackup} onRestoreBackup={onRestoreBackup}/>:null}
 </>;
}
