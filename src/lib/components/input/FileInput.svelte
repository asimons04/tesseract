<script lang="ts">
  import { CheckCircle, DocumentPlus, Icon } from 'svelte-hero-icons'

  export let accept = 'image/*,video/*'
  export let multiple = false
  export let files: FileList | null | undefined = null
  export let image = false
  export let label: string | undefined = undefined
  export let previewURL : string | undefined | null= ''
  export let preview:boolean = true;

  let dragover = false
  let fileType:string = 'image'

  $: if (files) {
    previewURL = URL.createObjectURL(files[0])
    fileType = files[0].type?.split('/')[0]
  }

  
  function onDrop(event:any) {
    files = event.dataTransfer?.files
  }

  function onDragover(event:any) {
    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy'
        dragover = true
    }
}
</script>

<div class={$$props.class}>
    {#if label}
        <span class="block my-1 text-sm font-bold">{label}</span>
    {/if}
    <label
        class="flex flex-col items-center px-8 py-8 mx-auto w-full rounded-lg
            border border-slate-300 dark:border-zinc-700 bg-white dark:bg-black
            cursor-pointer min-h-36 transition-colors 
            {
                dragover
                ? 'border-sky-500 text-sky-500'
                : ''
            }
        "
        on:drop|preventDefault={onDrop}
        on:dragover|preventDefault={onDragover}
        on:dragleave|preventDefault={() => (dragover = false)}
    >
        {#if (image && files) || preview && previewURL}

            {#if preview}
                {#if fileType == 'image'}
                    <img src={previewURL} class="w-full max-w-sm h-full rounded-lg" alt="Upload preview"
                        on:load={() => {
                            if (previewURL) URL.revokeObjectURL(previewURL)
                        }}
                        
                    />
                {/if}

                {#if fileType == 'video'}
                    <!-- svelte-ignore a11y-media-has-caption -->
                    <video preload="metadata"  src={previewURL} class="w-full max-w-sm h-full rounded-lg"
                        on:load={() => {
                            if (previewURL) URL.revokeObjectURL(previewURL)
                        }}
                    />
                {/if}
            {:else}
                <Icon src={CheckCircle} class="opacity-50" size="36" />
                <p class="text-sm opacity-50">File attached!</p>
            {/if}
        {:else}
            <Icon src={DocumentPlus} class="opacity-50" size="36" />
            <p class="text-sm opacity-50">Attach a file</p>
        {/if}

        <input type="file" bind:files {accept} class="hidden" {multiple} />
    </label>
</div>
