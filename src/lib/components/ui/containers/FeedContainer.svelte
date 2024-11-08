<script lang="ts">
    import { userSettings} from '$lib/settings'
</script>

<div class="w-full flex flex-col gap-5 h-full ml-auto mr-auto mt-2 {$userSettings.uiState.feedMargins ? 'sm:w-full md:w-[85%] lg:w-[90%] xl:w-[75%]' : ''} {$$props.class}">
    <slot/>
</div>