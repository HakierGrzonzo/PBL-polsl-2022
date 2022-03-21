/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Location } from './Location';

export type CreateMeasurement = {
    location: Location;
    notes: string;
    description: string;
    title: string;
    tags: Array<string>;
};