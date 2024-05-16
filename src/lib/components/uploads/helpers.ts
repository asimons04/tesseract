import type { UploadImageResponse } from 'lemmy-js-client'
import { getClient } from '$lib/lemmy'

/** Deletes an image given an Upload Image Response object
 * @param uploadResponse The response object from uploadImage()
*/
export async function deleteImageUpload(uploadResponse:UploadImageResponse) {
    if (!uploadResponse?.files || uploadResponse.files.length < 1) return false
    try {
        return await getClient().deleteImage({
            filename: uploadResponse.files[0].file,
            token: uploadResponse.files[0].delete_token  
        })
    }
    catch {
        return false
    }
}

/** Deletes multiple image uploads
 * @param uploads An array of UploadImageResponse objects to delete
*/
export async function deleteImageUploads(uploads:UploadImageResponse[]) {
    uploads.forEach(async (upload) => {
        await deleteImageUpload(upload)
    })
}