<script lang="ts">
  import Spinner from '$lib/components/ui/loader/Spinner.svelte'
  import { Icon, type IconSource } from 'svelte-hero-icons'

  type ButtonColor = keyof typeof buttonColor
  type ButtonSize = keyof typeof buttonSize
  type ButtonRoundness = keyof typeof buttonRoundness
  type ButtonAlignment = keyof typeof buttonAlignment

  const buttonAlignment = {
    left: 'justify-start text-left',
    center: 'justify-center text-center',
    right: 'justify-end text-right',
  }

  export const buttonColor = {
    primary: `border border-slate-900 bg-slate-900 dark:bg-zinc-100
        dark:border-zinc-100 dark:text-black hover:text-inherit hover:dark:text-inherit text-slate-100
        hover:bg-transparent hover:dark:bg-transparent
        active:bg-black/10 active:dark:bg-white/10`,

    secondary: `border border-slate-200 dark:border-zinc-700 dark:bg-zinc-900
        hover:bg-slate-100 hover:dark:bg-zinc-800 hover:dark:border-zinc-700 dark:text-zinc-400 hover:text-inherit
        hover:dark:text-inherit border-none`,

    tertiary:
      'border border-transparent bg-transparent hover:bg-slate-100 hover:dark:bg-zinc-800 dark:text-zinc-200  border-none disabled:border-none',
    
    "tertiary-border":
      'border border-slate-200 dark:border-zinc-800 rounded-lg bg-transparent hover:bg-slate-100 hover:dark:bg-zinc-700 dark:text-zinc-200  disabled:border-none',

    "tertiary-border-bottom":
        'border-b border-slate-200 dark:border-zinc-800 bg-transparent hover:bg-slate-100 hover:dark:bg-zinc-700 dark:text-zinc-200',


    danger:
      'border border-red-500 bg-red-500 hover:text-red-500 hover:bg-transparent text-white',

    warning:
      'border border-amber-500 bg-amber-500 hover:text-amber-500 hover:bg-transparent text-black',

    ghost: `border border-slate-200 dark:border-zinc-800 bg-transparent
        hover:bg-slate-100 hover:dark:bg-zinc-800 hover:dark:border-zinc-700 dark:text-zinc-400 hover:text-inherit
        hover:dark:text-inherit`,

    elevated: `bg-slate-100 dark:bg-zinc-800 border border-slate-200
        dark:border-zinc-700 hover:bg-slate-200 hover:dark:bg-zinc-700 hover:border-slate-300
        hover:dark:border-zinc-600`,

    elevatedLow: `bg-slate-100 dark:bg-zinc-900 border border-slate-200
        dark:border-zinc-800 hover:bg-slate-200 hover:dark:bg-zinc-800 hover:border-slate-300
        hover:dark:border-zinc-700`,

    
    none: '',
  }

  const buttonSize = {
    sm: 'px-2 py-1',
    md: 'px-3 py-1.5',
    lg: 'px-4 py-2',
    'square-sm': 'w-6 h-6',
    'square-md': 'w-8 h-8',
    'square-lg': 'w-10 h-10',
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
  export let title: string = ''
  export let hidden:boolean = false
  export let loaderWidth: number | undefined = undefined

  // const dispatch = createEventDispatcher()
  export let href: string | undefined = undefined
  export let newtab:boolean = false
</script>

{#if href}
    <a
        {href}
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
        <div class="flex flex-row items-center gap-1.5 h-full {buttonAlignment[alignment]}">
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
                <Icon src={icon} size="16" mini />
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
        <div class="flex flex-row items-center gap-0.5 relative {buttonAlignment[alignment]}">
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
                <Icon src={icon} size="16" mini />
            {/if}
            <slot />
        </div>
    </button>
{/if}
