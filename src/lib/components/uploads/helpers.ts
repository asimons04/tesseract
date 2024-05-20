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

/** Reads an image from the clipboard with both classic and clipboard API methods
 * @param e Event details for the paste event
*/
export async function readImageFromClipboard(e:any): Promise<Blob|undefined> {
    
    // If Clipboard API not available, use old method (Firefox/Safari)
    if (typeof(navigator.clipboard.read) == 'undefined') {
        for (const clipboardItem of e.clipboardData.files) {
            if (clipboardItem.type.startsWith('image/')) {
              return clipboardItem
            }
        }
    }
    // Use Clipboard API if avaiable (Chromium)
    else {
        const items = await navigator.clipboard.read()
        for (const item of items) {
            const imageTypes = item.types.find(type => type.startsWith('image/'))
            if (!imageTypes) return
            return await item.getType(imageTypes);
        }
    }
}

export async function readTextFromClipboard(e:any): Promise<string> {
    if (typeof(navigator.clipboard.read) != 'undefined') {
        return await navigator.clipboard.readText()
    }
    return ''
}


export function blobToFileList(blob:Blob): FileList {
        const dt = new DataTransfer();
        dt.items.add(new File([blob], 'image.png'))
        return dt.files
}