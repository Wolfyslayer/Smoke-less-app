import React,{useEffect,useMemo,useRef,useState} from 'react';
import {ActivityIndicator,Platform,Pressable,ScrollView,StyleSheet,Text,View,AccessibilityInfo} from 'react-native';
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
import {AppCard,AppButton} from './components/ui';
import {useSosTimer} from './hooks/useSosTimer';
import {useBreathing} from './hooks/useBreathing';
import {useLiveClock} from './hooks/useLiveClock';
import {useAuthObserver} from './hooks/useAuthObserver';
import {useCloudSync} from './hooks/useCloudSync';
import {useLocalSession} from './hooks/useLocalSession';
import {useConfirmationDialog} from './hooks/useConfirmationDialog';
import {sosIdeas} from './data/sosIdeas';
import {getDashboardMetrics} from './utils/dashboardMetrics';
import {useOnboardingFlow} from './hooks/useOnboardingFlow';
import {useCigaretteRegistration} from './hooks/useCigaretteRegistration';
import {removeCigaretteEntry,addCigaretteEntry} from './utils/entryActions';
import {updateProfile} from './utils/profileActions';
import {confirmDailyCheckin} from './utils/checkinActions';
import {addCravingEntry} from './utils/cravingActions';
import {parseBackupData} from './utils/backupValidation';
import {useAccountFlow} from './hooks/useAccountFlow';
import {C} from './theme';import {Data,Profile,Mode,Speed,dayKey,target,quitDate,countOn,savings,EMPTY,validateData} from './domain';import {backupBeforeCloudImport} from './storage';
import {LocalSessionStorage, type LocalSession} from './localSessionStorage';
import * as account from './authService';
import {previewCloudImport,inspectCloudDeletion} from './cloudRead';
type Tab='home'|'plan'|'register'|'stats'|'profile'|'account'|'sos'|'history'|'benefits'|'settings';
const nowId=()=>Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
export default function SmokeLess(){
 const {authState,activeUidRef}=useAuthObserver();
 if(!authState.initialized)return <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:C.background}}><ActivityIndicator color={C.lime}/></View>;
 return <SmokeLessSession key={authState.user?.uid??'guest'} sessionUser={authState.user} verifyCurrentUid={()=>activeUidRef.current}/>;
}
function SmokeLessSession({sessionUser,verifyCurrentUid}:{sessionUser:account.AccountUser|null;verifyCurrentUid:()=>string|null}){
 const insets=useSafeAreaInsets();const [data,setData]=useState<Data>(EMPTY),[ready,setReady]=useState(false),[loadError,setLoadError]=useState<string|null>(null),[tab,setTab]=useState<Tab>('home'),[period,setPeriod]=useState(7),[intensity,setIntensity]=useState(3),[trigger,setTrigger]=useState('Stress'),[backup,setBackup]=useState('');
 const clock=useLiveClock();
 const {breathing,setBreathing,breathSeconds,setBreathSeconds,hapticsEnabled,setHapticsEnabled,breathScale}=useBreathing();const [sosTip,setSosTip]=useState(0),[sosStartIntensity,setSosStartIntensity]=useState<number|null>(null);const {sosTimer,setSosTimer,sosTimerActive,setSosTimerActive}=useSosTimer();const {dialog,setDialog,showMessage,ask}=useConfirmationDialog();
 const {onStep,setOnStep,mode,setMode,baseline,setBaseline,packSize,setPackSize,packPrice,setPackPrice,begin}=useOnboardingFlow(setData,showMessage);
 const {registerOpen,setRegisterOpen,feeling,setFeeling,cigTrigger,setCigTrigger,register,openRegister}=useCigaretteRegistration(setData);
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
 {tab==='home'?<HomeScreen data={data} goal={goal} todayCount={todayCount} duration={duration} weekly={weekly} today={today} onRegister={openRegister} onSOS={()=>{setBreathSeconds(0);setBreathing(true);go('sos')}} onPlan={()=>go('plan')} onHistory={()=>go('history')} onStats={()=>go('stats')} onConfirmToday={()=>setData(v=>confirmDailyCheckin(v,today,todayCount))}/>:null}
 {tab==='register'?<RegisterScreen todayCount={todayCount} goal={goal} duration={duration} sorted={sorted} today={today} last={last} onOpenRegister={openRegister} onOpenHistory={()=>go('history')} onRemove={remove}/>:null}
 {tab==='plan'?<PlanScreen profile={p} goal={goal} todayReduction={todayReduction} confirmedDays={confirmedDays} withinDays={withinDays} planWeek={planWeek} clock={clock} onChangeProfile={changeProfile}/>:null}
 {tab==='stats'?<StatsScreen data={data} period={period} onPeriodChange={setPeriod} clock={clock} weekly={weekly} todayCount={todayCount} recentCravingsCount={recentCravings.length} cravingTriggers={cravingTriggers} cigaretteTriggers={cigaretteTriggers}/>:null}
 {tab==='history'?<HistoryScreen entries={data.entries} sorted={sorted} onRemove={remove}/>:null}
 {tab==='sos'?<SOSScreen breathScale={breathScale} breathing={breathing} breathSeconds={breathSeconds} onToggleBreathing={()=>{setBreathing(v=>!v);setBreathSeconds(0)}} hapticsEnabled={hapticsEnabled} onToggleHaptics={()=>setHapticsEnabled(v=>!v)} sosIdeas={sosIdeas} sosTip={sosTip} onNextTip={()=>setSosTip(v=>(v+1)%sosIdeas.length)} sosTimer={sosTimer} sosTimerActive={sosTimerActive} onToggleTimer={()=>{if(sosTimerActive){setSosTimerActive(false)}else{if(sosTimer===0)setSosTimer(120);setSosTimerActive(true)}}} onResetTimer={()=>{setSosTimerActive(false);setSosTimer(0)}} sosStartIntensity={sosStartIntensity} intensity={intensity} onStartIntensity={setSosStartIntensity} onIntensity={setIntensity} trigger={trigger} onTrigger={setTrigger} onSave={()=>{setData(v=>addCravingEntry(v,intensity,trigger));go('home')}}/>:null}
 {tab==='benefits'?<BenefitsScreen data={data}/>:null}
 {tab==='profile'?<ProfileScreen profile={p} accountEmail={accountUser?accountUser.email||'':null} syncStatus={syncStatus} onNavigate={go}/>:null}
 {tab==='account'?<AccountScreen accountUser={accountUser} emailVerified={emailVerified} verificationBusy={verificationBusy} accountBusy={accountBusy} syncStatus={syncStatus} cloudPreviewResult={cloudPreviewResult} cloudPreviewBusy={cloudPreviewBusy} migrationBusy={migrationBusy} accountMode={accountMode} accountEmail={accountEmail} accountPassword={accountPassword} onBack={()=>go('profile')} onVerification={verificationAction} onGuestMigration={requestGuestMigration} onCloudPreview={previewCloud} onCloudImport={requestCloudImport} onEmailChange={setAccountEmail} onPasswordChange={setAccountPassword} onAccountAction={accountAction} onToggleAccountMode={()=>setAccountMode(v=>v==='login'?'signup':'login')} onPasswordReset={sendSignedInPasswordReset} onInspectCloud={inspectCloudData} onOpenSettings={()=>go('settings')}/>:null}
{tab==='settings'?<SettingsScreen profile={p} goal={goal} accountEmail={accountUser?accountUser.email||'':null} syncStatus={syncStatus} backup={backup} onBackupChange={setBackup} onChangeMode={mode=>ask(mode==='reduce'?'Byta till minskning?':'Byta till rökstopp?','Din plan får ett nytt startdatum. Din tidigare historik behålls.',()=>changeProfile({mode,startAt:new Date().toISOString()}))} onChangeDailyTarget={dailyTargetOverride=>changeProfile({dailyTargetOverride})} onOpenProfile={()=>go('profile')} onGuestReset={requestGuestReset} onExportBackup={()=>{const value=JSON.stringify(data,null,2);setBackup(value);if(Platform.OS==='web'&&typeof navigator!=='undefined'&&navigator.clipboard)navigator.clipboard.writeText(value).catch(()=>{});showMessage('Säkerhetskopia skapad','Din historik finns i textfältet nedan. Kopiera och spara texten på en säker plats.')}} onRestoreBackup={()=>{try{const v=parseBackupData(backup);ask('Återställ historik?','Den nuvarande lokala historiken ersätts med innehållet i säkerhetskopian.',()=>setData(v));}catch{showMessage('Ogiltig säkerhetskopia','Kontrollera JSON-innehållet.')}}}/>:null}
 </ScrollView><BottomNavigation tab={tab} onNavigate={go}/><CigaretteRegisterModal visible={registerOpen} feeling={feeling} onFeelingChange={setFeeling} cigTrigger={cigTrigger} onTriggerChange={setCigTrigger} onClose={()=>setRegisterOpen(false)} onRegister={register} onSkip={()=>{setFeeling(null);setCigTrigger(null);setData(v=>({...v,entries:[...v.entries,{id:nowId(),at:new Date().toISOString()}]}));setRegisterOpen(false)}}/><ConfirmationDialog dialog={dialog} onClose={()=>setDialog(null)}/></View>
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:C.background}});

