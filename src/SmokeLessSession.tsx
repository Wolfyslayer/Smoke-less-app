import React from 'react';
import {useSmokeLessSessionModel} from './hooks/useSmokeLessSessionModel';
import {AppSessionView} from './components/AppSessionView';
import type {AccountUser} from './authService';

export function SmokeLessSession({sessionUser,verifyCurrentUid}:{sessionUser:AccountUser|null;verifyCurrentUid:()=>string|null}){
 const model=useSmokeLessSessionModel(sessionUser,verifyCurrentUid);
 return <AppSessionView model={model}/>;
}
