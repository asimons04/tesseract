import { getClient, getInstance } from '$lib/lemmy.js'

let success: boolean = false;

export async function load({ params, fetch }) {

    const instance:String = getInstance();
    const token:String = params.token;

    try {
        const res = await getClient(instance, fetch).verifyEmail({
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
  