<script lang="ts">
    import { type IconSource, Icon } from 'svelte-hero-icons'
    
    export let label: string = ''
    export let color: BadgeColor = 'gray'
    export let icon: IconSource | undefined = undefined
    export let iconSize:number = 16
    export let randomColor = false
    export let rightJustify = true

    const badgeColor = {
        red: 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-300',
        green: 'bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-300',
        yellow: 'bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300',
        gray: 'bg-slate-200 dark:bg-zinc-800 text-gray-800 dark:text-gray-200',
        orange: 'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200',
        purple: 'bg-fuchsia-200 dark:bg-fuchsia-800 text-fuchsia-800 dark:text-fuchsia-200',
        pink: 'bg-pink-200 dark:bg-pink-800 text-pink-800 dark:text-pink-200',
    }
    type BadgeColor = keyof typeof badgeColor
    
    let colors = Object.keys(badgeColor)
    let colorClass = randomColor
        ? badgeColor[colors[Math.floor(Math.random()*colors.length)] as BadgeColor]
        : badgeColor[color]
</script>

<button class="px-2 py-0.5 rounded-full max-h-[20px] text-xs font-bold flex items-center gap-1 
    whitespace-nowrap overflow-hidden 
    {rightJustify ? 'ml-auto' : ''}
    {colorClass} 
    {$$props.class}
    " 
    title={label} on:click
>   
    {#if icon}
        <Icon src={icon} mini width={iconSize} />
    {/if}

    <slot />
</button>
