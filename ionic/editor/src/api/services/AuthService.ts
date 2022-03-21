/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_auth_cookie_login_api_auth_login_post } from '../models/Body_auth_cookie_login_api_auth_login_post';

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
     * Tea
     * @returns void 
     * @throws ApiError
     */
    public static teaApiAuthGet(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/',
            errors: {
                418: `Successful Response`,
            },
        });
    }

}