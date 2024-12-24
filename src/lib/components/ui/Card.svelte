<script lang="ts">
    import { userSettings } from '$lib/settings'
    type CardColor = 'default' | 'warning' | 'error' | 'success'
    
    export let cardColor: CardColor = 'default'
    export let backgroundImage:string = ''
    export let elevation: -1 | 0 | 1 | 2 = 1
    export { clazz as class }

    const getColor = (color: CardColor) => {
        switch (color) {
            case 'default':
                switch (elevation) {
                    case -1:
                        return ''
                    case 0:
                        return 'border border-slate-300 dark:border-zinc-900 bg-slate-200 dark:bg-zinc-950'
                    case 1:
                        return 'border border-slate-300 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900'

                    case 2:
                        return 'border border-slate-300 dark:border-zinc-900 bg-slate-200 dark:bg-zinc-800'
                }
            
            case 'warning':
                return 'border border-yellow-300 dark:bg-yellow-950/30 dark:border-yellow-900 bg-yellow-50'

            case 'success':
                return 'border border-green-300 dark:bg-green-950/30 dark:border-green-900 bg-green-50'

            case 'error':
                return 'border border-red-300 dark:bg-red-950/30 dark:border-red-900 bg-red-50'
        }
    }

    let clazz = ''
    let colorClass = getColor(cardColor)
    $:  cardColor, colorClass=getColor(cardColor)
</script>

{#if backgroundImage}
    <div class="flex items-stretch backdrop-blur-lg bg-black/80 dark:bg-white/80 rounded-2xl" 
        style="background-image: url('{backgroundImage}'); 
            background-size: {$userSettings.uiState.stretchCardBanner ? 'cover' : 'auto'}; 
            background-position: center center;
            background-repeat: no-repeat;
    ">

        <div class="w-full break-words border dark:border-zinc-800 bg-white/50 dark:bg-black/50 rounded-2xl {clazz}" {...$$restProps}>
            <slot />
        </div>
    </div>
{:else}
    <div class="break-words {colorClass} rounded-2xl {clazz}" {...$$restProps}>
        <slot />
    </div>
{/if}
