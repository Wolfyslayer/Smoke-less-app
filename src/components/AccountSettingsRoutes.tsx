import React from 'react';
import {ProfileScreen} from '../screens/ProfileScreen';
import {AccountScreen} from '../screens/AccountScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {BackupScreen} from '../screens/BackupScreen';
import type {useSmokeLessSessionModel} from '../hooks/useSmokeLessSessionModel';
type SessionModel=ReturnType<typeof useSmokeLessSessionModel>;
export function AccountSettingsRoutes({model}:{model:SessionModel}){
 const {data,tab,p,accountUser,syncStatus,go,emailVerified,verificationBusy,accountBusy,cloudPreviewResult,cloudPreviewBusy,migrationBusy,accountMode,accountEmail,accountPassword,verificationAction,requestGuestMigration,previewCloud,requestCloudImport,setAccountEmail,setAccountPassword,accountAction,googleAccountAction,setAccountMode,sendSignedInPasswordReset,inspectCloudData,onChangeMode,changeDailyTarget,goal,todayCount,requestGuestReset}=model;
 if(!p)return null;
 return <>
  {tab==='profile'?<ProfileScreen profile={p} todayCount={todayCount} dailyGoal={goal} accountEmail={accountUser?accountUser.email||'':null} onNavigate={go}/>:null}
 {tab==='account'?<AccountScreen accountUser={accountUser} emailVerified={emailVerified} verificationBusy={verificationBusy} accountBusy={accountBusy} syncStatus={syncStatus} cloudPreviewResult={cloudPreviewResult} cloudPreviewBusy={cloudPreviewBusy} migrationBusy={migrationBusy} accountMode={accountMode} accountEmail={accountEmail} accountPassword={accountPassword} onBack={()=>go('profile')} onVerification={verificationAction} onGuestMigration={requestGuestMigration} onCloudPreview={previewCloud} onCloudImport={requestCloudImport} onEmailChange={setAccountEmail} onPasswordChange={setAccountPassword} onAccountAction={accountAction} googleConfigured={!!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim()} onGoogleSignIn={()=>googleAccountAction(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID??'','profile')} onToggleAccountMode={()=>setAccountMode(v=>v==='login'?'signup':'login')} onPasswordReset={sendSignedInPasswordReset} onInspectCloud={inspectCloudData} onOpenSettings={()=>go('backup')}/>:null}
{tab==='backup'?<BackupScreen accountEmail={accountUser?accountUser.email||'':null} syncStatus={syncStatus} onGuestReset={requestGuestReset} onOpenAccount={()=>go('account')} onBack={()=>go('profile')}/>:null}
 {tab==='settings'?<SettingsScreen profile={p} goal={goal} data={data} onChangeMode={onChangeMode} onChangeDailyTarget={changeDailyTarget}/>:null}
 </>;
}
