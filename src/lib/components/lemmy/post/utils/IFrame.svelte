<script lang="ts">
    export let embedURL:URL
    export let title:string             = ''
    export let containerClass: string   = ''
</script>

<style>
    .flexiframe-container {
        /*position: relative;*/
        overflow: hidden;
        padding-top: 56.25%;
    }

    .flexiframe {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        border:0;
    }
</style>

<div class="overflow-hidden  relative bg-slate-200 dark:bg-zinc-800 rounded-2xl max-w-full {containerClass}">
    <div class="ml-auto mr-auto max-w-full">
        <div class="flexiframe-container rounded-2xl max-w-screen max-h-[480px] mx-auto">
            <iframe 
                class="flexiframe p-1 rounded-2xl"
                src="{embedURL.href}" 
                allow="accelerometer; fullscreen; encrypted-media; gyroscope; picture-in-picture" 
                loading="lazy"
                allowfullscreen 
                title="Embedded Content: {title}"
            >
            </iframe>
        </div>
    </div>
        
</div>