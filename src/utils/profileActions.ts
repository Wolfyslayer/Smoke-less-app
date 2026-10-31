import type {Data,Profile} from '../domain';

/** Apply a partial profile update without creating a profile for new users. */
export function updateProfile(data:Data,patch:Partial<Profile>):Data{
 return data.profile?{...data,profile:{...data.profile,...patch}}:data;
}
