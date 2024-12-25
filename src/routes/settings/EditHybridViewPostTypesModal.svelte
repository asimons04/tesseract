<script lang="ts">
    import type { PostType } from '$lib/components/lemmy/post/helpers'
    
    import { userSettings } from '$lib/settings'
    
    import Modal from "$lib/components/ui/modal/Modal.svelte"
    import SettingToggle from '$lib/components/ui/settings/SettingToggle.svelte'
    import SettingToggleContainer from '$lib/components/ui/settings/SettingToggleContainer.svelte'
    

    import { 
        EyeSlash,
        Film,
        Photo,
        SpeakerWave,
        VideoCamera,
        Window as WindowIcon, 
        Wrench
    } from 'svelte-hero-icons'

    export let open = false

    let showAdvanced = false

    // Audio, link, and text are not applicable for expansion and are omitted
    let pTypes = {
        image:          $userSettings.uiState.hybridViewAsCardTypes.includes('image'),
        video:          $userSettings.uiState.hybridViewAsCardTypes.includes('video'),
        loops:          $userSettings.uiState.hybridViewAsCardTypes.includes('loops'),
        dailymotion:    $userSettings.uiState.hybridViewAsCardTypes.includes('dailymotion'),
        youtube:        $userSettings.uiState.hybridViewAsCardTypes.includes('youtube'),
        spotify:        $userSettings.uiState.hybridViewAsCardTypes.includes('spotify'),
        bandcamp:       $userSettings.uiState.hybridViewAsCardTypes.includes('bandcamp'),
        vimeo:          $userSettings.uiState.hybridViewAsCardTypes.includes('vimeo'),
        odysee:         $userSettings.uiState.hybridViewAsCardTypes.includes('odysee'),
        peertube:       $userSettings.uiState.hybridViewAsCardTypes.includes('peertube'),
        songlink:       $userSettings.uiState.hybridViewAsCardTypes.includes('songlink'),
        soundcloud:     $userSettings.uiState.hybridViewAsCardTypes.includes('soundcloud'),
        thumbLink:      $userSettings.uiState.hybridViewAsCardTypes.includes('thumbLink'),
    }

    function updateTypes(pType:PostType, add:boolean) {
        if (add && !($userSettings.uiState.hybridViewAsCardTypes.includes(pType))) {
            $userSettings.uiState.hybridViewAsCardTypes.push(pType)
        }

        if (!add && $userSettings.uiState.hybridViewAsCardTypes.includes(pType)) {
            const idx = $userSettings.uiState.hybridViewAsCardTypes.findIndex((i) => i == pType)
            if (idx >=0) {
                $userSettings.uiState.hybridViewAsCardTypes.splice(idx, 1)
            }
        }
        userSettings.set($userSettings)
    }
    
</script>

<Modal bind:open preventCloseOnClickOut={true} icon={WindowIcon} card width="max-w-2xl"
    capitalizeTitle={true}
    title="Configure Hybrid View"
>
    <div class="p-2 font-normal text-sm my-2">
        In Hybrid view, posts default to compact mode unless configured to show as cards.  Select the post types you want to show as cards
        when using the hybrid view.
    </div>  

    <SettingToggleContainer>
        <SettingToggle bind:value={$userSettings.uiState.hybridViewKeepReadCollapsed} title="Keep Read Posts Collapsed" icon={EyeSlash} 
            description="Don't expand posts marked as read into cards."
        />
        
        <SettingToggle bind:value={pTypes.image} title="Image Posts" icon={Photo} 
            description="Posts that have an image as their URL (memes, GIFs, pictures, etc)"
            on:change={(e) => updateTypes('image', e.detail) }
        />

        <SettingToggle bind:value={pTypes.video} title="Video Posts" icon={VideoCamera} 
            description="Posts that have a direct video link as their URL."
            on:change={(e) => updateTypes('video', e.detail) }
        />

        <SettingToggle bind:value={pTypes.thumbLink} title="Link Posts with Thumbnails" icon={WindowIcon} 
            description="Posts that have a URL as well as a thumbnail image (news articles, etc)"
            on:change={(e) => updateTypes('thumbLink', e.detail) }
        />

        <SettingToggle bind:value={showAdvanced} title="Show Advanced Options" icon={Wrench} 
            description="Enable/disable dynamic card view based on embedded media type."
        >
            {#if showAdvanced}
                <div class="pl-4 flex flex-col divide-y border-slate-400/75 dark:border-zinc-400/75 gap-4 w-full">

                    <SettingToggle bind:value={pTypes.bandcamp} title="Bandcamp Posts" icon={SpeakerWave} small
                        on:change={(e) => updateTypes('bandcamp', e.detail) }
                    />

                    <SettingToggle bind:value={pTypes.dailymotion} title="DailyMotion Posts" icon={Film} small
                        on:change={(e) => updateTypes('dailymotion', e.detail) }
                    />

                    <SettingToggle bind:value={pTypes.loops} title="Loops Posts" icon={Film} small
                        on:change={(e) => updateTypes('loops', e.detail) }
                    />

                    <SettingToggle bind:value={pTypes.odysee} title="Odysee Posts" icon={Film} small
                        on:change={(e) => updateTypes('odysee', e.detail) }
                    />

                    <SettingToggle bind:value={pTypes.peertube} title="PeerTube Posts" icon={Film} small
                        on:change={(e) => updateTypes('peertube', e.detail) }
                    />

                    <SettingToggle bind:value={pTypes.songlink} title="SongLink Posts" icon={Film} small
                        on:change={(e) => updateTypes('songlink', e.detail) }
                    />

                    <SettingToggle bind:value={pTypes.soundcloud} title="SoundCloud Posts" icon={Film} small
                        on:change={(e) => updateTypes('soundcloud', e.detail) }
                    />

                    <SettingToggle bind:value={pTypes.spotify} title="Spotify Posts" icon={SpeakerWave} small
                        on:change={(e) => updateTypes('spotify', e.detail) }
                    />

                    <SettingToggle bind:value={pTypes.vimeo} title="Vimeo Posts" icon={Film} small
                        on:change={(e) => updateTypes('vimeo', e.detail) }
                    />

                    <SettingToggle bind:value={pTypes.youtube} title="YouTube-like Posts" icon={Film} small
                        on:change={(e) => updateTypes('youtube', e.detail) }
                    />
                </div>
            {/if}
        </SettingToggle>
    
        
        
    </SettingToggleContainer>

    


</Modal>