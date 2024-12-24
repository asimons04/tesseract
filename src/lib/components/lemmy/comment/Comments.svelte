<script lang="ts">
    import type { 
        CommentView, 
        CommunityView, 
        CommunityModeratorView, 
        Post 
    } from 'lemmy-js-client'

    import Button from '$lib/components/input/Button.svelte'
    import Comment from './Comment.svelte'
    
    import { amMod } from '../moderation/moderation'
    import { buildCommentsTree, type CommentNodeI } from './comments'
    import { fly } from 'svelte/transition'
    import { getClient } from '$lib/lemmy.js'
    import { isNewAccount } from '../post/helpers'
    import { onMount, setContext } from 'svelte'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings'
    import { userIsInstanceBlocked } from '$lib/lemmy/user';

    import { ChevronDown, Icon } from 'svelte-hero-icons'
    

    export let nodes: CommentNodeI[]
    export let isParent: boolean = true
    export let post: Post
    export let moderators: Array<CommunityModeratorView>


    if (isParent) {
        setContext('comments:tree', nodes)
    }
    
    let loadingChildren = false

    async function fetchChildren(parent: CommentNodeI) {
        if ( !(parent.comment_view.counts.child_count > 0 && parent.children.length == 0) ) return

        try {
            parent.loading = true
            const newComments = await getClient($page.params.instance).getComments({
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

    /**
    {
        isParent
            ? 'divide-y dark:divide-zinc-800 divide-slate-200'
            : 'pl-2 border-l-2 border-slate-200 dark:border-zinc-800 my-1'
    }
    */
     
</script>

<div class="flex flex-col gap-2 {isParent ? '' : 'pl-1 pt-1'}" in:fly={{ opacity: 0, y: -4 }} >
    {#each nodes as node, idx (node.comment_view.comment.id)}
        <!--- Comment filtering  --->
        {#if    !(
                    // Optionally hide comments from new accounts (and any replies)
                    ($userSettings.hidePosts.newAccounts &&  isNewAccount(node.comment_view.creator.published) && node.comment_view.creator.id != $profile?.user?.local_user_view?.person?.id) ||
                    
                    // Hide posts from users whose instances you have blocked
                    ($userSettings.hidePosts.hideUsersFromBlockedInstances && userIsInstanceBlocked($profile?.user, node.comment_view.creator.instance_id))
                    
                    // Safety check so moderators will still see the comments as well as admins if the community is local to the instance
                    && !amMod($profile?.user, node.comment_view.community)
                )
        }
            <Comment postId={post.id} bind:node >
                {#if node.children?.length > 0}
                    <svelte:self {post} bind:nodes={node.children} moderators={moderators} isParent={false} />
                {/if}

                {#if node.comment_view.counts.child_count > 0 && node.children.length == 0}
                    <div class="my-2 w-max h-8 border-l-2 border-slate-200 dark:border-zinc-900 pl-2">
                        <Button
                            loading={node.loading}
                            disabled={node.loading}
                            size="sm"
                            color="tertiary"
                            icon={ChevronDown}
                            iconSize={16}
                            on:click={() => {
                                node.loading = true
                                fetchChildren(node).then(() => (node.loading = false))
                            }}
                        >
                            {node.comment_view.counts.child_count} more
                        </Button>
                    </div>
                {/if}
            </Comment>
        {/if}

    {/each}
</div>
