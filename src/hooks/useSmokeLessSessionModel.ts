import {useRef,useState} from 'react';
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
 const {tab,setTab}=useSessionNavigation();
 const clock=useLiveClock();
 const {dialog,setDialog,showMessage,ask}=useConfirmationDialog();
 const {sosProps,startSos}=useSosFlow(setData,()=>setTab('home'));
 const {backup,setBackup,onChangeMode,onExportBackup,onRestoreBackup}=useSettingsFlow({data,setData,ask,showMessage});
 const {onStep,setOnStep,mode,setMode,baseline,setBaseline,packSize,setPackSize,packPrice,setPackPrice,begin}=useOnboardingFlow(setData,showMessage);
 const {registerOpen,setRegisterOpen,feeling,setFeeling,cigTrigger,setCigTrigger,register,openRegister,skipRegister}=useCigaretteRegistration(setData);
 const {storageRef,loadedDataRef}=useLocalSession({sessionUser,data,setData,ready,setReady,setLoadError,showMessage});
 const {accountUser,emailVerified,verificationBusy,accountBusy,accountMode,setAccountMode,accountEmail,setAccountEmail,accountPassword,setAccountPassword,migrationBusy,cloudPreviewBusy,cloudPreviewResult,previewCloud,requestCloudImport,verificationAction,sendSignedInPasswordReset,accountAction,inspectCloudData,requestGuestReset,requestGuestMigration}=useAccountFlow({sessionUser,verifyCurrentUid,data,setData,storageRef,loadedDataRef,setTab,showMessage,ask});
 const dataRef=useRef(data);dataRef.current=data;
 const {syncStatus}=useCloudSync({data,setData,dataRef,ready,sessionUser,migrationBusy,cloudPreviewBusy,verifyCurrentUid});

  const {p,today,todayCount,goal,sorted,last,duration,planWeek,confirmedDays,withinDays,todayReduction,recentCravings,cravingTriggers,cigaretteTriggers,weekly}=getDashboardMetrics(data,clock);
 
 const {remove,go,changeProfile,period,setPeriod}=useSessionActions({setData,ask,setTab});

 return {data,setData,ready,loadError,tab,clock,dialog,setDialog,sosProps,startSos,backup,setBackup,onChangeMode,onExportBackup,onRestoreBackup,onStep,setOnStep,mode,setMode,baseline,setBaseline,packSize,setPackSize,packPrice,setPackPrice,begin,registerOpen,setRegisterOpen,feeling,setFeeling,cigTrigger,setCigTrigger,register,openRegister,skipRegister,accountUser,emailVerified,verificationBusy,accountBusy,accountMode,setAccountMode,accountEmail,setAccountEmail,accountPassword,setAccountPassword,migrationBusy,cloudPreviewBusy,cloudPreviewResult,previewCloud,requestCloudImport,verificationAction,sendSignedInPasswordReset,accountAction,inspectCloudData,requestGuestReset,requestGuestMigration,syncStatus,p,today,todayCount,goal,sorted,last,duration,planWeek,confirmedDays,withinDays,todayReduction,recentCravings,cravingTriggers,cigaretteTriggers,weekly,remove,go,changeProfile,period,setPeriod};
}
