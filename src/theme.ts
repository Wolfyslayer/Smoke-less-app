import {createContext,useContext} from 'react';
import {themePalettes,type ThemeMode,type ThemeName,type ThemePalette} from './themeTokens';
export function colorsFor(p:Readonly<ThemePalette>){return {...p,lime:p.accent,pressed:p.accentPressed,limeSoft:p.accentSubtle,white:p.text,muted:p.textMuted,dim:p.textSecondary};}
export type ThemeColors=ReturnType<typeof colorsFor>;
export const palettes={light:colorsFor(themePalettes.light),dark:colorsFor(themePalettes.dark)};
export type ThemeContextValue={mode:ThemeMode;name:ThemeName;colors:ThemeColors;ready:boolean;saving:boolean;error:string;setMode:(mode:ThemeMode)=>Promise<void>};
export const ThemeContext=createContext<ThemeContextValue>({mode:'system',name:'light',colors:palettes.light,ready:false,saving:false,error:'',setMode:async()=>{}});
export function useAppTheme(){return useContext(ThemeContext);}
export function useThemeColors(){return useAppTheme().colors;}
const styleCache=new WeakMap<(colors:ThemeColors)=>unknown,WeakMap<ThemeColors,unknown>>();
export function useThemeStyles<T>(factory:(colors:ThemeColors)=>T){
 const colors=useThemeColors();
 let cache=styleCache.get(factory);
 if(!cache){cache=new WeakMap();styleCache.set(factory,cache);}
 if(!cache.has(colors))cache.set(colors,factory(colors));
 return cache.get(colors) as T;
}
