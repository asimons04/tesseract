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
                return await imageBlobToWebp(clipboardItem)
            }
        }
    }
    // Use Clipboard API if avaiable (Chromium)
    else {
        const items = await navigator.clipboard.read()
        for (const item of items) {
            const imageTypes = item.types.find(type => type.startsWith('image/'))
            if (!imageTypes) return
            
            const imageData = await item.getType(imageTypes)
            const imageBlob = await imageBlobToWebp(imageData)
            return imageBlob
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


export async function imageBlobToWebp(blob:Blob): Promise<Blob> {
    try {
        const bmp = await createImageBitmap(blob)
        const {width, height} = bmp

        const canvas = new OffscreenCanvas(width, height)
        const ctx = canvas.getContext("2d")

        if (!ctx) return blob

        ctx.drawImage(bmp, 0, 0)
        bmp.close()
        return await canvas.convertToBlob({type: 'image/webp', quality: 0.6})
    }
    catch (err) {
        console.log("Error converting image to webp", err)
        return blob
    }

    
    
}

