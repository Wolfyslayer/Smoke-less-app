import type {Data} from '../domain';
import {validateData} from '../domain';

/** Parse a JSON backup and reject data that does not match the app schema. */
export function parseBackupData(backup:string):Data{
 const value:unknown=JSON.parse(backup);
 if(!validateData(value))throw Error('Ogiltigt format');
 return value;
}
