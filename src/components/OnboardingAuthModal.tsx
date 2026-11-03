import React from 'react';
import {Modal,Pressable,StyleSheet,Text,View} from 'react-native';
import {Mail,ShieldCheck,Cloud,Smartphone,Chrome} from 'lucide-react-native';
import {C} from '../theme';

export type OnboardingAuthStep='choice'|'benefits'|'email'|null;
export function OnboardingAuthModal({step,onEmail,onGoogle,onLater,onDecline,onBack,emailForm}:{
 step:OnboardingAuthStep;onEmail:()=>void;onGoogle:()=>void;onLater:()=>void;onDecline:()=>void;onBack:()=>void;emailForm:React.ReactNode;
}){
 return <Modal visible={step!==null} transparent animationType="fade" onRequestClose={step==='benefits'?onDecline:onLater}>
 <View style={s.overlay}><View style={s.card}>
 {step==='choice'?<>
 <Text accessibilityRole="header" style={s.title}>Spara din resa</Text>
 <Text style={s.description}>Vill du logga in eller skapa ett konto för att skydda din plan och historik?</Text>
 <Pressable accessibilityRole="button" onPress={onEmail} style={s.option}><Mail size={23} color={C.lime}/><Text style={s.optionText}>Fortsätt med e-post</Text></Pressable>
 <Pressable accessibilityRole="button" accessibilityState={{disabled:true}} disabled onPress={onGoogle} style={[s.option,{opacity:.5}]}><Chrome size={23} color={C.muted}/><View style={{flex:1}}><Text style={s.optionText}>Fortsätt med Google</Text><Text style={s.description}>Kommer i en senare uppdatering</Text></View></Pressable>
 <Pressable accessibilityRole="button" onPress={onLater} style={s.later}><Text style={s.laterText}>Inte nu</Text></Pressable>
 </>:step==='benefits'?<>
 <ShieldCheck size={38} color={C.lime}/>
 <Text accessibilityRole="header" style={s.title}>Vill du skydda dina framsteg?</Text>
 <Text style={s.description}>Med ett konto kan du synkronisera historik mellan enheter och återfå dina uppgifter när du byter telefon. Som gäst sparas allt endast på den här enheten och kan gå förlorat.</Text>
 <Pressable accessibilityRole="button" onPress={onBack} style={s.primary}><Cloud size={20} color={C.background}/><Text style={s.primaryText}>Ja tack, skapa konto</Text></Pressable>
 <Pressable accessibilityRole="button" onPress={onDecline} style={s.later}><Smartphone size={18} color={C.muted}/><Text style={s.laterText}>Nej tack, fortsätt som gäst</Text></Pressable>
 </>:step==='email'?<>
 <Text accessibilityRole="header" style={s.title}>Fortsätt med e-post</Text>
 {emailForm}
 <Pressable accessibilityRole="button" onPress={onBack} style={s.later}><Text style={s.laterText}>Tillbaka till alternativen</Text></Pressable>
 </>:null}
 </View></View></Modal>;
}
const s=StyleSheet.create({
 overlay:{flex:1,justifyContent:'center',padding:20,backgroundColor:'rgba(0,0,0,.75)'},
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
