import React from 'react';
import {ProfileScreen} from '../screens/ProfileScreen';
import {AccountScreen} from '../screens/AccountScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {BackupScreen} from '../screens/BackupScreen';
import {JourneyScreen} from '../screens/JourneyScreen';
import {AboutScreen} from '../screens/AboutScreen';
import {SettingsPlanSection} from '../screens/SettingsPlanSection';
import {AccountCloudActions} from './AccountCloudActions';
import type {Tab} from '../hooks/useSessionNavigation';
import type {useSmokeLessSessionModel} from '../hooks/useSmokeLessSessionModel';
type SessionModel=ReturnType<typeof useSmokeLessSessionModel>;
export function AccountSettingsRoutes({model}:{model:SessionModel}){
 const {data,tab,p,accountUser,syncStatus,go,emailVerified,verificationBusy,accountBusy,cloudPreviewResult,cloudPreviewBusy,migrationBusy,accountMode,accountEmail,accountPassword,verificationAction,requestGuestMigration,previewCloud,requestCloudImport,setAccountEmail,setAccountPassword,accountAction,googleAccountAction,linkGoogleAction,setAccountMode,sendSignedInPasswordReset,inspectCloudData,onChangeMode,changeDailyTarget,goal,todayCount,requestGuestReset}=model;
 if(!p)return null;
 const navigate=(next:Tab)=>{if(next==='sos')model.startSos();go(next);};
 const back=()=>{if(!model.goBack())go('profile');};
 return <>
  {tab==='profile'?<ProfileScreen accountEmail={accountUser?accountUser.email||'':null} onNavigate={navigate}/>:null}
  {tab==='journey'?<JourneyScreen profile={p} todayCount={todayCount} dailyGoal={goal} onNavigate={navigate}/>:null}
  {tab==='about'?<AboutScreen onNavigate={navigate}/>:null}
  {tab==='plan-settings'?<SettingsPlanSection profile={p} goal={goal} onChangeMode={onChangeMode} onChangeDailyTarget={changeDailyTarget}/>:null}
 {tab==='account'?<AccountScreen deletionEnabled={model.deletion.enabled} onDeleteAccount={model.deletion.request} accountUser={accountUser} emailVerified={emailVerified} verificationBusy={verificationBusy} accountBusy={accountBusy} cloudPreviewBusy={cloudPreviewBusy} migrationBusy={migrationBusy} accountMode={accountMode} accountEmail={accountEmail} accountPassword={accountPassword} onBack={()=>{if(!accountUser&&(accountEmail.trim()||accountPassword)){model.ask('Lämna inloggningen?','E-post och lösenord som du har skrivit in kommer inte att användas.',()=>{setAccountEmail('');setAccountPassword('');back();},'Lämna inloggningen');}else back();}} onVerification={verificationAction} onEmailChange={setAccountEmail} onPasswordChange={setAccountPassword} onAccountAction={accountAction} googleConfigured={!!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim()} onGoogleSignIn={()=>googleAccountAction(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID??'','profile')} onLinkGoogle={linkGoogleAction} onToggleAccountMode={()=>setAccountMode(v=>v==='login'?'signup':'login')} onPasswordReset={sendSignedInPasswordReset} onOpenData={()=>go('backup')}/>:null}
{tab==='backup'?<BackupScreen accountEmail={accountUser?accountUser.email||'':null} syncStatus={syncStatus} onGuestReset={requestGuestReset} onOpenAccount={()=>go('account')} onBack={back} onRetrySync={model.retrySync} cloudActions={<AccountCloudActions busy={accountBusy} migrationBusy={migrationBusy} cloudBusy={cloudPreviewBusy} result={cloudPreviewResult} onMigrate={requestGuestMigration} onPreview={previewCloud} onImport={requestCloudImport} onInspect={inspectCloudData}/>}/>:null}
 {tab==='settings'?<SettingsScreen data={data}/>:null}
 </>;
}
