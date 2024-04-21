<script lang="ts">
    interface PostData {
        community?: Community
        name: string
        body?: string
        image?: FileList
        url?: string
        nsfw: boolean
        loading: boolean
        thumbnail_url?: string
    }

    import type { Community, PostView } from 'lemmy-js-client'

    import { createEventDispatcher } from 'svelte'
    import { getClient, uploadImage } from '$lib/lemmy.js'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { validateURL } from '$lib/blacklists'

    

    import Button from '$lib/components/input/Button.svelte'
    import Checkbox from '$lib/components/input/Checkbox.svelte'
    import CommunityAutocomplete from '../CommunityAutocomplete.svelte';
    import CommunityLink from '../community/CommunityLink.svelte'
    import ImageUploadModal from '$lib/components/lemmy/modal/ImageUploadModal.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import PostPreview from './Post.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    
    
    
    
    import { 
        ArrowUturnDown,
        CheckCircle,
        CloudArrowDown,
        Eye,
        Icon, 
        PencilSquare,
        Photo,
        XCircle
    } from 'svelte-hero-icons'
    
    
    // The post to edit, as passed from the PostActions component
    export let editingPost: PostView | undefined = undefined

    // The community passed from sessionStorage via /create/post
    export let community: Community | undefined = undefined
    export let crosspostData: PostData | undefined = undefined
    export let hideCommunityInput = false

    let default_data: PostData = crosspostData ?? {
        community: editingPost?.community ?? community,
        image: undefined,
        name: editingPost?.post.name ?? '',
        body: editingPost?.post.body,
        url: editingPost?.post.url,
        nsfw: editingPost?.post.nsfw ?? false,
        loading: false,
    }

    let data = {...default_data}
    let uploadingImage   = false
    let previewing       = false
    let fetchingMetadata = false
    let previewPost: PostView

    const dispatcher = createEventDispatcher<{ submit: PostView }>()

    $: if (community) data.community = community

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
                    auth: $profile.jwt,
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
                let image = data.image ? await uploadImage(data.image[0]) : undefined
                data.url = image || data.url || undefined
                const post = await getClient().createPost({
                    auth: $profile.jwt,
                    community_id: data.community!.id,
                    name: data.name,
                    body: data.body,
                    url: data.url,
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
                if (metadata.metadata.title) data.name = metadata.metadata.title
                if (metadata.metadata.description) data.body = data.body 
                    ? data.body += metadata.metadata.description
                    : metadata.metadata.description
                if (metadata.metadata.image) data.thumbnail_url = metadata.metadata.image
            }
        }
        catch (err) {
            toast({
                type: 'error',
                title: 'Error',
                content: 'Unable to fetch metadata for the given URL'
            })
        }
        finally {
            fetchingMetadata = false
        }
    }

    // Creates a second PostView object based on either the current form data or the post data passed from the edit event.  
    // Used to generate a fully-stocked PostView object to pass to the Post component in order to get a fully-rendered preview.
    function generatePostPreview() {
        let post:PostView;
        
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
            }
        }
        
        
        // If editing a post and the post details were passed, add them to the preview
        if (editingPost) {
            post =  { ...editingPost }
            
            // Override the editable values with those from the form
            post.post.body = data.body;
            post.post.url = data.url;
            post.post.name = data.name;
            post.post.nsfw = data.nsfw;
            return post
        }
        
        // If creating a post, add some dummy values so the Post component can handle it for preview rending
        else {
            post = {
                post: { 
                    ...data,
                    id: -1,
                    creator_id: data.community!.id,
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
                community:  data.community!,
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
            
            return post
            
        } 
    }

</script>


<ImageUploadModal bind:open={uploadingImage} on:upload={(e) => {
        if (e.detail) data.url = e.detail
        uploadingImage = false
    }}
/>

<form on:submit|preventDefault={submit} class="flex flex-col gap-4 h-full pb-6">
    
    <div class="flex flex-row justify-between">
        <!--- Edit / Preview Toggle --->
        <Button  loading={fetchingMetadata} disabled={(!data || !data.name || !data.community)} color="tertiary-border" title="{previewing ? 'Edit' : 'Preview'}"
            on:click={ () => {
                previewPost = generatePostPreview();
                previewing = !previewing;
            }}
        >
            <Icon src={previewing ? PencilSquare : Eye} mini size="16"/>                
            {previewing ? 'Edit' : 'Preview'}
        </Button>

         <!--- Reset Form --->
         <Button  loading={fetchingMetadata} disabled={previewing} color="tertiary-border" title="{editingPost ? 'Undo' : 'Reset'}"
            on:click={ () => {
                data = {...default_data}
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
                <span class="block my-1 font-bold text-sm">
                    Community <span class="text-red-500">*</span>
                </span>

                <CommunityAutocomplete
                    containerClass="!w-full"
                    placeholder="Community"
                    listing_type="All"
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
        <TextInput required label="Title" bind:value={data.name} focus={true} />
        
        <!--- Post URL --->
        <div class="flex gap-2 w-full items-end">
            <TextInput label="URL" bind:value={data.url} class="w-full" />
            
            <!---Fetch metadata from URL to populate title and append description to body--->
            <Button size="square-md" style="width: 46px !important; height: 42px; padding: 0;" loading={fetchingMetadata} disabled={!data.url || fetchingMetadata} title="Fetch title and description"
                on:click={() => (getWebsiteMetadata())}
            >
            <Icon src={CloudArrowDown} size="18" mini slot="icon" />
            </Button>

            <!---Upload an Image--->
            <Button size="square-md" style="width: 46px !important; height: 42px; padding: 0;" loading={uploadingImage} disabled={uploadingImage} title="Upload an image"
                on:click={() => (uploadingImage = !uploadingImage)}
            >
                <Icon src={Photo} size="18" mini slot="icon" />
            </Button>
        </div>

        <!--- NSFW Flag --->
        <Checkbox bind:checked={data.nsfw}>NSFW</Checkbox>

        <!--- Post Body --->
        <MarkdownEditor rows={10} label="Body" resizeable={false} bind:value={data.body} bind:previewing={previewing} />

    <!--- Previewing Post--->
    {:else}
        <div class="pb-3">
            <PostPreview  bind:post={previewPost}  actions={false}  displayType='post' autoplay={false}  />
        </div>
    {/if}
</form>
