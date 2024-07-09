<script lang="ts">
  import type { Profile } from '$lib/auth.js'
  import { Icon, PaintBrush, UserCircle } from 'svelte-hero-icons'

  export let profile: Profile | undefined = undefined
  export let selected: boolean = false
  export let index: number = 0
  export let size: number = 20
  export let canSetColor:boolean = false
</script>


{#if profile}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="relative group flex-col items-center" on:click|stopPropagation>  
    <Icon
        src={UserCircle}
        mini={selected}
        size={`${size}`}
        title={profile.username}
        class="text-blue-500 flex-shrink-0"
        style={profile.color
        ? `color: ${profile.color}`
        : `filter: hue-rotate(${index * 50}deg)`}
    />
    {#if canSetColor}
        <div class="absolute top-0 left-0 w-full h-full opacity-0 grid group-hover:opacity-100 z-20 place-items-center
            bg-slate-200 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-full transition-all"
        >
            <Icon src={PaintBrush} mini size="14" />
        </div>

        <input type="color" class="opacity-0 absolute top-0 left-0 h-full w-full rounded-full cursor-pointer z-30" bind:value={profile.color}/>
    {/if}
</div>
{/if}
