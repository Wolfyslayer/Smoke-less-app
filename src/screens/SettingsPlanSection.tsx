import React,{useEffect,useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {Target,CalendarDays,Minus,Plus} from 'lucide-react-native';
import {useThemeColors,useThemeStyles,type ThemeColors} from '../theme';
import type {Profile} from '../domain';
import {AppCard} from '../components/ui';
import {dayKey} from '../domain';
import {previewDailyTarget,type DailyTargetPreview,type PlanDatePolicy} from '../planTargetPreview';

type Props={
 profile:Profile;goal:number;
 onChangeMode:(mode:'reduce'|'quit')=>void;
 onChangeDailyTarget:(preview:DailyTargetPreview)=>void;
};
function Card({children,style}:{children:React.ReactNode;style?:React.ComponentProps<typeof AppCard>['style']}){return <AppCard style={style}>{children}</AppCard>}
function Choice({title,subtitle,selected,onPress}:{title:string;subtitle:string;selected:boolean;onPress:()=>void}){
 const styles=useThemeStyles(createStyles);
return <Pressable accessibilityRole="radio" accessibilityLabel={title} accessibilityHint={subtitle} accessibilityState={{checked:selected}} onPress={onPress} style={[styles.choice,selected&&styles.selected]}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.muted}>{subtitle}</Text></Pressable>}
export function SettingsPlanSection({profile:p,goal,onChangeMode,onChangeDailyTarget}:Props){
 const C=useThemeColors(); const styles=useThemeStyles(createStyles);

 const [draft,setDraft]=useState<{base:Profile;value:number}|null>(null);
 const [policy,setPolicy]=useState<PlanDatePolicy>('keep');
 const [submitted,setSubmitted]=useState<DailyTargetPreview|null>(null);
 useEffect(()=>{
  if(!submitted)return;
  if(JSON.stringify(p)===JSON.stringify(submitted.next)){setDraft(null);setSubmitted(null);}
  else if(JSON.stringify(p)!==JSON.stringify(submitted.expected)||dayKey(new Date())!==submitted.day)setSubmitted(null);
 },[p,submitted]);
 const now=new Date();
 const expired=!!draft?.base.plannedQuitAt&&dayKey(new Date(draft.base.plannedQuitAt))<=dayKey(now);
 const preview=draft?previewDailyTarget(draft.base,draft.value,policy,now):null;
 const stale=!!draft&&JSON.stringify(draft.base)!==JSON.stringify(p);
 const propose=(value:number)=>{setDraft(current=>({base:current?.base??{...p},value}));};
 return <>
  <Card style={{gap:13,padding:19,backgroundColor:C.accentSubtle,borderColor:C.border}}>
   <View style={styles.inline}><View style={styles.heroIcon}><Target size={24} color={C.lime}/></View><View style={{flex:1,minWidth:0,gap:4}}><Text accessibilityRole="header" style={styles.cardTitle}>Din personliga plan</Text><Text style={styles.muted}>Anpassa din resa, ett steg i taget.</Text></View></View>
   <View style={{height:1,backgroundColor:C.border}}/><View style={styles.sectionRow}><Text style={[styles.muted,{flexShrink:1}]}>Nuvarande mål</Text><Text style={{color:C.lime,fontSize:14,fontWeight:'800',flexShrink:1}}>{p.mode==='quit'?'Sluta helt':'Minska gradvis'}</Text></View>
  </Card>
  <View style={{gap:9}}><View style={styles.inline}><Target size={19} color={C.lime}/><Text accessibilityRole="header" style={styles.heading}>Rökmål</Text></View><Text style={styles.muted}>Välj hur du vill arbeta mot ett rökfritt liv.</Text>
   <Choice title="Minska gradvis" subtitle="Minska antalet cigaretter i din egen takt" selected={p.mode==='reduce'} onPress={()=>{if(p.mode!=='reduce')onChangeMode('reduce')}}/>
   <Choice title="Sluta helt" subtitle="Sätt målet till noll cigaretter" selected={p.mode==='quit'} onPress={()=>{if(p.mode!=='quit')onChangeMode('quit')}}/>
  </View>
  <Card style={{gap:15,padding:18}}>
   <View style={styles.inline}><View style={styles.actionIcon}><CalendarDays size={20} color={C.lime}/></View><View style={{flex:1,minWidth:0,gap:3}}><Text accessibilityRole="header" style={styles.cardTitle}>Dagligt riktvärde</Text><Text style={styles.muted}>Ändra dagens antal om dina vanor förändras. Din framtida nedtrappning räknas om, men historiken behålls.</Text></View></View>
   <View style={styles.sectionRow}>
    <Pressable accessibilityRole="button" accessibilityLabel="Minska dagligt mål" accessibilityHint="Förhandsvisar ett lägre riktvärde innan du bekräftar" accessibilityState={{disabled:p.mode==='quit'||(draft?.value??goal)<=0}} disabled={p.mode==='quit'||(draft?.value??goal)<=0} style={[styles.stepper,(p.mode==='quit'||(draft?.value??goal)<=0)&&styles.disabled]} onPress={()=>propose(Math.max(0,(draft?.value??p.dailyTargetOverride??goal)-1))}><Minus size={21} color={C.lime}/></Pressable>
    <View style={{alignItems:'center',gap:2,flexShrink:1,minWidth:90}}><Text accessibilityLabel={`Dagligt riktvärde: ${goal} cigaretter`} adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1} style={styles.goal}>{goal}</Text><Text style={[styles.muted,{textAlign:'center'}]}>cigaretter per dag</Text></View>
    <Pressable accessibilityRole="button" accessibilityLabel="Öka dagligt mål" accessibilityHint="Förhandsvisar ett högre riktvärde innan du bekräftar" accessibilityState={{disabled:p.mode==='quit'}} disabled={p.mode==='quit'} style={[styles.stepper,p.mode==='quit'&&styles.disabled]} onPress={()=>propose((draft?.value??p.dailyTargetOverride??goal)+1)}><Plus size={21} color={C.lime}/></Pressable>
   </View>
   <Text style={styles.muted}>{p.mode==='quit'?'Vid rökstopp är dagsmålet alltid noll.':p.plannedQuitAt?'Ändringar anpassar nedtrappningen, men ditt stoppdatum ligger kvar.':'Ändringar blir ny utgångspunkt och den valda takten fortsätter.'}</Text>
   {draft?<View style={{gap:12}}>
    <Text accessibilityRole="header" style={styles.cardTitle}>Förhandsgranska nytt dagsmål: {draft.value}</Text>
    {draft.base.plannedQuitAt?<><Choice title="Behåll valt stoppdatum" subtitle={expired?'Datumet har passerat. Välj automatisk omräkning eller avbryt.':'Det valda datumet ligger fast och framtida mål anpassas.'} selected={policy==='keep'} onPress={()=>setPolicy('keep')}/><Choice title="Räkna om stoppdatum automatiskt" subtitle="Det fasta datumet tas bort. Din sparade takt används från det nya dagsmålet." selected={policy==='automatic'} onPress={()=>setPolicy('automatic')}/></>:null}
    {stale?<Text accessibilityRole="alert" style={styles.muted}>Planen har ändrats sedan förhandsvisningen. Avbryt och välj ditt mål igen.</Text>:null}
    {preview?<><Text style={styles.muted}>{policy==='keep'&&draft.base.plannedQuitAt?'Behållet':'Beräknat'} stoppdatum: {preview.quitAt}. Din ursprungliga start, registreringar, röksug och avstämningar behålls.</Text>{preview.goals.map(row=><Text key={row.day} style={styles.muted}>{row.day}: högst {row.goal} cigaretter</Text>)}</>:<Text accessibilityRole="alert" style={styles.muted}>Det här valet kan inte sparas. Kontrollera datumvalet eller avbryt.</Text>}
    <Pressable accessibilityRole="button" accessibilityLabel="Bekräfta nytt dagsmål" accessibilityState={{disabled:!preview||stale||!!submitted,busy:!!submitted}} disabled={!preview||stale||!!submitted} style={[styles.choice,(!preview||stale||!!submitted)&&styles.disabled]} onPress={()=>{if(preview&&!stale&&!submitted){setSubmitted(preview);onChangeDailyTarget(preview);}}}><Text style={styles.cardTitle}>{submitted?'Bekräftar…':'Bekräfta nytt dagsmål'}</Text></Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="Avbryt måländring" style={styles.choice} onPress={()=>{setDraft(null);setSubmitted(null);setPolicy('keep');}}><Text style={styles.cardTitle}>Avbryt</Text></Pressable>
   </View>:null}

  </Card>
 </>;
}
const createStyles=(C:ThemeColors)=>StyleSheet.create({
 inline:{flexDirection:'row',alignItems:'center',gap:11,flexWrap:'wrap'},sectionRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8},
 heroIcon:{width:46,height:46,borderRadius:15,backgroundColor:C.limeSoft,alignItems:'center',justifyContent:'center'},
 actionIcon:{width:36,height:36,borderRadius:11,backgroundColor:C.elevated,alignItems:'center',justifyContent:'center'},
 heading:{fontSize:19,fontWeight:'800',color:C.white},cardTitle:{fontSize:16,fontWeight:'800',color:C.white},
 muted:{fontSize:15,color:C.muted,lineHeight:23},goal:{fontSize:37,fontWeight:'900',color:C.white},
 choice:{backgroundColor:C.surface,borderRadius:16,padding:15,minHeight:48,borderWidth:1,borderColor:C.border,gap:5},
 selected:{borderColor:C.lime,backgroundColor:C.limeSoft},stepper:{backgroundColor:C.elevated,borderRadius:13,padding:12,minWidth:48,minHeight:48,alignItems:"center",justifyContent:"center"},
 button:{backgroundColor:C.elevated,borderWidth:1,borderColor:C.border,padding:13,borderRadius:14,alignItems:'center',justifyContent:'center',minHeight:48},
 disabled:{opacity:0.45},
 buttonText:{color:C.white,fontWeight:'900',fontSize:15},
});
