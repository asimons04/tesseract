<script lang="ts">
    interface PostData {
        alt_text?: string
        community?: Community
        name: string
        body?: string
        image?: FileList
        url?: string
        nsfw: boolean
        loading: boolean
        thumbnail_url?: string,
        custom_thumbnail?: string
        embed_description?: string,
        embed_video_url?: string,
        embed_title?: string
    }

    interface PostImages {
        post: {
            uploading: boolean
            uploadResponse: UploadImageResponse | undefined
            image: FileList | null
            delete?: () => Promise<void>
        }
        custom_thumbnail: {
            uploading: boolean
            uploadResponse: UploadImageResponse | undefined
            image: FileList | null
            delete?: () => Promise<void>
        }
        body: UploadImageResponse[]
    }

    import type { Community, PostView, UploadImageResponse} from 'lemmy-js-client'

    import { createEventDispatcher } from 'svelte'
    import { blobToFileList, deleteImageUpload, readImageFromClipboard } from '$lib/components/uploads/helpers'
    import { dispatchWindowEvent } from '$lib/ui/events'
    import { getClient, minAPIVersion } from '$lib/lemmy.js'
    import { createFakePostView, isImage, isVideo } from './helpers'
    import { objectCopy } from '$lib/util'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings'
    import { validateURL } from '$lib/blacklists'

    

    import Button                   from '$lib/components/input/Button.svelte'
    import Card                     from '$lib/components/ui/Card.svelte'
    import CommunityAutocomplete    from '$lib/components/lemmy/CommunityAutocomplete.svelte'
    import CommunityLink            from '$lib/components/lemmy/community/CommunityLink.svelte'
    import CrosspostItem            from '$lib/components/lemmy/post/components/CrosspostItem.svelte'
    import ImageUploadDeleteButton  from '$lib/components/uploads/ImageUploadDeleteButton.svelte'
    import ImageUploadModal         from '$lib/components/lemmy/modal/ImageUploadModal.svelte'
    import MarkdownEditor           from '$lib/components/markdown/MarkdownEditor.svelte'
    import PostPreview              from './Post.svelte'
    import SettingToggle            from '$lib/components/ui/settings/SettingToggle.svelte'
    import SettingToggleContainer   from '$lib/components/ui/settings/SettingToggleContainer.svelte'
    import Spinner                  from '$lib/components/ui/loader/Spinner.svelte';
    import TextInput                from '$lib/components/input/TextInput.svelte'
    
    import { 
        ArrowUturnDown,
        CheckCircle,
        Cloud,
        CloudArrowDown,
        ExclamationCircle,
        Eye,
        Icon, 
        MagnifyingGlass, 
        PencilSquare,
        Photo,
        QueueList,
        Window,
        XCircle
    } from 'svelte-hero-icons'
    import { beforeNavigate } from '$app/navigation';
    
    
    
    
    // The post to edit, as passed from the PostActions component
    export let editingPost: PostView | undefined = undefined

    // The community passed from sessionStorage via /create/post
    export let community: Community | undefined     = undefined
    export let crosspostData: PostData | undefined  = undefined
    export let hideCommunityInput                   = false
    export let textEditorRows: number               = 10
    export let inModal                              = false
    export let editing: boolean                     = false
    

    
    // Read in the crosspost data, the post object provided when editing, or create the empty form data for a new post
    let default_data: PostData = crosspostData ?? {
        community: editingPost?.community ?? community,
        image: undefined,
        custom_thumbnail: editingPost?.post.thumbnail_url ?? undefined,
        name: editingPost?.post.name ?? '',
        body: editingPost?.post.body,
        url: editingPost?.post.url,
        nsfw: editingPost?.post.nsfw ?? false,
        alt_text: editingPost?.post.alt_text,
        loading: false,
        embed_description: editingPost?.post.embed_description,
        embed_video_url: editingPost?.post.embed_video_url,
        embed_title: editingPost?.post.embed_title
    }

    // 
    let data = objectCopy(default_data)
   
    let pastingImage            = false
    let fetchingMetadata        = false
    let previewPost: PostView | undefined
    let resetting               = false
    let previewing:boolean      = false
    let searching               = false
    let showSearch              = false
    let URLSearchResults        = [] as PostView[]
    let oldCommunity:Community
    let submitted: boolean      = false

    export let postInProgress = (data.name || data.body || data.url || data.alt_text) ? true : false

    // Container for the post image and custom thumbnail uploads and supporting state variables
    const images: PostImages = {
        post: {
            uploading: false,
            uploadResponse: undefined,
            image: null,
        },

        custom_thumbnail: {
            uploading: false,
            uploadResponse: undefined,
            image: null,
        },

        body: [] as UploadImageResponse[]
    }

    const dispatcher = createEventDispatcher<{submit: PostView}>()

    // If community is provided, set the data object's community key to that
    $: if (community) data.community = community
    

    // Reset URL search results when the community changes
    $:  data.community, rerunSearch()

    // Set a flag a parent component can bind to to determine if there is a work-in-progress post
    $:  postInProgress = (data.name || data.body || data.url || data.alt_text) ? true : false
    

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
                    body: data.body || undefined,
                    url: data.url || undefined,
                    post_id: editingPost.post.id,
                    nsfw: data.nsfw,
                    alt_text: data.alt_text || undefined,
                    custom_thumbnail: data.custom_thumbnail || undefined
                })

                if (!post) throw new Error('Failed to edit post')
                dispatchWindowEvent('editPost', { post: post.post_view})
                dispatcher('submit', post.post_view)                
            } 
            else {
                const post = await getClient().createPost({
                    community_id: data.community!.id,
                    name: data.name,
                    body: data.body || undefined,
                    url: data.url || undefined,
                    nsfw: data.nsfw,
                    alt_text: data.alt_text || undefined,
                    custom_thumbnail: data.custom_thumbnail || undefined
                })

                if (!post) throw new Error('Failed to create post')
                submitted = true
                dispatchWindowEvent('editPost', { post: post.post_view})
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
                if (metadata.metadata.title)            data.embed_title = metadata.metadata.title
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
        
        if (!data.name) data.name = 'Untitled'
            
        // If editing a post and the post details were passed, add them to the preview
        if (editingPost) {
            
            let newPost: PostView = objectCopy(editingPost)

            // Override the editable values with those from the form
            newPost.post.body = data.body;
            newPost.post.url = data.url;
            newPost.post.name = data.name;
            newPost.post.nsfw = data.nsfw;
            newPost.post.alt_text = data.alt_text
            
            // Unset these for the prevew generation step (if present from the original post)
            newPost.post.embed_description = data.embed_description || undefined
            newPost.post.embed_title = data.embed_title || undefined
            newPost.post.embed_video_url = data.embed_video_url || undefined
            newPost.post.thumbnail_url = data.custom_thumbnail || data.thumbnail_url || undefined

            return newPost
        }
        
        // If creating a post, add some dummy values so the Post component can handle it for preview rending
        else {
            let newPost: PostView = createFakePostView()
            newPost.post = {
                ...newPost.post, 
                name: data.name,
                body: data.body,
                url: data.url,
                nsfw: data.nsfw,
                alt_text: data.alt_text,
                embed_description: data.embed_description,
                embed_title: data.embed_title,
                embed_video_url: data.embed_video_url,
                creator_id: $profile.user?.local_user_view.person.id,
                thumbnail_url: data.custom_thumbnail || data.thumbnail_url || (isImage(data.url) ? data.url : undefined),
                community_id: data.community.id,
            }
            newPost.creator = objectCopy($profile.user?.local_user_view.person)
            newPost.community = {...data.community}
            
            return newPost
        } 
    }

    // Allow the reset form function to be exported to the parent
    export const resetForm = async function() {
        
        // Reset the crosspost search
        resetSearch()
        
        if (images.post.delete) images.post.delete()
        if (images.custom_thumbnail.delete) images.custom_thumbnail.delete()
        
        for (let i=0; i < images.body.length; i++) {
            await deleteImageUpload(images.body[i])
        }
        images.body = images.body = []
        
        data = objectCopy(default_data)
        data = data
        resetting = false
    }

    function resetSearch() {
        URLSearchResults = []
        showSearch = false
    }

    function rerunSearch() {
        // Hack to not search on every change to the `data` object since Svelte triggers on the whole thing and not just the `community` key.
        if (oldCommunity == data.community) return
        oldCommunity = data.community

        URLSearchResults = []
        if (data.url) {
            searchForPostByURL(true)
        }
        else {
            showSearch = false
        }
    }

    async function searchForPostByURL(background:boolean=false) {
        if (!data.url || editing) return
        URLSearchResults = [] as PostView[]
        
        try {
            searching = true
            showSearch = !background && true

            const instance = data.community
                ? new URL(data.community.actor_id).hostname
                : undefined

            const community_name = data.community
                ? data.community.name + '@' + new URL(data.community.actor_id).hostname
                : undefined
            
            let results = await getClient(instance).search({
                q: data.url,
                type_: 'Url',
                community_name: community_name
            })

            searching = false
            
            
            URLSearchResults = URLSearchResults = results?.posts ?? []

            if (background && URLSearchResults.length > 0) showSearch = true


        }
        catch (err) {
            searching = false
        }

    }

    
    beforeNavigate((e) => {
        if (postInProgress && !submitted) {
            if (confirm('You have a post in progress. Are you sure you want to lose it?')) {
                resetForm()
            }
            else {
                e.cancel()
            }
        }
    })

   
</script>

<!---Post Image Upload--->
<ImageUploadModal bind:open={images.post.uploading} bind:image={images.post.image} useAltText={false} on:upload={(e) => {
        images.post.uploadResponse = e.detail
        if (images.post.uploadResponse?.url) data.url = images.post.uploadResponse.url
        images.post.uploading = false
    }}
/>

<!---Custom Thumbnail Upload--->
<ImageUploadModal bind:open={images.custom_thumbnail.uploading} bind:image={images.custom_thumbnail.image} useAltText={false} on:upload={(e) => {
    images.custom_thumbnail.uploadResponse = e.detail
    if (images.custom_thumbnail.uploadResponse?.url) data.custom_thumbnail = images.custom_thumbnail.uploadResponse.url
    images.custom_thumbnail.uploading = false
}}
/>

<Card class="p-2">
    <form on:submit|preventDefault={submit} class="flex flex-col gap-4 h-full {previewing ? '' : 'pb-6'}">
        
        <div class="flex flex-row justify-between">
            <!--- Edit / Preview Toggle --->
            <Button  loading={fetchingMetadata} disabled={(!data || !data.community)} color="tertiary-border" title="{previewing ? 'Edit' : 'Preview'}"
                on:click={ async () => {
                    previewPost = await generatePostPreview()
                    if (previewPost) previewing = !previewing
                }}
            >
                <Icon src={previewing ? PencilSquare : Eye} mini size="16"/>                
                {previewing ? 'Edit' : 'Preview'}
            </Button>
            
            <!--- Reset Form --->
            <Button  loading={resetting} disabled={previewing||resetting} color="tertiary-border" title="{editingPost ? 'Undo' : 'Reset'}"
                on:click={() => {
                    resetting = true
                    resetForm().then(() => resetting = false)
                }}
            >
                <Icon src={ArrowUturnDown} mini size="16"/>
                <span class="hidden md:block">
                    {editingPost ? 'Undo' : 'Reset'}
                </span>             
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
            <div class="flex flex-row gap-2 w-full items-end">
                <TextInput label="URL" bind:value={data.url} class="w-full"
                    placeholder="Upload/paste image or enter URL to share"
                    on:change={() => {
                        if (!editing) searchForPostByURL(true)
                    }}
                    on:paste={async (e) => { 
                        pastingImage = true
                        const imageBlob = await readImageFromClipboard(e.detail) 
                        if (imageBlob) {
                            images.post.image = blobToFileList(imageBlob)
                            images.post.uploading = true
                        }
                        pastingImage = false
                    }}
                />
                
                <div class="flex flex-row items-center gap-2 ml-auto items-end">
                    <!---Fetch metadata from URL to populate title and append description to body--->
                    <Button color="tertiary-border" size="square-form" 
                        icon={CloudArrowDown} iconSize={18}
                        loading={fetchingMetadata} disabled={!data.url || fetchingMetadata || images.post.uploadResponse} title="Fetch title and description"
                        on:click={() => (getWebsiteMetadata())}
                    />

                    <!---Search for any crossposts to that URL--->
                    <Button color="tertiary-border" size="square-form" 
                        icon={MagnifyingGlass} iconSize={18}
                        loading={searching} disabled={!data.url || searching || fetchingMetadata || images.post.uploadResponse} title="Search for Existing Posts"
                        on:click={() => (searchForPostByURL())}
                        hidden={editing}
                    />
                    

                    <!---Upload an Image--->
                    <Button color="tertiary-border" size="square-form" icon={Photo} iconSize={18}
                        loading={images.post.uploading||pastingImage} disabled={images.post.uploading|| data.url || pastingImage} title="Upload an image"
                        on:click={() => (images.post.uploading = !images.post.uploading)}
                    />

                    <!---Image Upload Delete Button--->
                    <ImageUploadDeleteButton bind:uploadResponse={images.post.uploadResponse} bind:deleteImage={images.post.delete} iconSize={18} on:delete={(e) => {
                            if (e.detail) data.url = default_data.url ?? '' 
                        }}
                    />
                </div>
            </div>

            <!---Alt Text--->
            {#if minAPIVersion("0.19.4") && (isImage(data.url) || isVideo(data.url) || isImage(data.custom_thumbnail))}
                <TextInput label="Alt Text for Post Image" placeholder="Describe the post image" bind:value={data.alt_text} />
            {/if}

            <!---Custom Thumbnail URL/Upload--->
            {#if minAPIVersion("0.19.4") && data.url && !isImage(data.url)}
                <div class="flex flex-row gap-2 w-full items-end">
                    <TextInput label="Custom Thumbnail Image" bind:value={data.custom_thumbnail} class="w-full" 
                        placeholder="Upload, paste, or enter image URL"
                        on:paste={async (e) => { 
                            pastingImage = true
                            const imageBlob = await readImageFromClipboard(e.detail) 
                            if (imageBlob) {
                                images.custom_thumbnail.image = blobToFileList(imageBlob)
                                images.custom_thumbnail.uploading = true
                            }
                            pastingImage = false
                        }}
                    />

                    <!---Upload an Image--->
                    <Button color="tertiary-border" size="square-form" icon={Photo} iconSize={18}
                        loading={images.custom_thumbnail.uploading||pastingImage} disabled={images.custom_thumbnail.uploading|| data.custom_thumbnail || pastingImage} title="Upload an custom thumbnail"
                        on:click={() => (images.custom_thumbnail.uploading = !images.custom_thumbnail.uploading)}
                    />

                    <!---Custom Thumbnail Upload Delete Button--->
                    <ImageUploadDeleteButton bind:uploadResponse={images.custom_thumbnail.uploadResponse} bind:deleteImage={images.custom_thumbnail.delete} iconSize={18} on:delete={(e) => {
                            if (e.detail) data.custom_thumbnail = default_data.custom_thumbnail ?? '' 
                        }}
                    />
                </div>
            {/if}

            

            <!---Results for Existing Posts by that URL--->
            {#if showSearch}
            <div class="flex flex-col gap-2 items-start w-full p-2 border border-slate-300 dark:border-zinc-700 rounded-lg shadow-sm bg-slate-200/50 dark:bg-zinc-800/50">
                
                <div class="flex flex-row items-start w-full justify-between">
                    <span class="font-bold text-sm text-left mb-1 w-max self-start">
                        { data.community 
                            ? `Existing posts in community` 
                            : `Crossposts`
                        }
                        ({URLSearchResults.length})
                    </span>
                    
                    <Button color="primary" size="md" class="h-8"
                        icon={XCircle} iconSize={18} 
                        on:click={() => resetSearch() }
                    >
                    Clear
                </Button>

                </div>

                {#if searching}
                    <Spinner />
                {:else if URLSearchResults.length > 0}
                    <div class="divide-y divide-slate-300 dark:divide-zinc-700 flex w-full flex-col max-h-[13rem] overflow-y-scroll">
                        {#each URLSearchResults as crosspost}
                            <CrosspostItem {crosspost} showTitle showUser noClick voteButtons={false}/>
                        {/each}
                    </div>
                {:else}
                    <span class="mx-auto">No Results</span>
                {/if}
            </div>
            {/if}

            <!--- Post Body --->
            <MarkdownEditor rows={textEditorRows} label="Body" resizeable={false} bind:value={data.body} previewButton bind:imageUploads={images.body}/>
            
            <!---Options--->
            <SettingToggleContainer>
                <SettingToggle bind:value={data.nsfw} icon={ExclamationCircle} title="NSFW" description="Flag post as not-safe-for-work" />
            </SettingToggleContainer>
        
        {/if}
        
    </form>
</Card>

<!---Previewing Post--->
{#if previewPost && previewing}
    <div class="mt-4 pb-3 w-full">
        <PostPreview  post={previewPost}  actions={false}  displayType="post" previewing  {inModal} onHomeInstance={false}/>
    </div>
{/if}
