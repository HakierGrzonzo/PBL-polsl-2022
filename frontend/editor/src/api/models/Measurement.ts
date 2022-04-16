/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FileReference } from './FileReference';
import type { Location } from './Location';
import type { Weather } from './Weather';

export type Measurement = {
    location: Location;
    notes: string;
    description: string;
    title: string;
    laeq: number;
    tags: Array<string>;
    measurement_id: number;
    files: Array<FileReference>;
    weather?: Weather;
};