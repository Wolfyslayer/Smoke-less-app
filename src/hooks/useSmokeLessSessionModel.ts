import {useEffect,useRef,useState} from 'react';
import {useLiveClock} from './useLiveClock';
import {useCloudSync} from './useCloudSync';
import {useLocalSession} from './useLocalSession';
import {useConfirmationDialog} from './useConfirmationDialog';
import {getDashboardMetrics} from '../utils/dashboardMetrics';
import {useOnboardingFlow} from './useOnboardingFlow';
import {useCigaretteRegistration} from './useCigaretteRegistration';
import {useAccountFlow} from './useAccountFlow';
import {useSosFlow} from './useSosFlow';
import {useSettingsFlow} from './useSettingsFlow';
import {useSessionNavigation} from './useSessionNavigation';
import {useSessionActions} from './useSessionActions';
import {type Data,EMPTY} from '../domain';
import type {AccountUser} from '../authService';

export function useSmokeLessSessionModel(sessionUser:AccountUser|null,verifyCurrentUid:()=>string|null){
 const [data,setData]=useState<Data>(EMPTY),[ready,setReady]=useState(false),[loadError,setLoadError]=useState<string|null>(null);
 const {tab,setTab,goBack}=useSessionNavigation();
 const clock=useLiveClock();
 const {dialog,setDialog,showMessage,ask}=useConfirmationDialog();
 const {sosProps,startSos,stopSos}=useSosFlow(setData,()=>setTab('home'));
 const {backup,setBackup,onChangeMode,onExportBackup,onRestoreBackup}=useSettingsFlow({data,setData,ask,showMessage});
 const {onStep,setOnStep,mode,setMode,speed,setSpeed,scheduled,setScheduled,quitDay,setQuitDay,baseline,setBaseline,packSize,setPackSize,packPrice,setPackPrice,begin}=useOnboardingFlow(setData,showMessage);
 const hadProfileRef=useRef(false);
 useEffect(()=>{
  if(!ready)return;
  if(!data.profile && hadProfileRef.current && !sessionUser)setOnStep(0);
  hadProfileRef.current=!!data.profile;
 },[ready,data.profile,sessionUser,setOnStep]);
 const {registerOpen,setRegisterOpen,feeling,setFeeling,cigTrigger,setCigTrigger,register,openRegister,skipRegister}=useCigaretteRegistration(setData);
 const {storageRef,loadedDataRef,sessionReady}=useLocalSession({sessionUser,data,setData,ready,setReady,setLoadError,showMessage});
 const {accountUser,emailVerified,verificationBusy,accountBusy,accountMode,setAccountMode,accountEmail,setAccountEmail,accountPassword,setAccountPassword,migrationBusy,cloudPreviewBusy,cloudPreviewResult,previewCloud,requestCloudImport,verificationAction,sendSignedInPasswordReset,accountAction,googleAccountAction,linkGoogleAction,inspectCloudData,requestGuestReset,requestGuestMigration}=useAccountFlow({sessionUser,verifyCurrentUid,data,setData,storageRef,loadedDataRef,setTab,showMessage,ask});
 const dataRef=useRef(data);dataRef.current=data;
 const {syncStatus,retrySync}=useCloudSync({data,setData,dataRef,ready:sessionReady,sessionUser,migrationBusy,cloudPreviewBusy,verifyCurrentUid});

  const {p,today,todayCount,goal,sorted,last,duration,planWeek,confirmedDays,withinDays,todayReduction,recentCravings,cravingTriggers,cigaretteTriggers,weekly}=getDashboardMetrics(data,clock);
 
 const {remove,go:goToTab,changeProfile,changeDailyTarget,period,setPeriod}=useSessionActions({setData,ask,setTab});
 const go=(next:typeof tab)=>{if(tab==='sos'&&next!=='sos')stopSos();goToTab(next);};
 const navigateBack=()=>{if(tab==='sos')stopSos();return goBack();};

 return {data,setData,ready:sessionReady,loadError,tab,goBack:navigateBack,clock,dialog,setDialog,ask,sosProps,startSos,backup,setBackup,onChangeMode,onExportBackup,onRestoreBackup,onStep,setOnStep,mode,setMode,speed,setSpeed,scheduled,setScheduled,quitDay,setQuitDay,baseline,setBaseline,packSize,setPackSize,packPrice,setPackPrice,begin,registerOpen,setRegisterOpen,feeling,setFeeling,cigTrigger,setCigTrigger,register,openRegister,skipRegister,accountUser,emailVerified,verificationBusy,accountBusy,accountMode,setAccountMode,accountEmail,setAccountEmail,accountPassword,setAccountPassword,migrationBusy,cloudPreviewBusy,cloudPreviewResult,previewCloud,requestCloudImport,verificationAction,sendSignedInPasswordReset,accountAction,googleAccountAction,linkGoogleAction,inspectCloudData,requestGuestReset,requestGuestMigration,syncStatus,retrySync,p,today,todayCount,goal,sorted,last,duration,planWeek,confirmedDays,withinDays,todayReduction,recentCravings,cravingTriggers,cigaretteTriggers,weekly,remove,go,changeProfile,changeDailyTarget,period,setPeriod};
}
