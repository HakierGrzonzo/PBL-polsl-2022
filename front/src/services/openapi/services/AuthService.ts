/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_auth_cookie_login_api_auth_login_post } from '../models/Body_auth_cookie_login_api_auth_login_post';
import type { User } from '../models/User';
import type { UserCreate } from '../models/UserCreate';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AuthService {

    /**
     * Auth:Cookie.Login
     * @param formData
     * @returns any Successful Response
     * @throws ApiError
     */
    public static authCookieLoginApiAuthLoginPost(
        formData: Body_auth_cookie_login_api_auth_login_post,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/login',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                400: `Bad Request`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Auth:Cookie.Logout
     * @returns any Successful Response
     * @throws ApiError
     */
    public static authCookieLogoutApiAuthLogoutPost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/logout',
            errors: {
                401: `Missing token or inactive user.`,
            },
        });
    }

    /**
     * Register:Register
     * @param requestBody
     * @returns User Successful Response
     * @throws ApiError
     */
    public static registerRegisterLocalRegisterRegisterPost(
        requestBody: UserCreate,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/local/register/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                422: `Validation Error`,
            },
        });
    }

}
