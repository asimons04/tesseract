<script lang="ts">
    import { type IconSource, Icon } from 'svelte-hero-icons'
    
    export let label: string = ''
    export let color: BadgeColor = 'gray'
    export let icon: IconSource | undefined = undefined
    export let iconSize:number = 16
    export let randomColor = false
    export let rightJustify = true
    export let inline:boolean = false
    export let click:boolean = true

    const badgeColor = {
        red: `bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-300                     ${click ? 'hover:bg-red-900 hover:text-red-200 hover:dark:bg-red-200 hover:dark:text-red-900' : ''}`,
        green: `bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-300           ${click ? 'hover:bg-green-800 hover:text-green-300  hover:dark:bg-green-300 hover:dark:text-green-900' : ''}`,
        yellow: `bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300      ${click ? 'hover:bg-yellow-900 hover:text-yellow-200 hover:dark:bg-yellow-200 hover:dark:text-yellow-900' : ''}`,
        gray: `bg-slate-300 dark:bg-zinc-700 text-gray-800 dark:text-gray-200               ${click ? 'hover:bg-zinc-700 hover:text-gray-200 hover:dark:bg-slate-300 hover:dark:text-zinc-700' : ''}`,
        orange: `bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200      ${click ? 'hover:bg-orange-800 hover:text-orange-200 hover:dark:bg-orange-200 hover:dark:text-orange-800' : ''}`,
        purple: `bg-fuchsia-200 dark:bg-fuchsia-800 text-fuchsia-800 dark:text-fuchsia-200  ${click ? 'hover:bg-fuchsia-800 hover:text-fuchsia-200 hover:dark:bg-fuchsia-200 hover:dark:text-fuchsia-800' : ''}`,
        pink: `bg-pink-200 dark:bg-pink-800 text-pink-800 dark:text-pink-200                ${click ? 'hover:bg-pink-800 hover:text-pink-200 hover:dark:bg-pink-200 hover:dark:text-pink-800' : ''}`,
        blue: `bg-sky-200 dark:bg-sky-800 text-sky-800 dark:text-sky-200                    ${click ? 'hover:bg-sky-800 hover:text-sky-200 hover:dark:bg-sky-200 hover:dark:text-sky-800' : ''}`
    }
    type BadgeColor = keyof typeof badgeColor
    
    let colors = Object.keys(badgeColor)
    let colorClass = randomColor
        ? badgeColor[colors[Math.floor(Math.random()*colors.length)] as BadgeColor]
        : badgeColor[color]
</script>

<button class="px-2 py-0.5 rounded-full min-w-fit max-h-[20px] text-xs font-bold {inline ? 'inline-flex' : 'flex'} items-center gap-1 
    whitespace-nowrap overflow-hidden 
    {rightJustify ? 'ml-auto' : ''}
    {colorClass} 
    {click ? '' : 'pointer-events-none'}
    {$$props.class}
    " 
    title={label} 
    on:click
>   
    {#if icon}
        <Icon src={icon} mini width={iconSize} />
    {/if}

    <slot />
</button>
