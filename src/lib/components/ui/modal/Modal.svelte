<script lang="ts">
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import { createEventDispatcher } from 'svelte'
    import { Icon, XMark } from 'svelte-hero-icons'
    import { expoOut } from 'svelte/easing'
    import { fade, scale } from 'svelte/transition'

    export let action: string | undefined = undefined
    export let open = false
    export let fullHeight:boolean = false
    export let title:string = '';
    export let icon:any = undefined;

    const dispatcher = createEventDispatcher()
</script>

{#if open}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!---Div to blur background. Diabled click event that closes modal --->
    <div
        class="overflow-hidden fixed top-0 left-0 w-screen h-screen z-[99] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm box-border p-4 whitespace-normal"
        transition:fade={{ duration: 200 }}
    >
  
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div transition:scale={{ start: 0.9, easing: expoOut }}
            class="overflow-y-auto {$$props.class} rounded-xl max-w-full box-border w-full {fullHeight ? 'h-full' : ''}"
        >
            <div
                class="w-full dark:!bg-zinc-900 rounded-xl max-w-4xl box-border mx-auto {fullHeight ? 'h-full' : ''}"
                on:click={() => {}}
            >
                <div
                    on:click|stopPropagation={() => {}}
                    class="flex flex-col gap-4 p-3 rounded-xl overflow-y-auto  w-full 
                    dark:bg-zinc-900 dark:border-zinc-800
                    bg-white border border-slate-200  {fullHeight ? 'h-full' : ''}"
                    class:rounded-b-none={action}
                    class:border-b-0={action}
                >
                    <div class="flex flex-row max-w-full">
                        <h1 class="flex flex-row items-center font-bold text-xl gap-2 w-fit">
                            {#if icon} 
                                <Icon src={icon} mini width={20}/>
                            {/if}
                            {title}
                        </h1>
                        
                        
                        <Button
                            size="md"
                            class="ml-auto"
                            rounded="lg"
                            color="tertiary"
                            on:click={() => (open = false)}
                        >
                            <Icon src={XMark} mini size="16" />
                        </Button>
                    </div>
                    <slot />
                </div>
                {#if action}
                <div class="border-x border-b bg-slate-100 dark:bg-zinc-900 dark:border-zinc-800 p-3 py-2 flex justify-end rounded-b-xl">
                    <slot name="action">
                        <Button
                            on:click={(e) => dispatcher('action', e)}
                            color="primary"
                            size="lg"
                        >
                            {action}
                        </Button>
                    </slot>
                </div>
                {/if}
            </div>
        </div>
    </div>
{/if}
