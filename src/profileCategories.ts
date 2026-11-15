import type {Tab} from './hooks/useSessionNavigation';
export const profileCategories:readonly {id:string;title:string;description:string;destination:Tab}[]=[
 {id:'account',title:'Mitt konto',description:'Inloggning och kontosäkerhet',destination:'account'},
 {id:'journey',title:'Min rökstoppsresa',description:'Plan, historik, framsteg och delning',destination:'journey'},
 {id:'settings',title:'Appinställningar',description:'Utseende, påminnelser och widget',destination:'settings'},
 {id:'data',title:'Data och synkronisering',description:'Molnstatus, gästdata och integritet',destination:'backup'},
 {id:'about',title:'Om Smoke Less',description:'Version, hjälp och källor',destination:'about'},
];
