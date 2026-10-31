import React from 'react';
import {BenefitsScreen} from '../screens/BenefitsScreen';
import {HistoryScreen} from '../screens/HistoryScreen';
import {RegisterScreen} from '../screens/RegisterScreen';
import {PlanScreen} from '../screens/PlanScreen';
import {StatsScreen} from '../screens/StatsScreen';
import {HomeScreen} from '../screens/HomeScreen';
import {SOSScreen} from '../screens/SOSScreen';
import {confirmDailyCheckin} from '../utils/checkinActions';
import {AccountSettingsRoutes} from './AccountSettingsRoutes';
import type {useSmokeLessSessionModel} from '../hooks/useSmokeLessSessionModel';

type SessionModel=ReturnType<typeof useSmokeLessSessionModel>;
export function AppScreenRouter({model}:{model:SessionModel}){
 const {data,setData,tab,clock,sosProps,startSos,register,openRegister,p,today,todayCount,goal,sorted,last,duration,planWeek,confirmedDays,withinDays,todayReduction,recentCravings,cravingTriggers,cigaretteTriggers,weekly,remove,go,changeProfile,period,setPeriod}=model;
 if(!p)return null;
 return <>
 {tab==='home'?<HomeScreen data={data} goal={goal} todayCount={todayCount} duration={duration} weekly={weekly} today={today} onRegister={openRegister} onSOS={()=>{startSos();go('sos')}} onPlan={()=>go('plan')} onHistory={()=>go('history')} onStats={()=>go('stats')} onConfirmToday={()=>setData(v=>confirmDailyCheckin(v,today,todayCount))}/>:null}
 {tab==='register'?<RegisterScreen todayCount={todayCount} goal={goal} duration={duration} sorted={sorted} today={today} last={last} onOpenRegister={openRegister} onOpenHistory={()=>go('history')} onRemove={remove}/>:null}
 {tab==='plan'?<PlanScreen profile={p} goal={goal} todayReduction={todayReduction} confirmedDays={confirmedDays} withinDays={withinDays} planWeek={planWeek} clock={clock} onChangeProfile={changeProfile}/>:null}
 {tab==='stats'?<StatsScreen data={data} period={period} onPeriodChange={setPeriod} clock={clock} weekly={weekly} todayCount={todayCount} recentCravingsCount={recentCravings.length} cravingTriggers={cravingTriggers} cigaretteTriggers={cigaretteTriggers}/>:null}
 {tab==='history'?<HistoryScreen entries={data.entries} sorted={sorted} onRemove={remove}/>:null}
 {tab==='sos'?<SOSScreen {...sosProps}/>:null}
 {tab==='benefits'?<BenefitsScreen data={data}/>:null}
 <AccountSettingsRoutes model={model}/>
 </>;
}
