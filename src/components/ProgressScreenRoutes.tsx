import {MaintenanceSupport} from './MaintenanceSupport';
import {PersonalActionPlan} from './PersonalActionPlan';
import {sosIdeas} from '../data/sosIdeas';
import {countOn} from '../domain';
import {PersonalJourney} from './PersonalJourney';
import React from 'react';
import {BenefitsScreen} from '../screens/BenefitsScreen';
import {HistoryScreen} from '../screens/HistoryScreen';
import {RegisterScreen} from '../screens/RegisterScreen';
import {PlanScreen} from '../screens/PlanScreen';
import {StatsScreen} from '../screens/StatsScreen';
import {HomeScreen} from '../screens/HomeScreen';
import {SOSScreen} from '../screens/SOSScreen';
import {confirmDailyCheckin} from '../utils/checkinActions';
import type {useSmokeLessSessionModel} from '../hooks/useSmokeLessSessionModel';
type SessionModel=ReturnType<typeof useSmokeLessSessionModel>;
export function ProgressScreenRoutes({model}:{model:SessionModel}){
 const {data,setData,tab,clock,sosProps,startSos,openRegister,p,today,todayCount,goal,sorted,last,duration,planWeek,confirmedDays,withinDays,todayReduction,recentCravings,cravingTriggers,cigaretteTriggers,weekly,remove,go,changeProfile,period,setPeriod}=model;
 if(!p)return null;
 const checkin=()=>setData(v=>confirmDailyCheckin(v,today,countOn(v.entries.filter(e=>Date.parse(e.at)<=Date.now()),today)));
 const journeyPanel=<PersonalJourney journey={model.journey} todayCount={todayCount} checked={data.checkins.some(c=>c.date===today&&c.complete)} compact={tab==='sos'} onPlan={()=>go('plan')} onSOS={()=>{startSos();go('sos');}} onCheckin={checkin}/>;
 return <>
 {tab==='home'?<HomeScreen key={model.accountUser?.uid??'guest'} maintenancePanel={model.journey.value.phase==='maintenance'?<MaintenanceSupport data={data} clock={clock} onSOS={()=>{startSos();go('sos');}} onCheckin={checkin} onSettings={()=>go('settings')}/>:undefined} journeyPanel={journeyPanel} uid={model.accountUser?.uid??null} clock={clock} data={data} goal={goal} todayCount={todayCount} duration={duration} weekly={weekly} today={today} onRegister={openRegister} onSOS={()=>{startSos();go('sos')}} onPlan={()=>go('plan')} onHistory={()=>go('history')} onStats={()=>go('stats')} onConfirmToday={checkin}/>:null}
 {tab==='register'?<RegisterScreen todayCount={todayCount} goal={goal} duration={duration} sorted={sorted} today={today} last={last} onOpenRegister={openRegister} onOpenHistory={()=>go('history')} onRemove={remove}/>:null}
 {tab==='plan'?<PlanScreen profile={p} goal={goal} todayReduction={todayReduction} confirmedDays={confirmedDays} withinDays={withinDays} planWeek={planWeek} clock={clock} onChangeProfile={changeProfile}/>:null}
 {tab==='stats'?<StatsScreen data={data} period={period} onPeriodChange={setPeriod} clock={clock} weekly={weekly} todayCount={todayCount} recentCravingsCount={recentCravings.length} cravingTriggers={cravingTriggers} cigaretteTriggers={cigaretteTriggers}/>:null}
 {tab==='history'?<HistoryScreen entries={data.entries} sorted={sorted} onRemove={remove}/>:null}
 {tab==='sos'?<SOSScreen {...sosProps} journeyPanel={<>{journeyPanel}<PersonalActionPlan store={model.actionPlans} onTrigger={sosProps.onTrigger} trigger={sosProps.trigger} strategy={sosProps.sosIdeas[sosProps.sosTip].title} onUseStep={id=>{const index=sosIdeas.findIndex(step=>step.id===id);if(index>=0)sosProps.onSelectTip(index);}}/></>}/>:null}
 {tab==='benefits'?<BenefitsScreen data={data}/>:null}
 </>;
}
