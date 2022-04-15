/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdminPanelMsg } from '../models/AdminPanelMsg';
import type { Body_upload_new_file_api_files__post } from '../models/Body_upload_new_file_api_files__post';
import type { FileReference } from '../models/FileReference';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class FilesService {

    /**
     * Get All Files
     * @returns FileReference Successful Response
     * @throws ApiError
     */
    public static getAllFilesApiFilesGet(): CancelablePromise<Array<FileReference>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/files/',
        });
    }

    /**
     * Upload New File
     * Upload a file and associate it with a measurement.
     * @param measurementId 
     * @param formData 
     * @returns FileReference Successful Response
     * @throws ApiError
     */
    public static uploadNewFileApiFilesPost(
measurementId: number,
formData: Body_upload_new_file_api_files__post,
): CancelablePromise<FileReference> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/files/',
            query: {
                'measurement_id': measurementId,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                404: `Not Found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get My Files
     * @returns FileReference Successful Response
     * @throws ApiError
     */
    public static getMyFilesApiFilesMineGet(): CancelablePromise<Array<FileReference>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/files/mine',
        });
    }

    /**
     * Return File
     * Returns file for a given id.
 *
 * File must have an associated measurement.
 *
 * - isDownload = False: if `True` then the file will be sent as
 * an attachment
 * - id: id of file to return
 * - optimized = True: returns compressed version, if applicable. **MIME
 * will most likely differ!**
     * @param id 
     * @param isDownload 
     * @param optimized 
     * @returns any Successful Response
     * @throws ApiError
     */
    public static returnFileApiFilesFileIdGet(
id: string,
isDownload: boolean = false,
optimized: boolean = true,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/files/file/{id}',
            path: {
                'id': id,
            },
            query: {
                'isDownload': isDownload,
                'optimized': optimized,
            },
            errors: {
                404: `Not Found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete File
     * @param id 
     * @returns void 
     * @throws ApiError
     */
    public static deleteFileApiFilesDeleteIdGet(
id: string,
): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/files/delete/{id}',
            path: {
                'id': id,
            },
            errors: {
                403: `Forbidden`,
                404: `Not Found`,
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