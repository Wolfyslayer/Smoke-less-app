import type {Data} from '../domain';
import {validateData} from '../domain';

function hasDuplicate(values:string[]):boolean{
 return new Set(values).size!==values.length;
}

/** Parse a JSON backup and reject malformed or ambiguous history before it can overwrite local data. */
export function parseBackupData(backup:string):Data{
 const value:unknown=JSON.parse(backup);
 if(!validateData(value))throw Error('Ogiltigt format');
 if(hasDuplicate(value.entries.map(entry=>entry.id)))throw Error('Dubbla ID:n bland cigarettregistreringarna');
 if(hasDuplicate(value.cravings.map(craving=>craving.id)))throw Error('Dubbla ID:n bland röksugsregistreringarna');
 if(hasDuplicate(value.checkins.map(checkin=>checkin.date)))throw Error('Flera dagliga avstämningar för samma datum');
 return value;
}
