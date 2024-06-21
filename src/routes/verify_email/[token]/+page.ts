import { getClient } from '$lib/lemmy.js'
import { DEFAULT_INSTANCE_URL } from '$lib/instance'

let success: boolean = false;

export async function load({ params, fetch }) {
    const token = params.token;

    try {
        const res = await getClient(DEFAULT_INSTANCE_URL).verifyEmail({
            token: token
        })
        success = true
    }
    catch (err){
        success = false;
    }
    
    return {
        success: success
    }
    

}
  