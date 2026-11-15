import type {Data,Profile} from '../domain';
/** Initial setup must never replace an existing plan or erase records. */
export function completeOnboarding(current:Data,profile:Profile):Data{
 return current.profile?current:{...current,profile};
}
