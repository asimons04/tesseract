import { getClient, site as siteStore } from '$lib/lemmy.js'
import type { GetSite, GetFederatedInstances } from 'lemmy-js-client'

export async function load({ fetch }) {
    const site:GetSite = await getClient(undefined, fetch).getSite({})

    const federated_instances: GetFederatedInstances = await getClient(undefined, fetch).getFederatedInstances({});
    
    site.federated_instances = federated_instances.federated_instances;

  return {
    site: site,
  }
}
