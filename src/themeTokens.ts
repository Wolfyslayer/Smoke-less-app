/** Semantic roles shared by the planned light/dark UI. No session data. */
export type ThemeMode='light'|'dark'|'system';
export type ThemeName='light'|'dark';
export type ThemePalette={
 background:string;surface:string;elevated:string;soft:string;
 accent:string;accentPressed:string;accentSubtle:string;onAccent:string;
 text:string;textMuted:string;textSecondary:string;border:string;
 success:string;warning:string;danger:string;scenerySun:string;
};
export const themePalettes:Readonly<Record<ThemeName,Readonly<ThemePalette>>>={
 light:{background:'#F1F8F7',surface:'#FFFFFF',elevated:'#E8F3F1',soft:'#DEEEEA',accent:'#007D62',accentPressed:'#00634F',accentSubtle:'#DAF0E9',onAccent:'#FFFFFF',text:'#082B32',textMuted:'#3A5D63',textSecondary:'#44666B',border:'#B8D6D0',success:'#006C51',warning:'#795000',danger:'#B32D35',scenerySun:'#FFC491'},
 dark:{background:'#00151B',surface:'#05282D',elevated:'#0A3339',soft:'#103F43',accent:'#35EDAC',accentPressed:'#20CF95',accentSubtle:'#083E35',onAccent:'#00291E',text:'#F2FCF9',textMuted:'#B4D0D1',textSecondary:'#A6C6C8',border:'#205259',success:'#58E8AB',warning:'#FFD18A',danger:'#FFA0A5',scenerySun:'#FFC491'},
};
export const designTokens={
 spacing:{xs:4,sm:8,md:12,lg:16,xl:24,xxl:32},
 radius:{control:14,card:16,dialog:24,pill:999},
 type:{caption:12,body:16,label:14,title:24,hero:40},
 layout:{minTouchTarget:48,contentMaxWidth:640},
} as const;
export function resolveTheme(mode:ThemeMode,system:ThemeName|null|undefined):ThemeName{
 return mode==='system'?(system==='dark'?'dark':'light'):mode;
}
