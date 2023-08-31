import { getClient, getInstance } from '$lib/lemmy.js'

export async function load({ params, fetch }) {
    const instance = getInstance();
    const token:String = params.token;
    const result = {
        status: 404,
        message: ""
    }

    try {
        
        const res = await getClient(instance, fetch).verifyEmail({
            token: token
        })

        result.status = 200;
        result.message = "Successfully verified token";
        return result;

    }
    catch (err){
        result.status = 404;
        result.message = err as any;
        return result;
    }
    

}
  