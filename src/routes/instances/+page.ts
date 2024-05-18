import type { InstanceWithFederationState, ReadableFederationState } from 'lemmy-js-client'

export interface InstanceWithFederationStateCustom extends InstanceWithFederationState {
    state: 'blocked' | 'allowed' | 'linked'
    dead: boolean
    inbound_federation?: ReadableFederationState
}

import { capitalizeFirstLetter } from '$lib/util'
import { getClient } from '$lib/lemmy'


function sortInstances(a:InstanceWithFederationStateCustom, b:InstanceWithFederationStateCustom) {
    return a.domain.toLowerCase() < b.domain.toLowerCase() ? -1 : a.domain > b.domain ? 1 : 0
}

function instanceIsDead(instance:InstanceWithFederationState):boolean {
    if (!instance.updated) return false
    
    let delta = 3 * 24 * 60 * 60 // 3 days -> seconds
    let lastUpdated = Math.floor(Date.parse(instance.updated)/1000)  // Date in ms->seconds
    let now = Math.floor(Number(Date.now().toString()) /1000)

    if ( (now-delta) > lastUpdated) return true
    return false
}

export async function load() {
    // Empty array to fill up with instance list with extended attributes
    const federated_instances = [] as InstanceWithFederationStateCustom[]

    // Fetch the federated instances from the API
    const instances = await getClient().getFederatedInstances();

    // Combine all instances into one array and add a 'state' key for blocked, allowed, linked status
    
    // Linked Instances
    if (instances?.federated_instances?.linked) {
        instances.federated_instances.linked.forEach((instance:InstanceWithFederationState) => {
            const inst = {
                ...instance,
                state: 'linked',
                dead: instanceIsDead(instance),
                software: instance.software ?? 'Unknown'
            } as InstanceWithFederationStateCustom
            federated_instances.push(inst)  
        })
    }
    
    // Blocked Instances
    if (instances?.federated_instances?.blocked) {
        instances.federated_instances.blocked.forEach((instance:InstanceWithFederationState) => {
            const inst = {
                ...instance,
                state: 'blocked',
                dead: instanceIsDead(instance),
                software: instance.software ?? 'Unknown'
            } as InstanceWithFederationStateCustom
            federated_instances.push(inst)  
        })
    }

    // Allowed Instances
    if (instances?.federated_instances?.allowed) {
        instances.federated_instances.allowed.forEach((instance:InstanceWithFederationState) => {
            const inst = {
                ...instance,
                state: 'allowed',
                dead: instanceIsDead(instance),
                software: instance.software ?? 'Unknown'
            } as InstanceWithFederationStateCustom
            federated_instances.push(inst)  
        })
    }


    // Create an array of software types to select from
    let softwareTypes = ['All'] as string[]
    federated_instances.forEach((instance:InstanceWithFederationStateCustom) => {
        if (instance.software && !softwareTypes.includes(capitalizeFirstLetter(instance.software))) softwareTypes.push(capitalizeFirstLetter(instance.software))
    })
    softwareTypes.sort()

    // Create an array of the available federation states (allow and blocked are mutually exclusive)
    let federation_states = ['All', 'Linked']
    instances?.federated_instances?.allowed && instances.federated_instances.allowed.length > 0
        ? federation_states.push('Allowed')
        : federation_states.push('Blocked')
    

    // Sort the instances alphabetically
    federated_instances.sort(sortInstances)

    return {
        instances: federated_instances,
        software_types: softwareTypes,
        federation_states: federation_states
    }
}

