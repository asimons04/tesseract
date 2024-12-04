<script lang="ts">
    import { userSettings } from '$lib/settings'
</script>


<div class="flex flex-col-reverse xl:flex-row gap-2 max-w-full w-full h-full py-0">
    
    <div class="flex flex-col gap-0 max-w-full w-full h-full min-w-0 {$$props.class}">
        <slot/>
    </div>
    
    <div class="{$userSettings.uiState.expandCommunitySidebar ? 'block' : 'hidden'}">
        <slot name="right-panel"/>
    </div>

</div>
