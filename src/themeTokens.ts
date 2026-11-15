/** Semantic roles shared by the planned light/dark UI. No session data. */
export type ThemeMode='light'|'dark'|'system';
export type ThemeName='light'|'dark';
export type ThemePalette={
 background:string;surface:string;elevated:string;soft:string;
 accent:string;accentPressed:string;accentSubtle:string;onAccent:string;
 text:string;textMuted:string;textSecondary:string;border:string;
 success:string;warning:string;danger:string;
};
export const themePalettes:Readonly<Record<ThemeName,Readonly<ThemePalette>>>={
 light:{background:'#F5F7F3',surface:'#FFFFFF',elevated:'#EDF2E9',soft:'#E4EBDD',accent:'#28613C',accentPressed:'#1D4B2D',accentSubtle:'#E0EFDF',onAccent:'#FFFFFF',text:'#17241B',textMuted:'#4C5F50',textSecondary:'#58685B',border:'#CAD5C7',success:'#256440',warning:'#795400',danger:'#AF2934'},
 dark:{background:'#0D1511',surface:'#16221B',elevated:'#203027',soft:'#293B30',accent:'#BCE892',accentPressed:'#A5D379',accentSubtle:'#283E23',onAccent:'#14210F',text:'#F0F5EC',textMuted:'#B2C3B3',textSecondary:'#A4B6A5',border:'#3E5545',success:'#92DAB0',warning:'#F2C96D',danger:'#FF9B9F'},
};
export const designTokens={
 spacing:{xs:4,sm:8,md:12,lg:16,xl:24,xxl:32},
 radius:{control:14,card:24,dialog:28,pill:999},
 type:{caption:12,body:16,label:14,title:24,hero:40},
 layout:{minTouchTarget:48,contentMaxWidth:640},
} as const;
export function resolveTheme(mode:ThemeMode,system:ThemeName|null|undefined):ThemeName{
 return mode==='system'?(system==='dark'?'dark':'light'):mode;
}
