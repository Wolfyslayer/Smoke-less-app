const pages={support:'https://wolfyslayer.online/support',privacy:'https://wolfyslayer.online/privacy'} as const;
export async function openProductPage(page:keyof typeof pages,open:(url:string)=>Promise<unknown>):Promise<boolean>{
 if(!Object.prototype.hasOwnProperty.call(pages,page))return false;
 try{await open(pages[page]);return true;}catch{return false;}
}
