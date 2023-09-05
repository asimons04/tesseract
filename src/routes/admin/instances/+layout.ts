import { getClient } from '$lib/lemmy.js'
import type { GetFederatedInstances } from 'lemmy-js-client'

export async function load({ fetch }) {
    const federated_instances: GetFederatedInstances = await getClient(undefined, fetch).getFederatedInstances({});
    return {
        site: federated_instances,
    }
}
