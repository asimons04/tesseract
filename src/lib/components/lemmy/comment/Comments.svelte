<script lang="ts">
    import type { CommunityModeratorView, Post } from 'lemmy-js-client'

    import Button   from '$lib/components/input/Button.svelte'
    import Comment  from './Comment.svelte'
    
    import { amMod, type ModQueue }      from '../moderation/moderation'
    import { 
        buildCommentsTree, 
        getDepthFromComment, 
        type CommentNodeI 
    }                               from './comments'
    import { fly }                  from 'svelte/transition'
    import { getClient }            from '$lib/lemmy.js'
    import {instance }              from '$lib/instance'
    import { isNewAccount }         from '../post/helpers'
    import { setContext }           from 'svelte'
    import { profile }              from '$lib/auth.js'
    import { toast }                from '$lib/components/ui/toasts/toasts.js'
    import { userSettings }         from '$lib/settings'
    import { userIsInstanceBlocked } from '$lib/lemmy/user'

    import { ChevronDown } from 'svelte-hero-icons'
    import { dividerColors } from '$lib/ui/colors';
    

    export let nodes: CommentNodeI[]
    export let isParent: boolean        = true
    export let post: Post
    export let moderators: Array<CommunityModeratorView>
    export let jumpTo: number           = -1
    export let onHomeInstance: boolean  = false
    export let modQueue: ModQueue
    export let selectable = true

    if (isParent) {
        setContext('comments:tree', nodes)
    }
    
    let loadingChildren = false
    

    async function fetchChildren(parent: CommentNodeI) {
        if ( !(parent.comment_view.counts.child_count > 0 && parent.children.length == 0) ) return

        // Determine what instance to fetch the comments from (local home or that of the post's home instance)
        let postInstance = onHomeInstance
            ? $instance
            : new URL(parent.comment_view.post.ap_id).hostname

        try {
            parent.loading = true
            const newComments = await getClient(postInstance).getComments({
                max_depth: 5,
                parent_id: parent.comment_view.comment.id,
                type_: 'All',
            })

            if (newComments.comments.length == 0) {
                loadingChildren = false
                toast({
                    content: 'The API returned no comments.',
                    type: 'error',
                    title: "Error"
                })
                return
            }

            const tree = buildCommentsTree(newComments.comments, parent.depth)
                
            // 0.18.2 -> 0.18.3 broke this
            // so i'm adding this check
            const treeParent = tree.find(
                (c) => c.comment_view.comment.id == parent.comment_view.comment.id
            )

            if (treeParent) {
                // < 0.18.3
                parent.children = treeParent.children
                if (treeParent.children.length == 0) {
                    toast({
                        content: 'The API returned no comments.',
                        type: 'warning',
                    })
                }
            } else {
                // 0.18.3+
                parent.children = tree
                if (tree.length == 0) {
                    toast({
                        content: 'The API returned no comments.',
                        type: 'warning',
                    })
                }
            }
            
        } catch (error) {
            console.error(error)
            toast({
                content: `Failed to fetch comments. ${error as any}`,
                type: 'error',
            })
        }
    }
    
</script>

<div class="flex flex-col {isParent ? `gap-2 divide-y ${dividerColors}` : 'gap-0'}" in:fly={{ opacity: 0, y: -4 }} >
    {#each nodes as node, idx (node.comment_view.comment.id)}
        <Comment postId={post.id} bind:node {jumpTo} {onHomeInstance} {selectable}
            on:select={(e) => { 
                modQueue.add(e.detail)
            }}
            on:unselect={(e) => { 
                modQueue.delete(e.detail);
            }}
        >
            
            {#if node.children?.length > 0}
                <svelte:self {post} bind:nodes={node.children} bind:modQueue moderators={moderators} isParent={false}  {jumpTo} {onHomeInstance}/>
            {/if}

            {#if node.comment_view.counts.child_count > 0 && node.children.length == 0}
                <div class="my-2 w-max h-8 border-l-2 border-slate-200 dark:border-zinc-900 pl-2">
                    <Button
                        loading={node.loading}
                        disabled={node.loading}
                        size="sm"
                        color="tertiary-border"
                        icon={ChevronDown}
                        iconSize={16}
                        on:click={() => {
                            node.loading = true
                            fetchChildren(node).then(() => (node.loading = false))
                        }}
                    >
                        <span class="text-xs">
                            Load {node.comment_view.counts.child_count} more
                        </span>
                    </Button>
                </div>
            {/if}
        </Comment>

    {/each}
</div>
