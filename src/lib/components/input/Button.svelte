<script lang="ts">
    
    import { Icon, type IconSource } from 'svelte-hero-icons'
    
    import { buttonColor, type ButtonColor } from '$lib/ui/colors'

    import Spinner from '$lib/components/ui/loader/Spinner.svelte'

    type ButtonSize = keyof typeof buttonSize
    type ButtonRoundness = keyof typeof buttonRoundness
    type ButtonAlignment = keyof typeof buttonAlignment

    const buttonAlignment = {
        left: 'justify-start text-left',
        center: 'justify-center text-center',
        right: 'justify-end text-right',
    }

    const buttonSize = {
        xs: 'px-0 py-0',
        sm: 'px-2 py-1',
        md: 'px-3 py-1.5',
        lg: 'px-4 py-2',
        'square-sm': 'w-6 h-6',
        'square-md': 'w-8 h-8',
        'square-lg': 'w-10 h-10',
        'square-form': 'w-[46px] h-[42px] p-0'
    }

    const buttonRoundness = {
        pill: 'rounded-full',
        lg: 'rounded-lg',
        md: 'rounded-md',
        none: '',
    }

    export let loading = false
    export let submit = false

    export let color: ButtonColor = 'secondary'
    export let size: ButtonSize = 'md'
    export let rounded: ButtonRoundness = 'md'
    export let alignment: ButtonAlignment = 'center'
    export let icon: IconSource | undefined = undefined
    export let iconSize:number = 16
    export let title: string = ''
    export let hidden:boolean = false
    export let loaderWidth: number | undefined = iconSize
    export let iconClass: string = ''
    export let inline: boolean = true
      
    export let href: string | undefined = undefined
    export let download: string | undefined = undefined
    export let newtab:boolean = false

    let downloadFilename: string | undefined
    if (download && href) {
        downloadFilename = href.split('/').pop()?.split('?')[0]
    }
</script>

{#if href }
    <a
        on:click
        {href}
        download="{(download && href) ? downloadFilename : undefined}"
        target="{newtab ? '_blank' : undefined}"
        {...$$restProps}
        title={title}
        class:hidden={hidden}
        class="
            {buttonColor[color]}
            {buttonSize[size]}
            {buttonRoundness[rounded]}
            text-sm transition-colors disabled:!opacity-70 disabled:!pointer-events-none
            disabled:!border disabled:!border-slate-300 disabled:!bg-slate-200 disabled:dark:!border-zinc-700 disabled:dark:!bg-zinc-800
            {$$props.class}
            {loading
                ? color == 'primary'
                ? '!bg-transparent !text-inherit'
                : ''
                : ''
            }
       "
    >
        <div class="flex {inline ? 'flex-row' : 'flex-col'} items-center gap-1.5 h-full {buttonAlignment[alignment]}">
            {#if loading}
                <Spinner width={loaderWidth
                    ? loaderWidth
                    : size == 'lg'
                        ? 20
                        : size == 'md'
                            ? 18
                            : size == 'sm'
                                ? 16
                                : 16
                    }
                />
            {:else if $$slots.icon}
                <slot name="icon" />
            {:else if icon}
                <Icon src={icon} width={iconSize} mini class="{iconClass}"/>
            {/if}
            <slot />
        </div>
    </a>
{:else}
    <button
        {...$$restProps}
        on:click
        class="
            {buttonColor[color]}
            {buttonSize[size]}
            {buttonRoundness[rounded]}
            text-sm transition-colors disabled:!opacity-70 disabled:!pointer-events-none
            disabled:!border disabled:!border-slate-300 disabled:!bg-slate-200
            disabled:dark:!border-zinc-700 disabled:dark:!bg-zinc-800 disabled:text-inherit
            {$$props.class}
            {loading
                ? color == 'primary'
                ? '!bg-transparent !text-inherit'
                : ''
                : ''
            }"
            type={submit ? 'submit' : 'button'}
            title={title}
            class:hidden={hidden}
    >
        <div class="flex {inline ? 'flex-row' : 'flex-col'} items-center gap-1.5 relative {buttonAlignment[alignment]}">
            {#if loading}
                <Spinner
                    width={loaderWidth
                        ? loaderWidth
                        : size == 'lg'
                        ? 20
                        : size == 'md'
                        ? 18
                        : size == 'sm'
                        ? 16
                        : 16
                    }
                />
            {:else if $$slots.icon}
                <slot name="icon" />
            {:else if icon}
                <Icon src={icon} width={iconSize} mini class="{iconClass}"/>
            {/if}
            <slot />
        </div>
    </button>
{/if}
