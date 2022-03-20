/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateMeasurement } from '../models/CreateMeasurement';
import type { Measurement } from '../models/Measurement';
import type { UpdateMeasurement } from '../models/UpdateMeasurement';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DataService {

    /**
     * Get All Measurements
     * Returns all Measurements, to be used on the map part, therefore public
     * @returns Measurement Successful Response
     * @throws ApiError
     */
    public static getAllMeasurementsApiDataGet(): CancelablePromise<Array<Measurement>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/data/',
        });
    }

    /**
     * Get Users Measurements
     * Returns Measurements for the current user
     * @returns Measurement Successful Response
     * @throws ApiError
     */
    public static getUsersMeasurementsApiDataMineGet(): CancelablePromise<Array<Measurement>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/data/mine',
        });
    }

    /**
     * Get One Measurement
     * @param id 
     * @returns Measurement Successful Response
     * @throws ApiError
     */
    public static getOneMeasurementApiDataIdGet(
id: number,
): CancelablePromise<Measurement> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/data/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Not Found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Measurement
     * @param id 
     * @returns void 
     * @throws ApiError
     */
    public static deleteMeasurementApiDataIdDelete(
id: number,
): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/data/{id}',
            path: {
                'id': id,
            },
            errors: {
                403: `Forbidden`,
                404: `Not Found`,
                412: `Precondition Failed`,
                422: `Validation Error`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * Edit Measurement
     * @param id 
     * @param requestBody 
     * @returns Measurement Successful Response
     * @throws ApiError
     */
    public static editMeasurementApiDataIdPatch(
id: number,
requestBody: UpdateMeasurement,
): CancelablePromise<Measurement> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/data/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Forbidden`,
                404: `Not Found`,
                421: `Misdirected Request`,
                422: `Validation Error`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * Add Measurement
     * Create new Measurement.
 *
 * Tags must not contain `,`
     * @param requestBody 
     * @returns Measurement Successful Response
     * @throws ApiError
     */
    public static addMeasurementApiDataCreatePost(
requestBody: CreateMeasurement,
): CancelablePromise<Measurement> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/data/create',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                421: `Misdirected Request`,
                422: `Validation Error`,
                500: `Internal Server Error`,
            },
        });
    }

}