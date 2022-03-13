/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FileRefrence } from './FileRefrence';
import type { Location } from './Location';

export type Measurement = {
    location: Location;
    notes: string;
    description: string;
    title: string;
    tags: Array<string>;
    measurement_id: number;
    files: Array<FileRefrence>;
};
