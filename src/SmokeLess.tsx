import React,{useRef,useState} from 'react';
import {ActivityIndicator,ScrollView,StyleSheet,Text,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BenefitsScreen} from './screens/BenefitsScreen';
import {HistoryScreen} from './screens/HistoryScreen';
import {RegisterScreen} from './screens/RegisterScreen';
import {PlanScreen} from './screens/PlanScreen';
import {StatsScreen} from './screens/StatsScreen';
import {HomeScreen} from './screens/HomeScreen';
import {SOSScreen} from './screens/SOSScreen';
import {ProfileScreen} from './screens/ProfileScreen';
import {SettingsScreen} from './screens/SettingsScreen';
import {AccountScreen} from './screens/AccountScreen';
import {OnboardingScreen} from './screens/OnboardingScreen';
import {SectionIntroCard} from './components/SectionIntroCard';
import {BottomNavigation} from './components/BottomNavigation';
import {ScreenHeader} from './components/ScreenHeader';
import {ConfirmationDialog} from './components/ConfirmationDialog';
import {CigaretteRegisterModal} from './components/CigaretteRegisterModal';
import {useLiveClock} from './hooks/useLiveClock';
import {useAuthObserver} from './hooks/useAuthObserver';
import {useCloudSync} from './hooks/useCloudSync';
import {useLocalSession} from './hooks/useLocalSession';
import {useConfirmationDialog} from './hooks/useConfirmationDialog';
import {getDashboardMetrics} from './utils/dashboardMetrics';
import {useOnboardingFlow} from './hooks/useOnboardingFlow';
import {useCigaretteRegistration} from './hooks/useCigaretteRegistration';
import {removeCigaretteEntry} from './utils/entryActions';
import {updateProfile} from './utils/profileActions';
import {confirmDailyCheckin} from './utils/checkinActions';
import {useAccountFlow} from './hooks/useAccountFlow';
import {useSosFlow} from './hooks/useSosFlow';
import {useSettingsFlow} from './hooks/useSettingsFlow';
import {C} from './theme';
import {type Data,type Profile,EMPTY} from './domain';
import * as account from './authService';
type Tab='home'|'plan'|'register'|'stats'|'profile'|'account'|'sos'|'history'|'benefits'|'settings';
export default function SmokeLess(){
 const {authState,activeUidRef}=useAuthObserver();
 if(!authState.initialized)return <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:C.background}}><ActivityIndicator color={C.lime}/></View>;
 return <SmokeLessSession key={authState.user?.uid??'guest'} sessionUser={authState.user} verifyCurrentUid={()=>activeUidRef.current}/>;
}
function SmokeLessSession({sessionUser,verifyCurrentUid}:{sessionUser:account.AccountUser|null;verifyCurrentUid:()=>string|null}){
 const insets=useSafeAreaInsets();const [data,setData]=useState<Data>(EMPTY),[ready,setReady]=useState(false),[loadError,setLoadError]=useState<string|null>(null),[tab,setTab]=useState<Tab>('home'),[period,setPeriod]=useState(7);
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

  const {p,today,todayCount,goal,sorted,last,elapsed,duration,planWeek,confirmedDays,withinDays,todayReduction,recentCravings,cravingTriggers,recentCigarettes,cigaretteTriggers,weekly}=getDashboardMetrics(data,clock);
 
 const remove=(id:string)=>ask('Ta bort registrering?','Registreringen tas bort från historiken.',()=>setData(v=>removeCigaretteEntry(v,id)));
 
 const go=(t:Tab)=>{setTab(t)};
 const changeProfile=(patch:Partial<Profile>)=>setData(v=>updateProfile(v,patch));
 const checkin=data.checkins.find(x=>x.date===today);
 if(loadError)return <View style={[s.root,{justifyContent:'center',alignItems:'center',padding:24,gap:16}]}><Text style={{color:C.white,textAlign:'center'}}>{loadError}</Text><Text style={{color:C.dim,textAlign:'center'}}>Ingen historik har skrivits över. Starta om appen efter att problemet åtgärdats.</Text></View>;
 if(!ready)return <View style={[s.root,{justifyContent:'center',alignItems:'center'}]}><ActivityIndicator color={C.lime}/></View>;
 if(!p)return <OnboardingScreen onStep={onStep} setOnStep={setOnStep} mode={mode} setMode={setMode} baseline={baseline} setBaseline={setBaseline} packSize={packSize} setPackSize={setPackSize} packPrice={packPrice} setPackPrice={setPackPrice} begin={begin}/>;
 return <View style={s.root}><ScrollView key={tab} contentContainerStyle={{paddingHorizontal:20,paddingTop:Math.max(insets.top,18)+12,paddingBottom:32,gap:20}} showsVerticalScrollIndicator={false}>
 <ScreenHeader tab={tab} clock={clock} onNavigate={go}/>
 {(['home','plan','register','stats','history','sos','benefits'] as Tab[]).includes(tab)?<SectionIntroCard tab={tab as 'home'|'plan'|'register'|'stats'|'history'|'sos'|'benefits'}/>:null}
 {tab==='home'?<HomeScreen data={data} goal={goal} todayCount={todayCount} duration={duration} weekly={weekly} today={today} onRegister={openRegister} onSOS={()=>{startSos();go('sos')}} onPlan={()=>go('plan')} onHistory={()=>go('history')} onStats={()=>go('stats')} onConfirmToday={()=>setData(v=>confirmDailyCheckin(v,today,todayCount))}/>:null}
 {tab==='register'?<RegisterScreen todayCount={todayCount} goal={goal} duration={duration} sorted={sorted} today={today} last={last} onOpenRegister={openRegister} onOpenHistory={()=>go('history')} onRemove={remove}/>:null}
 {tab==='plan'?<PlanScreen profile={p} goal={goal} todayReduction={todayReduction} confirmedDays={confirmedDays} withinDays={withinDays} planWeek={planWeek} clock={clock} onChangeProfile={changeProfile}/>:null}
 {tab==='stats'?<StatsScreen data={data} period={period} onPeriodChange={setPeriod} clock={clock} weekly={weekly} todayCount={todayCount} recentCravingsCount={recentCravings.length} cravingTriggers={cravingTriggers} cigaretteTriggers={cigaretteTriggers}/>:null}
 {tab==='history'?<HistoryScreen entries={data.entries} sorted={sorted} onRemove={remove}/>:null}
 {tab==='sos'?<SOSScreen {...sosProps}/>:null}
 {tab==='benefits'?<BenefitsScreen data={data}/>:null}
 {tab==='profile'?<ProfileScreen profile={p} accountEmail={accountUser?accountUser.email||'':null} syncStatus={syncStatus} onNavigate={go}/>:null}
 {tab==='account'?<AccountScreen accountUser={accountUser} emailVerified={emailVerified} verificationBusy={verificationBusy} accountBusy={accountBusy} syncStatus={syncStatus} cloudPreviewResult={cloudPreviewResult} cloudPreviewBusy={cloudPreviewBusy} migrationBusy={migrationBusy} accountMode={accountMode} accountEmail={accountEmail} accountPassword={accountPassword} onBack={()=>go('profile')} onVerification={verificationAction} onGuestMigration={requestGuestMigration} onCloudPreview={previewCloud} onCloudImport={requestCloudImport} onEmailChange={setAccountEmail} onPasswordChange={setAccountPassword} onAccountAction={accountAction} onToggleAccountMode={()=>setAccountMode(v=>v==='login'?'signup':'login')} onPasswordReset={sendSignedInPasswordReset} onInspectCloud={inspectCloudData} onOpenSettings={()=>go('settings')}/>:null}
{tab==='settings'?<SettingsScreen profile={p} goal={goal} accountEmail={accountUser?accountUser.email||'':null} syncStatus={syncStatus} backup={backup} onBackupChange={setBackup} onChangeMode={onChangeMode} onChangeDailyTarget={dailyTargetOverride=>changeProfile({dailyTargetOverride})} onOpenProfile={()=>go('profile')} onGuestReset={requestGuestReset} onExportBackup={onExportBackup} onRestoreBackup={onRestoreBackup}/>:null}
 </ScrollView><BottomNavigation tab={tab} onNavigate={go}/><CigaretteRegisterModal visible={registerOpen} feeling={feeling} onFeelingChange={setFeeling} cigTrigger={cigTrigger} onTriggerChange={setCigTrigger} onClose={()=>setRegisterOpen(false)} onRegister={register} onSkip={skipRegister}/><ConfirmationDialog dialog={dialog} onClose={()=>setDialog(null)}/></View>
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:C.background}});

