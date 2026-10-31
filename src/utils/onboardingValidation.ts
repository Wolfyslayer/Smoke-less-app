/** Parse and validate the three numeric fields in the initial smoking plan. */
export function parseOnboardingNumbers(baseline:string,packSize:string,packPrice:string){
 const b=Number(baseline),ps=Number(packSize),price=Number(packPrice.replace(',','.'));
 if(!Number.isFinite(b)||b<0||b>200||!Number.isInteger(b)||!Number.isFinite(ps)||ps<1||!Number.isInteger(ps)||!Number.isFinite(price)||price<0)return null;
 return {baseline:b,packSize:ps,packPrice:price};
}
