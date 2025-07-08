<script lang="ts">
  import type { IconSource } from 'svelte-hero-icons'
  import {
    CheckCircle,
    Eye,
    EyeSlash,
    Fire,
    Icon,
    InformationCircle,
    LockClosed,
    LockOpen,
    Megaphone,
    QuestionMarkCircle,
    Trash,
    UserMinus,
    UserPlus,
    XCircle,
  } from 'svelte-hero-icons'
  import type { ActionName } from './+page.js'
    import type { Community } from 'lemmy-js-client';

  export let action: ActionName
  export let expires: string|undefined = undefined
  export let community: Community | undefined = undefined
  

  $: actionData = getAction(action, expires)

    const getAction = ( action: ActionName, expires:string|undefined=undefined): { icon: IconSource; text: string; class: string } => {
        let qualifier = "Permanent ";
        switch (action) {
            case 'ban': {
                if (expires) { qualifier = "Temporary " }
                    
                return {
                    icon: XCircle,
                    class: 'text-red-600 dark:text-red-400',
                    text: `${qualifier}Instance Ban`,
                }
            }
            case 'banCommunity': {
                if (expires) { qualifier = "Temporary " }
                return {
                    icon: XCircle,
                    class: 'text-red-600 dark:text-red-400',
                    text: `${qualifier}Community Ban`,
                }
            }
      
            case 'unban': {
                return {
                    icon: CheckCircle,
                    class: 'text-green-600 dark:text-green-400',
                    text: 'Unban (instance)',
                }
            }
      
            case 'unbanCommunity': {
                return {
                    icon: CheckCircle,
                    class: 'text-green-600 dark:text-green-400',
                    text: 'Unban (Community)',
                }
            }

            case 'commentRemoval': {
                return {
                    icon: Trash,
                    class: 'text-red-600 dark:text-red-400',
                    text: 'Remove Comment',
                }
            }
      
            case 'commentRestore': {
                return {
                    icon: Trash,
                    class: 'text-green-600 dark:text-green-400',
                    text: 'Restore Comment',
                }
            }
      
            case 'postRemoval': {
                return {
                    icon: Trash,
                    class: 'text-red-600 dark:text-red-400',
                    text: 'Remove Post',
                }
            }
      
            case 'postRestore': {
                return {
                    icon: Trash,
                    class: 'text-green-600 dark:text-green-400',
                    text: 'Restore Post',
                }
            }
      
            case 'modAdd': {
                return {
                    icon: UserPlus,
                    class: 'text-green-600 dark:text-green-400',
                    text: `Add ${community ? 'Mod' : 'Admin'}`,
                }
            }
      
            case 'modRemove': {
                return {
                    icon: UserMinus,
                    class: 'text-red-600 dark:text-red-400',
                    text: `Removed ${community ? 'Mod' : 'Admin'}`,
                }
            }
      
            case 'postFeature': {
                return {
                    icon: Megaphone,
                    class: 'text-green-600 dark:text-green-400',
                    text: 'Feature Post',
                }
            }

            case 'postUnfeature': {
                return {
                    icon: Megaphone,
                    class: 'text-red-600 dark:text-red-400',
                    text: 'Unfeature Post',
                }
            }

            case 'postLock': {
                return {
                    icon: LockClosed,
                    class: 'text-yellow-600 dark:text-yellow-400',
                    text: 'Lock Post',
                }
            }
      
            case 'postUnlock': {
                return {
                    icon: LockOpen,
                    class: 'text-yellow-600 dark:text-yellow-400',
                    text: 'Unlock Post',
                }
            }
      
            case 'purge': {
                return {
                    icon: Fire,
                    class: 'text-red-600 dark:text-red-400',
                    text: 'Purge',
                }
            }

            case 'removeCommunity': {
                return {
                    icon: Trash,
                    class: 'text-red-600 dark:text-red-400',
                    text: 'Remove Community'
                }
            }

            case 'restoreCommunity': {
                return {
                    icon: Trash,
                    class: 'text-green-600 dark:text-green-400',
                    text: 'Restore Community'
                }
            }

            case 'transferCommunity': {
                return {
                    icon: UserPlus,
                    class: 'text-green-600 dark:text-green-400',
                    text: 'Transfer Community'
                }
            }

            case 'hideCommunity': {
                return {
                    icon: EyeSlash,
                    class: 'text-red-600 dark:text-red-400',
                    text: 'Hide Community'
                }
            }

            case 'unhideCommunity': {
                return {
                    icon: Eye,
                    class: 'text-green-600 dark:text-green-400',
                    text: 'Unhide Community'
                }
            }
        }

        return {
            icon: QuestionMarkCircle,
            text: 'Unknown',
            class: '',
        }
    }
</script>

<span class="font-bold">
    <span class="flex items-center gap-1 {actionData.class}">
        <Icon src={actionData.icon} size="16" mini class="inline flex-shrink-0" />
        {actionData.text}
    </span>
</span>
