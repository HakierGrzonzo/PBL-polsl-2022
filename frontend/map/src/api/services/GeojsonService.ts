/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class GeojsonService {

    /**
     * Get Geojson
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getGeojsonApiGeojsonGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/geojson/',
        });
    }

    /**
     * Get Geojson For Measurement
     * @param id
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getGeojsonForMeasurementApiGeojsonIdGet(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/geojson/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Not Found`,
                422: `Validation Error`,
            },
        });
    }

}