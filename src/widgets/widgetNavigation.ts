export type WidgetDestination='register'|'sos';

/** A widget can navigate, never register data or submit a form. */
export function widgetDestination(url:string,scheme:string):WidgetDestination|null{
 if(!scheme||url.length>200)return null;
 const prefix=scheme+'://?widget=';
 if(url===prefix+'register')return 'register';
 if(url===prefix+'sos')return 'sos';
 return null;
}
