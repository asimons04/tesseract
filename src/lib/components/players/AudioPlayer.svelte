<script lang="ts">
    import { userSettings } from '$lib/settings'

    import Button           from '$lib/components/input/Button.svelte'
    import ImageContainer   from '$lib/components/lemmy/post/components/ImageContainer.svelte'
    import Slider           from '$lib/components/input/Slider.svelte'
    import ZoomableImage    from '$lib/components/ui/ZoomableImage.svelte'

    import { 
        ArrowPathRoundedSquare, 
        Clock, 
        CloudArrowDown, 
        Pause, 
        Play, 
        SpeakerWave, 
        SpeakerXMark 
    } from 'svelte-hero-icons';

    export let url: string
    export let thumbnail_url: string | undefined = undefined
    export let autoplay: boolean        = false
    export let inViewport: boolean      = true
    export let alt_text: string         = ''

    let placeholderIcon                 = '/img/audio-wave-static.webp'
    let audio: HTMLAudioElement

    $:  if (!inViewport && audio) audio.pause()
    

    const player = {
        currentTime: 0,
        duration: 0,
        loaded: false,
        paused: true,

        get loop() {
            return audio.loop
        },

        set loop(val:boolean) {
            audio.loop = val
            $userSettings.embeddedMedia.loop = val
        },

        get muted() {
            return audio.muted
        },

        set muted(val:boolean) {
            audio.muted = val
        },

        get playbackRate() {
            return audio.playbackRate
        },

        set playbackRate(val:number) {
            audio.playbackRate = val
        },

        get volume() {
            return audio.volume
        },

        set volume(val:number) {
            audio.volume = val
            $userSettings.embeddedMedia.volume = val
        },

        pause: function() {
            audio.pause()
        },

        play: function() {
            audio.play()
        },

        adjustPosition: function (e:CustomEvent) {
            audio.currentTime = e.detail
        },


        onLoadStart: function (e:Event) {
            audio.volume = $userSettings.embeddedMedia.volume
            audio.loop = $userSettings.embeddedMedia.loop
            
            player.currentTime = audio.currentTime
            player.duration = audio.duration
            player.loaded = true
            player.loop = audio.loop

        },
    
        onTimeUpdate: function (e:Event) {
            player.currentTime = audio.currentTime
       },

        toDuration: function (input_seconds:number) {
            let hours: number | string      = Math.floor(input_seconds / 3600)
            let minutes: number | string    = Math.floor( (input_seconds - (hours * 3600)) /60 )
            let seconds: number | string    = Math.round(input_seconds - (hours * 3600) - (minutes * 60))

            if (hours < 10)     hours = '0' + hours
            if (minutes < 10)   minutes = '0' + minutes
            if (seconds < 10)   seconds = '0' + seconds

            if (parseInt(hours as string)  < 1) return `${minutes}:${seconds}`
            else return `${hours}:${minutes}:${seconds}`
        }
    }


</script>

<ImageContainer image_url={placeholderIcon} blur={false} class="blur-sm !opacity-20 invert dark:invert-0">
    
    <div class="flex flex-col relative z-10 min-h-[200px] w-full">
        <audio bind:this={audio} class="rounded-2xl my-auto mx-auto" preload="metadata" aria-label={alt_text}
            playsinline  {autoplay} 
            on:loadedmetadata={player.onLoadStart}
            on:timeupdate={player.onTimeUpdate}
            on:play={() => {
                player.paused = false 
                placeholderIcon = '/img/audio-wave.gif'
            }}
            on:pause={() => {
                player.paused = true 
                placeholderIcon = '/img/audio-wave-static.webp'
            }}

        >
            <source src={url} />
        </audio>

        <!---Custom Player Skin--->
        {#if player.loaded}
            <div class="flex flex-col gap-1 my-auto w-full">
                
                <div class="flex flex-row gap-2 items-center px-2">
                    <ZoomableImage url={thumbnail_url ?? placeholderIcon} class="w-[96px] h-[96px] rounded-lg" alt={alt_text} />
                
                    <div class="flex flex-col gap-2 w-[calc(100%-100px)] h-[90px]">
                        {#if alt_text}
                        <span class="text-sm font-bold w-full truncate">
                            {alt_text}
                        </span>
                        {/if}
                        <!---Position Slider--->
                        <Slider bind:value={player.currentTime} min={0} max={player.duration} step={1} on:change={player.adjustPosition} />

                        <!---Start, Current, End Time Labels--->
                        <div class="flex flex-row w-full text-xs opacity-90 items-center justify-between">
                            <span>0:00</span>
                            <span>{player.toDuration(player.currentTime)}</span>
                            <span>{player.toDuration(player.duration)}</span>
                        </div>
                    </div>

                </div>
                    
                <!---Control Buttons--->
                <div class="flex flex-row gap-2 w-full items-center">
                    <Button title={player.paused ? 'Play' : 'Pause'} size="square-md" color="secondary" class="rounded-full h-[64px] w-[64px]" icon={player.paused ? Play: Pause} iconSize={36} on:click={() => player.paused ? player.play() : player.pause()} />
                    <Button title={player.loop ? 'Disable Loop' : 'Enable Loop'} size="square-md" color="secondary" class="rounded-full h-[64px] w-[64px] {player.loop ? '!text-amber-500' : ''}" icon={ArrowPathRoundedSquare} iconSize={36} on:click={() => player.loop = !player.loop} />
                    <!---<Button title="Download" size="square-md" color="secondary" class="rounded-full h-[64px] w-[64px]" href={url} download={url} newtab={true} icon={CloudArrowDown} iconSize={36} />--->
                    
                    <!---Playback Speed Slider--->
                    <div class="flex flex-col gap-1 w-[96px] h-[64px]">
                        <Slider bind:value={player.playbackRate} min={0.25} max={3} step={0.25} />
                        <Button size="sm" color="secondary"title="Reset Playback Speed" class="h-[42px] w-full mt-auto mx-auto" icon={Clock} iconSize={24} on:click={()=> player.playbackRate = 1}>
                            {player.playbackRate}x
                        </Button>
                    </div>


                    <span class="ml-auto"/>
                    <!---Volume Slider/Mute--->                        
                    <div class="flex flex-col gap-1">
                        <Slider bind:value={player.volume} min={0} max={1} step={0.1} vertical class="!h-[64px] mx-auto"/>
                        <Button size="square-sm" color="secondary" class="h-[32px] w-[32px] mx-auto" icon={player.muted ? SpeakerXMark: SpeakerWave} iconSize={24} on:click={()=> player.muted = !player.muted} />
                    </div>
                </div>
                    
            </div>
        {/if}


    </div>
</ImageContainer>