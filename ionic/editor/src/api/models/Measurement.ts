/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FileReference } from './FileReference';
import type { Location } from './Location';

export type Measurement = {
    location: Location;
    notes: string;
    description: string;
    title: string;
    laeq: number;
    tags: Array<string>;
    measurement_id: number;
    files: Array<FileReference>;
};