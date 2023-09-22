<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount } from 'svelte'
    import { getClient, uploadImage } from '$lib/lemmy.js'
    import type { Community, CommunityView, Post, PostView } from 'lemmy-js-client'

    import TextInput from '$lib/components/input/TextInput.svelte'
    import TextArea from '$lib/components/input/TextArea.svelte'
    import FileInput from '$lib/components/input/FileInput.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'

    import Button from '$lib/components/input/Button.svelte'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import SearchInput from '$lib/components/input/SearchInput.svelte'
    import { 
        Check,
        CheckCircle,
        Eye,
        FolderOpen,
        Icon, 
        PencilSquare,
        Photo,
        XCircle
    } from 'svelte-hero-icons'
    import { profile } from '$lib/auth.js'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import Checkbox from '$lib/components/input/Checkbox.svelte'
    import { getSessionStorage, setSessionStorage } from '$lib/session.js'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import ObjectAutocomplete from '$lib/components/lemmy/ObjectAutocomplete.svelte'
    import PostPreview from './Post.svelte'
    
    export let edit = false

    // The post to edit, as passed from the PostActions component
    export let editingPost: Post | undefined = undefined

    // The community passed from sessionStorage via /create/post
    export let passedCommunity:
    | {
        id: number
        name: string
        }
    | undefined = undefined



    // Structure to hold the minimum Post fields needed to create a new post.
    export let data: {
        community: number | Community | null
        name: string
        body: string
        image: FileList | null
        url: string | undefined
        nsfw: boolean
        loading: boolean
    } = {
        community: null,
        name: '',
        body: '',
        image: null,
        url: undefined,
        nsfw: false,
        loading: false,
    }

  let saveDraft = edit ? false : true
  let communities: Community[] = []
  
  
  let uploadingImage:boolean = false
  let previewing:boolean = false
  
  // communitySearch is used to show the community name in the community selector
  let communitySearch:string  = ''
  
  // communityDetails is used to hold the community details to pass to the post preview. The `data` struct used for creation only needs the post ID, so 
  let communityDetails:Community

  const dispatcher = createEventDispatcher<{ submit: PostView }>()

    onMount(async () => {
        if (editingPost) {
            console.log(editingPost)
            data.url = editingPost.post.url ?? ''
            data.body = editingPost.post.body ?? ''
            data.name = editingPost.post.name ?? ''
            data.nsfw = editingPost.post.nsfw ?? false
            
            data.community = editingPost.community ?? undefined
            
           
        }

        if (passedCommunity) {
            data.community = passedCommunity.id
            communitySearch = passedCommunity.name
            communityDetails = await resolveCommunity(passedCommunity.id)
        } else {
            const list = await getClient().listCommunities({
                auth: $profile?.jwt,
                type_: 'All',
                sort: 'Active',
                limit: 40,
            })
            communities = list.communities.map((c) => c.community)
        }
    })

    onDestroy(() => {
        if (saveDraft) setSessionStorage('postDraft', data)
    })

    async function submit() {
        if ((!data.community || communitySearch == '') && !edit) {
            toast({
                type: 'warning',
                content: 'You need to set a community.',
            })
            return
        }

        if (!data.name || !$profile?.jwt) return
        
        if (data.url && data.url != '') {
            try {
                new URL(data.url)
            } catch (err) {
                toast({
                    content: 'Invalid URL',
                    type: 'warning',
                })
                return
            }
        }

        data.loading = true

        try {
            if (edit) {
                if (!editingPost) {
                    throw new Error('Post is being edited but editingPost is null')
                }

                const post = await getClient().editPost({
                    auth: $profile.jwt,
                    name: data.name,
                    body: data.body,
                    url: data.url || undefined,
                    post_id: editingPost.post.id,
                    nsfw: data.nsfw,
                })

                if (!post) throw new Error('Failed to edit post')

                console.log(`Edited post ${post?.post_view.post.id}`)

                dispatcher('submit', post.post_view)
            } else {
                let image = data.image ? await uploadImage(data.image[0]) : undefined
                data.url = image || data.url || undefined
                const post = await getClient().createPost({
                    auth: $profile.jwt,
                    community_id: data.community!,
                    name: data.name,
                    body: data.body,
                    url: data.url,
                    nsfw: data.nsfw,
                })

                if (!post) throw new Error('Failed to upload post')

                console.log(`Uploaded post ${post?.post_view.post.id}`)

                saveDraft = false
                dispatcher('submit', post.post_view)
            }
        } catch (err) {
            toast({ content: err as any, type: 'error' })
            data.loading = false
        }
    }

    async function resolveCommunity(id:number) {
        const result:CommunityView = await getClient().getCommunity({
            auth: $profile?.jwt,
            id: id
        })
        if (result && result.community_view) {
            return result.community_view.community
        }
            
        
    }

    // Creates a second PostView object based on either the current form data or the post data passed from the edit event.  
    // Used to generate a fully-stocked PostView object to pass to the Post component in order to get a fully-rendered preview.
    function generatePostPreview() {
        let post:PostView;
        
        // Validate URL
        if (data.url && data.url != '') {
            try {
                new URL(data.url)
            } catch (err) {
                toast({
                    content: `Invalid URL ${data.url} has been removed.`,
                    type: 'warning',
                })
                data.url = ''
            }
        }

        // If editing a post and the post details were passed, add them to the preview
        if (editingPost) {
            post =  {
                ...editingPost,
            }
            // Override the editable values with those from the form
            post.post.body = data.body;
            post.post.url = data.url;
            post.post.name = data.name;
            post.post.nsfw = data.nsfw;
            
        }
        
        // If creating a post, add some dummy values so the Post component can handle it for preview rending
        if (!editingPost) {
            post = {
                post: { ...data },
                community:  communityDetails,
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
        } 
        return post;
    }
</script>

{#if uploadingImage}
    {#await import('$lib/components/lemmy/modal/ImageUploadModal.svelte') then { default: UploadModal }}
        <UploadModal
            bind:open={uploadingImage}
            on:upload={(e) => {
                if (e.detail) data.url = e.detail
                uploadingImage = false
            }}
        />
    {/await}
{/if}

<form on:submit|preventDefault={submit} class="flex flex-col gap-4 h-full pb-6">
    <slot name="formtitle">
        <h1 class="font-bold text-xl">
            {edit ? 'Edit' : 'Create'} Post
        </h1>
    </slot>
    
    <div class="flex flex-row justify-between">
        <!--- Edit / Preview Toggle --->
        <Button 
            disabled={(!data.name || !data.community)}
            color="primary"
            title="{previewing ? 'Edit' : 'Preview'}"
            on:click={() => {
                previewing = !previewing;
            }}
        >
            <Icon src={previewing ? PencilSquare : Eye} mini size="16"/>                
            {previewing ? 'Edit' : 'Preview'}
        </Button>
        
        <!--- Cancel Button --->
        {#if passedCommunity}
            <Button 
                color="primary"
                size="sm"
                href="/c/{passedCommunity.name}"
                title="Cancel"
            >
            <Icon src={XCircle} mini size="16"/>
            
        </Button>
        {/if}


        <!--- Restore from Draft--->
        <Button
            on:click={async () => {
                const draft = getSessionStorage('postDraft')
                if (draft && !edit) {
                    // @ts-ignore
                    draft.loading = false
                    // @ts-ignore
                    data = draft
                    communityDetails = await resolveCommunity(draft.community)
                    communitySearch = `${communityDetails.name}@${new URL(communityDetails.actor_id).hostname}`
                }
            }}
            size="sm"
            color="primary"
            disabled={!getSessionStorage('postDraft')}
            hidden={edit}
            title="Restore from draft"
        >
            <Icon src={FolderOpen} mini size="16"/>                
        </Button>
        
        <!--- Submit/Save--->
        <Button
            submit
            color="primary"
            loading={data.loading}
            size="lg"
            title="{edit ? 'Save' : 'Create' }"
            disabled={data.loading || !data.name || !data.community}
        >
            <Icon src={CheckCircle} mini size="16"/>
            {edit ? 'Save' : 'Create' }
        </Button>
    </div>

    

    <!--- Show Form Fields if not Previewing--->
    {#if !previewing}
        
        <!--- Hide Community Selection Field if Editing Existing Post--->
        <div class:hidden={edit}>
            <div class="flex flex-row">
                <span class="block my-1 font-bold text-sm">
                    Community <span class="text-red-500">*</span>
                </span>
                {#if data.community}
                    <Icon
                        src={Check}
                        mini
                        size="20"
                        class="text-green-400 ml-auto inline"
                    />
                {/if}
            </div>

            <ObjectAutocomplete
                bind:q={communitySearch}
                bind:items={communities}
                jwt={$profile?.jwt}
                listing_type="All"
                on:select={(e) => {
                    const c = e.detail
                    if (!c) {
                        data.community = null
                        return
                    }
                    data.community = c.id
                    communityDetails = c
                    communitySearch = `${c.name}@${new URL(c.actor_id).hostname}`
                }}
            />
        </div>
        

        <!--- Post Title--->
        <TextInput
            required
            label="Title"
            bind:value={data.name}
        />
        
        <!--- Post URL --->
        <div class="flex gap-2 w-full items-end">
            <TextInput
                label="URL"
                bind:value={data.url}
                class="w-full"
            />
            <Button
                size="square-md"
                on:click={() => (uploadingImage = !uploadingImage)}
                style="width: 46px !important; height: 42px; padding: 0;"
            >
                <Icon src={Photo} size="18" mini slot="icon" />
            </Button>
        </div>

        <!--- NSFW Flag --->
        <Checkbox bind:checked={data.nsfw}>NSFW</Checkbox>

        <!--- Post Body --->
        <MarkdownEditor
            rows={10}
            label="Body"
            bind:value={data.body}
            bind:previewing={previewing}
        />

    <!--- Previewing Post--->
    {:else}
        <div class="pb-3">
            <PostPreview 
                post={ generatePostPreview() } 
                actions={false} 
                displayType='post'
                autoplay={false} 
            />
        </div>
    {/if}
</form>
