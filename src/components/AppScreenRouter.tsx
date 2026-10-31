import React from 'react';
import {AccountSettingsRoutes} from './AccountSettingsRoutes';
import {ProgressScreenRoutes} from './ProgressScreenRoutes';
import type {useSmokeLessSessionModel} from '../hooks/useSmokeLessSessionModel';
type SessionModel=ReturnType<typeof useSmokeLessSessionModel>;
export function AppScreenRouter({model}:{model:SessionModel}){
 return <><ProgressScreenRoutes model={model}/><AccountSettingsRoutes model={model}/></>;
}
