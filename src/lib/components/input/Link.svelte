<script lang="ts">

  export let href: string
  export let highlight: boolean = false
  export let nowrap: boolean = false
  export let newtab: boolean = false
  export let title: string = ""
  export let id: string = ""
  export let domainOnly:boolean = false;


</script>
{#if href}
<a {href} 
    id={id}
    class="{highlight ? 'text-blue-500' : ''} hover:underline max-w-full"
    target="{newtab
        ? '_blank'
        : '_self'
    }"
    title = "{title}"
>
    <slot name="icon" />
    <slot>
        <span class="flex gap-0 
                {nowrap
                    ? 'w-full whitespace-nowrap overflow-hidden text-ellipsis text-xs'
                    : ''
                } 
                {$$props.class}
            "
        >
            {domainOnly ? new URL(href).hostname : href}
        </span>
    </slot>
  
</a>
{/if}
