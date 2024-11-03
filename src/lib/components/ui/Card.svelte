<script lang="ts">
    import { userSettings } from '$lib/settings'
    type CardColor = 'default' | 'warning' | 'error'
    
    export let cardColor: CardColor = 'default'
    export let backgroundImage:string = ''
    export let elevation: 0 | 1 = 1

  const getColor = (color: CardColor) => {
    switch (color) {
      case 'default':
        return elevation == 0
          ? 'border border-slate-300 dark:border-zinc-900 bg-slate-200 dark:bg-zinc-950'
          : 'border border-slate-300 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900'
      case 'warning':
        return 'border border-yellow-300 dark:bg-yellow-950/30 dark:border-yellow-900 bg-yellow-50'
    }
  }

  let clazz = ''
  export { clazz as class }
</script>

{#if backgroundImage}
    <div class="flex items-stretch backdrop-blur-lg bg-black/80 dark:bg-white/80 rounded-3xl" 
        style="background-image: url('{backgroundImage}'); 
            background-size: {$userSettings.uiState.stretchCardBanner ? 'cover' : 'auto'}; 
            background-position: center center;
            background-repeat: no-repeat;
    ">

        <!---<div class="w-full break-words border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 rounded-lg {clazz}" {...$$restProps}>--->
        <div class="w-full break-words border dark:border-zinc-800 bg-white/90 dark:bg-black/80 rounded-3xl {clazz}" {...$$restProps}>  <!---dark:bg-zinc-950/80 --->
            <slot />
        </div>
    </div>
{:else}
    <div class="break-words {getColor(cardColor)} rounded-3xl {clazz}" {...$$restProps}>
        <slot />
    </div>
{/if}
