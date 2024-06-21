import { getClient } from '$lib/lemmy.js'

export async function load({ fetch }) {
    const client = getClient()

    const [site, federated_instances] = await Promise.all([
        client.getSite(),
        client.getFederatedInstances()
    ])
    
    //const site = await client.getSite()
    //const federated_instances = await client.getFederatedInstances();

  return {
    site: site,
    federated_instances: federated_instances.federated_instances
  }
}
