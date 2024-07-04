<script lang="ts">

  export let href: string|undefined
  export let highlight: boolean = false
  export let nowrap: boolean = false
  export let newtab: boolean = false
  export let title: string | undefined | null= undefined
  export let id: string = ""
  export let domainOnly:boolean = false;
  export let text:string | undefined = undefined


</script>
{#if href}
<a {href}
    id={id}
    class="{highlight ? 'text-sky-700 dark:text-sky-500' : ''} hover:underline max-w-full"
    target="{newtab
        ? '_blank'
        : '_self'
    }"
    title = "{title ?? href}"
>
    <slot name="icon" />
    <slot>
        <span class="flex gap-0  {nowrap ? 'w-full whitespace-nowrap overflow-hidden text-ellipsis text-xs' : ''}  {$$props.class}" >
            {text ?? (domainOnly ? new URL(href).hostname : href)}
        </span>
    </slot>
  
</a>
{/if}
