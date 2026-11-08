import React,{useEffect,useState} from 'react';
import {KeyboardAvoidingView,Modal,Platform,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import {Mail,ShieldCheck,Cloud,Smartphone,Chrome} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {C} from '../theme';

export type OnboardingAuthStep='choice'|'benefits'|'email'|null;
export function OnboardingAuthModal({step,onEmail,onGoogle,googleConfigured,googleBusy,onLater,onDecline,onBack,hasEmailDraft,emailForm}:{
 step:OnboardingAuthStep;onEmail:()=>void;onGoogle:()=>void;googleConfigured:boolean;googleBusy:boolean;onLater:()=>void;onDecline:()=>void;onBack:()=>void;hasEmailDraft:boolean;emailForm:React.ReactNode;
}){
 const insets=useSafeAreaInsets();
 const [confirmLeave,setConfirmLeave]=useState(false);
 useEffect(()=>{if(step!=='email')setConfirmLeave(false);},[step]);
 const returnFromEmail=()=>{
  if(googleBusy)return;
  if(!hasEmailDraft){onBack();return;}
  setConfirmLeave(true);
 };
 return <Modal visible={step!==null} transparent animationType="fade" onRequestClose={()=>{if(googleBusy)return;if(confirmLeave){setConfirmLeave(false);return;}if(step==='email'){returnFromEmail();return;}if(step==='benefits'){onBack();return;}/* The first choice screen has no previous modal step; require an explicit choice. */}}>
 <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS==='ios'?'padding':undefined}>
 <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[s.scrollContent,{paddingTop:Math.max(insets.top,20),paddingBottom:Math.max(insets.bottom,20)}]}><View style={s.card}>
 {step==='choice'?<>
 <Text accessibilityRole="header" style={s.title}>Spara din resa</Text>
 <Text style={s.description}>Vill du logga in eller skapa ett konto för att skydda din plan och historik?</Text>
 <Pressable accessibilityRole="button" disabled={googleBusy} accessibilityState={{disabled:googleBusy}} onPress={onEmail} style={[s.option,googleBusy&&{opacity:.5}]}><Mail size={23} color={C.lime}/><Text style={s.optionText}>Fortsätt med e-post</Text></Pressable>
 <Pressable accessibilityRole="button" accessibilityLabel="Fortsätt med Google" accessibilityState={{disabled:!googleConfigured||googleBusy,busy:googleBusy}} disabled={!googleConfigured||googleBusy} onPress={onGoogle} style={[s.option,{opacity:!googleConfigured||googleBusy?.5:1}]}><Chrome size={23} color={googleConfigured?C.lime:C.muted}/><View style={{flex:1}}><Text style={s.optionText}>{googleBusy?"Vänta…":"Fortsätt med Google"}</Text>{!googleConfigured?<Text style={s.description}>Google-inloggning kräver en konfigurerad Android-build. Använd e-post tills vidare.</Text>:null}</View></Pressable>
 <Pressable accessibilityRole="button" disabled={googleBusy} accessibilityState={{disabled:googleBusy}} onPress={onLater} style={s.later}><Text style={s.laterText}>Inte nu</Text></Pressable>
 </>:step==='benefits'?<>
 <ShieldCheck size={38} color={C.lime}/>
 <Text accessibilityRole="header" style={s.title}>Vill du skydda dina framsteg?</Text>
 <Text style={s.description}>Med ett konto kan du synkronisera historik mellan enheter och återfå dina uppgifter när du byter telefon. Som gäst sparas allt endast på den här enheten och kan gå förlorat.</Text>
 <Pressable accessibilityRole="button" disabled={googleBusy} onPress={onBack} style={s.primary}><Cloud size={20} color={C.background}/><Text style={s.primaryText}>Ja tack, skapa konto</Text></Pressable>
 <Pressable accessibilityRole="button" disabled={googleBusy} onPress={onDecline} style={s.later}><Smartphone size={18} color={C.muted}/><Text style={s.laterText}>Nej tack, fortsätt som gäst</Text></Pressable>
 </>:step==='email'?<>
 <Text accessibilityRole="header" style={s.title}>Fortsätt med e-post</Text>
 {emailForm}
 <Pressable accessibilityRole="button" disabled={googleBusy} onPress={returnFromEmail} style={s.later}><Text style={s.laterText}>Tillbaka till alternativen</Text></Pressable>
 </>:null}
 </View></ScrollView>{confirmLeave?<View style={s.confirmOverlay}><View style={s.confirmCard} accessibilityViewIsModal><Text accessibilityRole="header" style={s.title}>Lämna inloggningen?</Text><Text style={s.description}>Uppgifterna du har skrivit in används inte om du går tillbaka.</Text><Pressable accessibilityRole="button" style={s.primary} onPress={()=>setConfirmLeave(false)}><Text style={s.primaryText}>Fortsätt skriva</Text></Pressable><Pressable accessibilityRole="button" style={s.later} onPress={()=>{setConfirmLeave(false);onBack();}}><Text style={s.laterText}>Gå tillbaka</Text></Pressable></View></View>:null}</KeyboardAvoidingView></Modal>;
}
const s=StyleSheet.create({
 confirmOverlay:{position:'absolute',top:0,right:0,bottom:0,left:0,backgroundColor:'rgba(0,0,0,.85)',justifyContent:'center',padding:20},
 confirmCard:{backgroundColor:C.surface,borderRadius:26,borderWidth:1,borderColor:C.border,padding:22,gap:16},
 overlay:{flex:1,backgroundColor:'rgba(0,0,0,.75)'},
 scrollContent:{flexGrow:1,justifyContent:'center',paddingHorizontal:20},
 card:{backgroundColor:C.surface,borderRadius:26,borderWidth:1,borderColor:C.border,padding:22,gap:16},
 title:{fontSize:23,fontWeight:'900',color:C.white},
 description:{fontSize:14,lineHeight:21,color:C.muted},
 option:{flexDirection:'row',alignItems:'center',gap:14,minHeight:56,padding:15,borderRadius:14,backgroundColor:C.elevated,borderWidth:1,borderColor:C.border},
 optionText:{color:C.white,fontSize:15,fontWeight:'800'},
 later:{minHeight:48,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8},
 laterText:{color:C.muted,fontSize:15,fontWeight:'700'},
 primary:{minHeight:52,backgroundColor:C.lime,borderRadius:14,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:10},
 primaryText:{color:C.background,fontWeight:'900',fontSize:15},
});
