<script lang="ts">
    interface PostData {
        community?: Community
        name: string
        body?: string
        image?: FileList
        url?: string
        nsfw: boolean
        loading: boolean
        thumbnail_url?: string,
        embed_description?: string,
        embed_video_url?: string,
        embed_title?: string
    }

    import type { Community, PostView, UploadImageResponse} from 'lemmy-js-client'

    import { ENABLE_MEDIA_PROXY } from '$lib/settings'
    import { createEventDispatcher } from 'svelte'
    import { getClient } from '$lib/lemmy.js'
    import { imageProxyURL } from '$lib/image-proxy'
    import { isImage, isVideo } from './helpers'
    import { objectCopy } from '$lib/util'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings'
    import { validateURL } from '$lib/blacklists'

    

    import Button from '$lib/components/input/Button.svelte'
    import CommunityAutocomplete from '../CommunityAutocomplete.svelte';
    import CommunityLink from '../community/CommunityLink.svelte'
    import ImageUploadDeleteButton from '$lib/components/uploads/ImageUploadDeleteButton.svelte'
    import ImageUploadModal from '$lib/components/lemmy/modal/ImageUploadModal.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import PostPreview from './Post.svelte'
    import SettingToggle from '$lib/components/ui/settings/SettingToggle.svelte'
    import SettingToggleContainer from '$lib/components/ui/settings/SettingToggleContainer.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    
    import { 
        ArrowUturnDown,
        CheckCircle,
        Cloud,
        CloudArrowDown,
        ExclamationCircle,
        Eye,
        Icon, 
        PencilSquare,
        Photo,
        QueueList,
        Window,
        XCircle
    } from 'svelte-hero-icons'
    
    // The post to edit, as passed from the PostActions component
    export let editingPost: PostView | undefined = undefined

    // The community passed from sessionStorage via /create/post
    export let community: Community | undefined = undefined
    export let crosspostData: PostData | undefined = undefined
    export let hideCommunityInput = false
    export let textEditorRows:number = 10

    let default_data: PostData = crosspostData ?? {
        community: editingPost?.community ?? community,
        image: undefined,
        name: editingPost?.post.name ?? '',
        body: editingPost?.post.body,
        url: editingPost?.post.url,
        nsfw: editingPost?.post.nsfw ?? false,
        loading: false,
        embed_description: editingPost?.post.embed_description,
        embed_video_url: editingPost?.post.embed_video_url,
        embed_title: editingPost?.post.embed_title
    }

    let data = objectCopy(default_data)
    
    let uploadingImage   = false
    let uploadResponse: UploadImageResponse | undefined
    let useImageProxyForPost:boolean = false
    let bodyImages:UploadImageResponse[]
    
    let deleteImage: () => Promise<void>

    
    let previewing       = false
    let fetchingMetadata = false
    let previewPost: PostView | undefined


    let compactPosts = false
    let displayType = 'post' as 'post' | 'feed'

    const dispatcher = createEventDispatcher<{ submit: PostView }>()

    // If community is provided, set the data object's community key to that
    $: if (community) data.community = community
    
    // Automatically convert the uploaded image's URL to a proxy URL if the option is selected
    $: if (useImageProxyForPost && uploadResponse?.url)     data.url = imageProxyURL(uploadResponse.url)
    $: if (!useImageProxyForPost && uploadResponse?.url)    data.url = uploadResponse.url

    async function submit() {
        if (!data.name || !$profile?.jwt) return
        
        // Validate the post URL if supplied
        if (data.url) {
            let { allowed, reason } = validateURL(data.url)
            
            if (!allowed) {
                toast({
                    content: reason,
                    type: 'error',
                    title: 'Invalid URL',
                    duration: 15 *1000
                })
                return
            }
        }

        data.loading = true

        try {
            if (editingPost) {
                const post = await getClient().editPost({
                    name: data.name,
                    body: data.body,
                    url: data.url || undefined,
                    post_id: editingPost.post.id,
                    nsfw: data.nsfw,
                })

                if (!post) throw new Error('Failed to edit post')
                dispatcher('submit', post.post_view)
                
            } 
            else {
                const post = await getClient().createPost({
                    community_id: data.community!.id,
                    name: data.name,
                    body: data.body,
                    url: data.url || undefined,
                    nsfw: data.nsfw,
                })

                if (!post) throw new Error('Failed to create post')

                dispatcher('submit', post.post_view)
            }
        } catch (err) {
            toast({ title: 'Error', content: err as any, type: 'error' })
            data.loading = false
        }
    }

    async function getWebsiteMetadata() {
        if (!$profile?.jwt) return
        if (!data.url) return
        
        let { allowed, reason } = validateURL(data.url)
            
        if (!allowed) {
            toast({
                content: reason,
                type: 'error',
                title: 'Invalid URL',
                duration: 15000
            })
            data.url = ''
            fetchingMetadata = false
            return
        }

        fetchingMetadata = true    
        
        try {        
            const metadata = await getClient().getSiteMetadata({
                url: data.url
            })

            if (metadata?.metadata) {
                if (metadata.metadata.title && data.name == '') data.name = metadata.metadata.title
                
                if (metadata.metadata.description)      data.embed_description = metadata.metadata.description
                if (metadata.metadata.image)            data.thumbnail_url = metadata.metadata.image
                if (metadata.metadata.image)            data.thumbnail_url = metadata.metadata.image
                if (metadata.metadata.embed_video_url)  data.embed_video_url = metadata.metadata.embed_video_url
            }
        }
        catch (err) {
            toast({
                type: 'warning',
                title: 'No Metadata',
                content: 'Unable to fetch metadata for the given URL'
            })
        }
        finally {
            fetchingMetadata = false
        }
    }

    // Creates a second PostView object based on either the current form data or the post data passed from the edit event.  
    // Used to generate a fully-stocked PostView object to pass to the Post component in order to get a fully-rendered preview.
    async function generatePostPreview() {
        if (!$profile?.user) return

        // Validate URL
        if (data.url) {
            let { allowed, reason } = validateURL(data.url)
            
            if (!allowed) {
                toast({
                    content: reason,
                    type: 'error',
                    title: 'Invalid URL',
                    duration: 15000
                })
                data.url = ''
                return
            }
        }
        
        // Grab site metadata to use in the preview
        if (!previewing && data.url && !isImage(data.url) && !isVideo(data.url)) {
            await getWebsiteMetadata()
        }
        

        if (!data.name) {
            toast({
                content: 'No post title was provided, and metadata fetch failed to populate it. Please provide a title for the post',
                type: 'error',
                title: 'No Title',
            })
            return
        }
            
        // If editing a post and the post details were passed, add them to the preview
        if (editingPost) {
            
            let newPost: PostView = objectCopy(editingPost)

            // Override the editable values with those from the form
            newPost.post.body = data.body;
            newPost.post.url = data.url;
            newPost.post.name = data.name;
            newPost.post.nsfw = data.nsfw;
            
            // Unset these for the prevew generation step (if present from the original post)
            newPost.post.embed_description = undefined
            newPost.post.embed_title = undefined
            newPost.post.embed_video_url = data.embed_video_url ?? undefined
            newPost.post.thumbnail_url = data.thumbnail_url ?? undefined

            return newPost
        }
        
        // If creating a post, add some dummy values so the Post component can handle it for preview rending
        else {
            let newPost:PostView = {
                post: { 
                    ...data,
                    id: -1,
                    creator_id: $profile.user?.local_user_view.person.id,
                    community_id: data.community!.id,
                    thumbnail_url: data.thumbnail_url,
                    nsfw: data.nsfw,
                    removed: false,
                    locked: false,
                    deleted: false,
                    ap_id: 'none',
                    local: false,
                    featured_local: false,
                    featured_community: false,
                    language_id: -1,
                    published: new Date().toISOString()
                },
                creator: objectCopy($profile.user?.local_user_view.person),

                community:  {...data.community},
                // @ts-ignore
                counts: {
                    upvotes: 1,
                    downvotes: 0
                },
                saved: false,
                featured: false,
                deleted: false,
                read: false,
                locked: false,
                removed: false
            }
            
            return newPost
            
        } 
    }


</script>


<ImageUploadModal bind:open={uploadingImage} useAltText={false} on:upload={(e) => {
        uploadResponse = e.detail
        if (uploadResponse?.url) data.url = uploadResponse.url
        uploadingImage = false
    }}
/>

<form on:submit|preventDefault={submit} class="flex flex-col gap-4 h-full pb-6">
    
    <div class="flex flex-row justify-between">
        <!--- Edit / Preview Toggle --->
        <Button  loading={fetchingMetadata} disabled={(!data || !data.community)} color="tertiary-border" title="{previewing ? 'Edit' : 'Preview'}"
            on:click={ async () => {
                previewPost = await generatePostPreview()
                if (previewPost) previewing = !previewing;
            }}
        >
            <Icon src={previewing ? PencilSquare : Eye} mini size="16"/>                
            {previewing ? 'Edit' : 'Preview'}
        </Button>

        <!---Card/Compact Switch--->
        <Button title="Switch to {compactPosts ? 'card view' : 'compact view'}" disabled={!previewing} color="tertiary-border"
            on:click={async () => {
                compactPosts = !compactPosts
                if (compactPosts) displayType='feed'
                else displayType='post'
            }}
        >
            <Icon src={compactPosts ? Window : QueueList} width={16} />
        </Button>

         <!--- Reset Form --->
         <Button  loading={fetchingMetadata} disabled={previewing} color="tertiary-border" title="{editingPost ? 'Undo' : 'Reset'}"
            on:click={ () => {
                if (uploadResponse) deleteImage()
                data = objectCopy(default_data)
                data = data
            }}
        >
            <Icon src={ArrowUturnDown} mini size="16"/>                
        </Button>
        
        <!--- Submit/Save--->
        <Button submit color="tertiary-border" loading={data.loading} size="lg" title="{editingPost ? 'Save' : 'Create' }" disabled={!data || data.loading || !data.name || !data.community} >
            <Icon src={CheckCircle} mini size="16"/>
            {editingPost ? 'Save' : 'Create' }
        </Button>
    </div>

    

    <!--- Show Form Fields if not Previewing--->
    {#if !previewing}
        
        <!--- Hide Community Selection Field if Editing Existing Post--->
        <div class="flex flex-col gap-4" class:hidden={editingPost}>
            
            <!---If community is not set, display autocomplete input to select one--->
            {#if !data.community}

                <CommunityAutocomplete label="Community" containerClass="!w-full" placeholder="Community" listing_type="All"
                    on:select={(e) => {
                        data.community = e.detail
                    }}
                />
            
            <!---If community is set, show a community link object and button to unselect it--->
            {:else if !hideCommunityInput}
                <div class="flex flex-row items-center justify-between">
                    <CommunityLink avatar={true} community={data.community} />
                    
                    <Button size="md" color="tertiary" on:click={()=> data.community=undefined}>
                        <Icon src={XCircle} mini size="20"/>
                    </Button>
                </div>
            {/if}
        </div>
        

        <!--- Post Title--->
        <TextInput required label="Title" bind:value={data.name} />
        
        <!--- Post URL and URl-related buttons--->
        <div class="flex gap-2 w-full items-end">
            <TextInput label="URL" bind:value={data.url} class="w-full" readonly={uploadResponse ? true : false} />
                       
            <!---Fetch metadata from URL to populate title and append description to body--->
            <Button color="tertiary-border" size="square-form" 
                icon={CloudArrowDown} iconSize={18}
                loading={fetchingMetadata} disabled={!data.url || fetchingMetadata || uploadResponse} title="Fetch title and description"
                on:click={() => (getWebsiteMetadata())}
            />
            

            <!---Upload an Image--->
            <Button color="tertiary-border" size="square-form" icon={Photo} iconSize={18}
                loading={uploadingImage} disabled={uploadingImage|| data.url } title="Upload an image"
                on:click={() => (uploadingImage = !uploadingImage)}
            />

            <!---Image Upload Delete Button--->
            <ImageUploadDeleteButton bind:uploadResponse bind:deleteImage iconSize={18} on:delete={(e) => {
                    if (e.detail) data.url = '' 
                }}
            />
        </div>

        <!--- Post Body --->
        <MarkdownEditor rows={textEditorRows} label="Body" resizeable={false} bind:value={data.body} bind:previewing={previewing} bind:imageUploads={bodyImages}/>
        
        <!---Options--->
        <SettingToggleContainer>
            <SettingToggle bind:value={data.nsfw} icon={ExclamationCircle} title="NSFW" description="Flag post as not-safe-for-work" />
            
            {#if ENABLE_MEDIA_PROXY}
                <SettingToggle bind:value={useImageProxyForPost} icon={Cloud} title="Use Image Proxy" description="Use the Tesseract image proxy URL for the post URL. Will reduce load on your home server." />
            {/if}
        </SettingToggleContainer>


        

    <!---Previewing Post--->
    {:else if previewPost}
        <div class="pb-3">
            <PostPreview  post={previewPost}  actions={false}  bind:displayType={displayType} bind:forceCompact={compactPosts} autoplay={false}  />
        </div>
    {/if}
    
</form>
