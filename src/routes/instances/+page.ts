import { getClient } from '$lib/lemmy'

export async function load() {
    try {
        const instances = await getClient().getFederatedInstances();
        
        return {
            instances: instances.federated_instances
        }
    }
    catch (err) {
        return {
            instances: {
                allowed: [],
                blocked: [],
                linked: []
            }
        }
    }
}

