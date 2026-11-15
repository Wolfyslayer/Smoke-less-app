import React from 'react';
import type {DailyShareProgress} from '../domain/dailyShareCard';
import {DailyProgressShareArtwork} from './DailyProgressShareArtwork';

/** Compatibility wrapper: every progress surface uses the same renderer. */
export function DailyProgressShareCard(props:DailyShareProgress){return <DailyProgressShareArtwork {...props}/>;}
