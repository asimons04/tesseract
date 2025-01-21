<script lang="ts">
    import { userSettings } from '$lib/settings'

    import ImageContainer from '$lib/components/lemmy/post/components/ImageContainer.svelte'
    import { ArrowPathRoundedSquare, Pause, Play, SpeakerWave, SpeakerXMark } from 'svelte-hero-icons';
    import Button from '../input/Button.svelte';
    import ZoomableImage from '../ui/ZoomableImage.svelte';


    let placeholderIcon                 = '/img/audio-wave-static.webp'
    let audio: HTMLAudioElement
    let positionSlider: HTMLInputElement
    let volumeSlider: HTMLInputElement

    export let url: string
    export let thumbnail_url: string | undefined
    export let autoplay: boolean        = false
    export let inViewport: boolean      = false

    $:  if (!inViewport && audio) audio.pause()
    

    const player = {
        currentTime: 0,
        duration: 0,
        playbackRate: 1,
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

        adjustPosition: function (e:Event) {
            audio.currentTime =  parseInt(positionSlider.value)
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
        <audio bind:this={audio} class="rounded-2xl my-auto mx-auto" preload="metadata"
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
                
                <div class="flex flex-col gap-2 w-full p-2">
                    <!---Position Slider--->
                    <input bind:this={positionSlider} type="range" bind:value={player.currentTime} min={0} max={player.duration} on:change={player.adjustPosition}
                        class="w-full h-2 bg-gray-400 dark:bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <!---Start, Current, End Time Labels--->
                    <div class="flex flex-row w-full text-xs opacity-90 items-center justify-between">
                        <span>0:00</span>
                        <span>{player.toDuration(player.currentTime)}</span>
                        <span>{player.toDuration(player.duration)}</span>
                    </div>
                </div>


                <div class="flex flex-row gap-2 items-center p-2">
                    <ZoomableImage url={thumbnail_url ?? placeholderIcon} class="w-[96px] h-[96px]" alt='' />
                    
                    <div class="flex flex-col gap-4 w-[calc(100%-100px)]">
                        <!---Button Controls--->
                        <div class="flex flex-col md:flex-row gap-2 items-center">
                            
                            <!---Control Buttons--->
                            <div class="flex flex-row gap-2 w-full items-center">
                                <Button size="square-md" color="secondary" class="h-[64px] w-[64px]" icon={player.paused ? Play: Pause} iconSize={36} on:click={() => player.paused ? player.play() : player.pause()} />
                                <Button size="square-md" color="secondary" class="h-[64px] w-[64px] {player.loop ? '!text-amber-500' : ''}" icon={ArrowPathRoundedSquare} iconSize={36} on:click={() => player.loop = !player.loop} />
                                
                                <span class="ml-auto"/>
                                
                                <div class="flex flex-col gap-1">
                                    <input bind:this={volumeSlider} type="range" bind:value={player.volume} min={0} max={1} step={0.1} class="h-[64px] mx-auto bg-gray-400 dark:bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" 
                                        style="writing-mode: vertical-lr; direction: rtl; width: 16px"
                                    />  
                                    <Button size="square-sm" color="secondary" class="h-[32px] w-[32px] mx-auto" icon={player.muted ? SpeakerXMark: SpeakerWave} iconSize={24} on:click={()=> player.muted = !player.muted} />
                                </div>
                            </div>
                            
                         </div>
                        
                    </div>
                </div>
            </div>
        {/if}


    </div>
</ImageContainer>