/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdminPanelMsg } from '../models/AdminPanelMsg';
import type { User } from '../models/User';
import type { UserCreate } from '../models/UserCreate';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class LocalService {

    /**
     * Register:Register
     * @param requestBody
     * @returns User Successful Response
     * @throws ApiError
     */
    public static registerRegisterLocalRegisterPost(
        requestBody: UserCreate,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/local/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Reoptimize All Files
     * @returns AdminPanelMsg Successful Response
     * @throws ApiError
     */
    public static reoptimizeAllFilesLocalReoptimizeGet(): CancelablePromise<AdminPanelMsg> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/local/reoptimize',
        });
    }

}