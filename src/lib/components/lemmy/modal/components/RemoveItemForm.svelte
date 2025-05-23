<script lang="ts">
    interface RemoveItemContainer {
        purge: boolean
        reason: string
        loading: boolean
        replyWithReason: boolean
        replyReason: string
        privateMessage: boolean

        reset: any
        remove: any
        setReplyReason: any
    }
    import type { CommentView, PostView } from "lemmy-js-client"
    
    import { amMod, isAdmin, removalTemplate }  from "$lib/components/lemmy/moderation/moderation"
    import { createEventDispatcher }            from "svelte"
    import { dispatchWindowEvent }              from "$lib/ui/events"
    import { fullCommunityName }                from "$lib/util"
    import { getClient }                        from "$lib/lemmy"
    import { isCommentView, isPostView }        from "$lib/lemmy/item"
    import { profile }                          from "$lib/auth"
    import { toast }                            from "$lib/components/ui/toasts/toasts"
    import { userSettings }                     from "$lib/settings"

    import Button                   from "$lib/components/input/Button.svelte"
    import CommentMeta              from "$lib/components/lemmy/comment/CommentMeta.svelte"
    import MarkdownEditor           from "$lib/components/markdown/MarkdownEditor.svelte"
    import PostMeta                 from "$lib/components/lemmy/post/components/PostMeta.svelte"
    import SettingMultiSelect       from "$lib/components/ui/settings/SettingMultiSelect.svelte"
    import SettingToggle            from "$lib/components/ui/settings/SettingToggle.svelte"
    import SettingToggleContainer   from "$lib/components/ui/settings/SettingToggleContainer.svelte"
    
    import { ChatBubbleLeft, ChatBubbleLeftRight, Fire, Trash } from "svelte-hero-icons"
    
    
    export let item: PostView | CommentView         // The item to act upon
    export let removed: boolean = false             // Bound variable to give a reactive hint whether the item is already removed
    export let purged: boolean = false              // Bound variable to pass back the 'purged' state
    export let purge: boolean = false               // Parameter to determine if remove or purge the item
    export let reason: string = ''                  // Allow passing a preset reason for the remove/restore/purge action.
    
    const dispatcher = createEventDispatcher()
    
    // Reactive helper variable to determine if the item is removed.
    $:  removed = isCommentView(item)
            ? item.comment.removed
            : item.post.removed


    let remove = {
        purge: purge,
        reason: reason,
        loading: false,
        replyWithReason: false,
        replyReason: '',
        privateMessage: false,
        
        reset: function() {
            remove.purge = false
            remove.reason = ''
            remove.loading = false
            remove.replyWithReason = false
            remove.replyReason = ''
            remove.privateMessage = false
        },

        remove: async function () {
            if (!item) return
            if (!$profile?.jwt) throw new Error('Unauthenticated')

            remove.loading = true

            try {
                if (remove.purge) {
                    
                    // Purge Comment
                    if (isCommentView(item)) {
                        await getClient(undefined).purgeComment({
                            comment_id: item.comment.id,
                            reason: remove.reason,
                        })

                        dispatchWindowEvent('purgeComment', {
                            comment_id: item.comment.id,
                            purged: true
                        })
                    } 
                    // Purge Post
                    else {
                        await getClient(undefined).purgePost({
                            post_id: item.post.id,
                            reason: remove.reason,
                        })

                        dispatchWindowEvent('purgePost', {
                            post_id: item.post.id,
                            purged: true
                        })
                    }
                    
                    toast({
                        content: 'Successfully purged that submission.',
                        type: 'success',
                        title: 'Success'
                    })
                    
                    // Return to mod menu and set purged flag to true
                    purged = true
                    dispatcher('finish')
                    
                    return
                }

                // Send reply with removal reason if selected
                if (remove.replyWithReason) {
                    if (remove.replyReason == '') {
                        toast({
                            content: 'Your reply cannot be empty if "Reply reason" is enabled.',
                            type: 'warning',
                            title: 'Reply Text is Required'
                        })
                        remove.loading = false
                        return
                    }
                    
                    // Send a DM or comment depending on selected option
                    if (remove.privateMessage) {
                        await getClient()
                            .createPrivateMessage({
                                content: remove.replyReason,
                                recipient_id: isCommentView(item)
                                    ? item.comment.creator_id
                                    : item.post.creator_id,
                            })
                            .catch(() => {
                                toast({
                                    content: 'Failed to message user. Removing anyway...',
                                    type: 'warning',
                                })
                            })
                    } else {
                        let commentReply = await getClient().createComment({
                            content: remove.replyReason,
                            post_id: item.post.id,
                            parent_id: isCommentView(item) ? item.comment.id : undefined,
                        })
                        .catch(() => {
                            toast({
                                content: 'Failed to post reply. Removing anyway...',
                                type: 'warning',
                            })
                        })

                        // Distinguish the comment
                        if (commentReply) {
                            await getClient().distinguishComment({comment_id: commentReply.comment_view.comment.id, distinguished: true})
                            .catch(() => {
                                toast({
                                    content: 'Failed to distinguish reply. Removing anyway...',
                                    type: 'warning',
                                })
                            })
                        }

                    }
                }

                // Remove Comment
                if (isCommentView(item)) {
                    await getClient().removeComment({
                        comment_id: item.comment.id,
                        removed: !removed,
                        reason: remove.reason || undefined,
                    })
                    item.comment.removed = !removed
                    
                    dispatchWindowEvent('removeComment', {
                        comment_id: item.comment.id,
                        removed: item.comment.removed
                    })
                } 

                // Remove Post
                else if (isPostView(item)) {
                    await getClient().removePost({
                        post_id: item.post.id,
                        removed: !removed,
                        reason: remove.reason || undefined,
                    })
                    item.post.removed = !removed
                    
                    dispatchWindowEvent('removePost', {
                        post_id: item.post.id,
                        removed: item.post.removed
                    })
                }

                
                

                // Return to the mod menu and reset the reason value
                remove.reset()
                dispatcher('finish')

                toast({
                    content: `Successfully ${removed ? 'restored' : 'removed'} that submission.`,
                    type: 'success',
                    title: 'Success'
                })
            } catch (err) {
                toast({
                    content: (err as any) ?? 'The API returned an error when processing this request, but no details were provided.',
                    type: 'error',
                    title: 'Error'
                })
            }
        },

        setReplyReason: function (reason: string) {
            if (!item) return `no template`

            return removalTemplate($userSettings.moderation.removalReasonPreset, {
                communityLink: `!${fullCommunityName(item!.community.name, item!.community.actor_id)}`,
                postTitle: item.post.name,
                reason: reason,
                username: item.creator.name,
            })
        }

    } as RemoveItemContainer


</script>

<form class="flex flex-col gap-4 list-none" on:submit|preventDefault={remove.remove}>
                    
    {#if !isCommentView(item)}
        <PostMeta post={item} actions={false} postType="link" noClick/>
    {:else}
        <CommentMeta comment={item} content noClick/>
    {/if}


    <MarkdownEditor rows={6} previewButton images={false} label="Reason" placeholder="Optional" bind:value={remove.reason}>
        <Button 
            color={remove.purge ? 'danger' : 'primary'} 
            icon={remove.purge ? Fire : Trash}
            iconSize={16}
            size="lg" 
            loading={remove.loading} 
            disabled={remove.loading} 
            submit 
            slot="actions"
        >
            { remove.purge ? 'Purge' : removed ? 'Restore' : 'Remove' }
        </Button>
    </MarkdownEditor>
    
    <!--- Only show "Reply with reason" if you're a mod of the community or an admin and the content is local--->
    {#if !removed &&  !remove.purge && ( amMod($profile?.user, item.community) || (isAdmin($profile?.user) && item.community.local))}
        <SettingToggleContainer>
            <SettingToggle bind:value={remove.replyWithReason} icon={ChatBubbleLeft} title="Reply with Reason" 
                description="Send the user a comment or DM with the reason for the the mod action" 
            />
            
            <SettingMultiSelect icon={ChatBubbleLeftRight} title="Message Type" 
                description="Choose whether to reply as a comment to the removed item or as a direct message"
                options={[false, true]} optionNames={['Comment', 'Message']} bind:selected={remove.privateMessage}
                condition={remove.replyWithReason}
            />
        </SettingToggleContainer>

        {#if remove.replyWithReason}
            <MarkdownEditor previewButton images={false} bind:value={remove.replyReason} placeholder={remove.replyReason} rows={6} label="Reply">
                <Button 
                    color="primary" 
                    icon={ChatBubbleLeft}
                    iconSize={16}
                    size="lg" 
                    loading={remove.loading} 
                    disabled={remove.loading} 
                    slot="actions"
                    on:click={() => {
                        remove.replyReason = remove.setReplyReason(remove.reason)
                    }}
                >
                    Use Reply Template
                </Button>
            </MarkdownEditor>
        {/if}
    {/if}
</form>