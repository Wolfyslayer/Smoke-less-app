import React from 'react';
import {Text,View} from 'react-native';
import {AppButton,AppCard} from './ui';
import {useThemeColors} from '../theme';
type Props={busy:boolean;migrationBusy:boolean;cloudBusy:boolean;result:string|null;onMigrate:()=>void;onPreview:()=>void;onImport:()=>void;onInspect:()=>void};
export function AccountCloudActions({busy,migrationBusy,cloudBusy,result,onMigrate,onPreview,onImport,onInspect}:Props){
 const C=useThemeColors(),disabled=busy||migrationBusy||cloudBusy;
 return <AppCard><Text accessibilityRole="header" style={{fontSize:20,fontWeight:'700',color:C.text}}>Kontots historik</Text><Text style={{fontSize:15,lineHeight:23,color:C.textMuted}}>Kontrollera innehållet innan du väljer en dataåtgärd. Kopiering och import använder samma bekräftelser och skydd som tidigare.</Text>{result?<Text accessibilityLiveRegion="polite" style={{color:C.textMuted}}>{result}</Text>:null}<View style={{gap:12}}><AppButton title={cloudBusy?'Läser molndata…':'Förhandsgranska molndata'} secondary disabled={disabled} onPress={onPreview}/><AppButton title={migrationBusy?'Kopierar gästhistorik…':'Kopiera gästhistorik till kontot'} secondary disabled={disabled} onPress={onMigrate}/><AppButton title="Importera molnhistorik (med bekräftelse)" secondary disabled={disabled} onPress={onImport}/><AppButton title="Kontrollera vad som finns i molnet" secondary disabled={disabled} onPress={onInspect}/></View></AppCard>;
}
