/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Base User model.
 */
export type User = {
    id?: string;
    email: string;
    is_active?: boolean;
    is_superuser?: boolean;
    is_verified?: boolean;
};
