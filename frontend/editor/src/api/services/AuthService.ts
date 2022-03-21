/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BearerResponse } from '../models/BearerResponse';
import type { Body_auth_cookie_login_api_cookie_login_post } from '../models/Body_auth_cookie_login_api_cookie_login_post';
import type { Body_auth_jwt_login_api_jwt_login_post } from '../models/Body_auth_jwt_login_api_jwt_login_post';

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
    public static authCookieLoginApiCookieLoginPost(
        formData: Body_auth_cookie_login_api_cookie_login_post,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/cookie/login',
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
    public static authCookieLogoutApiCookieLogoutPost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/cookie/logout',
            errors: {
                401: `Missing token or inactive user.`,
            },
        });
    }

    /**
     * Auth:Jwt.Login
     * @param formData
     * @returns BearerResponse Successful Response
     * @throws ApiError
     */
    public static authJwtLoginApiJwtLoginPost(
        formData: Body_auth_jwt_login_api_jwt_login_post,
    ): CancelablePromise<BearerResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/jwt/login',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                400: `Bad Request`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Auth:Jwt.Logout
     * @returns any Successful Response
     * @throws ApiError
     */
    public static authJwtLogoutApiJwtLogoutPost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/jwt/logout',
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
