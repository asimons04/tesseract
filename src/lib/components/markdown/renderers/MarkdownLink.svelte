<script lang="ts">
    import type { Community, Person } from 'lemmy-js-client';
    import type { Tokens } from 'marked'
    

    import { createFakePerson, createFakeCommunity } from '$lib/components/lemmy/post/helpers'
    import { goto } from '$app/navigation'
    import { userProfileModal, communityProfileModal, postViewerModal } from '$lib/components/lemmy/moderation/moderation'
    import { userSettings } from '$lib/settings';

    import Badge from '$lib/components/ui/Badge.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import Markdown from '../Markdown.svelte'
    
    import { type CustomMarkdownOptions, photonify } from '../markdown'
    
    import { 
        ChatBubbleLeftEllipsis, 
        User, 
        UserGroup, 
        Window 
    } from 'svelte-hero-icons'
    
    
   
    export let token: Tokens.Link
    export let options: CustomMarkdownOptions

    let person: Person | undefined = undefined
    let community: Community | undefined = undefined
    let hashtagRE = /^#[A-Za-z0-9À-ÿ]+/i
    let communityRE = /!(?<community>[a-zA-Z0-9._-]+)@(?<instance>[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i
    let userRE = /@(?<user>[a-zA-Z0-9._-]+)@(?<instance>[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i

    let imageVideoAudioRE = /!\[.*\]\(http(s)?:\/\/.*.(avif|jpeg|jpg|gif|apng|img|png|svg|bmp|webp|mp3|oga|opus|aac|mp4|webm|mov|m4v|ogv)\)/
    let stupidImgShieldRE = /!\[.*\]\(http(s)?:\/\/(img\.shields\.io).*\)/
    $: token, preProcess()

    /** Pre-processes the identified links for special handling.  Note the ordering is important.
     * 1) Detect stupid/invalid links where the href value is a user/community short link and not an actual hyperlink
     * 2) Run the "photonify" matcher/replacer to localize user, community, post, and comment links.
     * 3) Fix some weird Mastodon hashtag thing where sometimes they are prefixed with a \
     * 4) Populate a Person class object if the link's href starts with /u/ and contains a user and instance
     * 5) Populate a Community class object if the link's href starts with a /c/ and contains a community name and instance.
    */
    function preProcess() {
        preProcessStupidCommunityUserLinkFormats()
        token.href  = photonify(token.href) ?? token.href
        token.text  = token.text.startsWith('\\#') ? token.text.replace('\\#', '#') : token.text
        person      = generatePerson(token.href)
        community   = generateCommunity(token.href)
    }

    function generatePerson(text:string) {
        if (!text.startsWith('/u/')) return

        let username = text.replaceAll('/u/', '').trim()
        const [user, domain] = username.split('?')[0].split('@')
        if (!user || !domain) return
        const actor_id =  `https://${domain.trim()}/u/${user}`
        const person = createFakePerson()
        person.actor_id = actor_id
        person.name = user
        return person
    }

    function generateCommunity(text:string) {
        if (!text.startsWith('/c/') ) return
        let username = text.replaceAll('/c/', '').trim()
        const [name, domain] = username.split('?')[0].split('@')
        if (!name || !domain) return
        const actor_id =  `https://${domain.trim()}/c/${name}`
        const community = createFakeCommunity()
        community.actor_id = actor_id
        community.name = name
        return community
    }

    // Function to catch when someone stupidly links a community with the !community@instance as the hyperlink
    // e.g.  [!community@instance.xyz](!instance.xyz) and [@user@instance.xyz](@user@instance.xyz) Like, who the fuck does this??
    function preProcessStupidCommunityUserLinkFormats() {
        try {
            // [Whatever](!instance.xyz) -> /c/community@instance.xyz
            let match = token.href.match(communityRE)
            if (match) {
                token.text = token.href = `/c/${match[1]}@${match[2]}`
                return
            }

            // [Whatever](@user@instance.xyz) -> /u/user@instance.xyz
            match = token.href.match(userRE)
            if (match) {
                token.text = token.href = `/u/${match[1]}@${match[2]}`
                return
            }
        }
        catch (err) {
            console.log(err)
            return
        }

    }
</script>

<!--- Turn user links into badges that load a user profile modal--->
{#if person}
    <Badge color="blue" rightJustify={false} inline={true} icon ={User} iconSize={14} label="@{person.name}@{new URL(person.actor_id).hostname}"
        on:click={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (person) userProfileModal(person)
        }}
    >
    @{person.name}@{new URL(person.actor_id).hostname}
    </Badge>

<!--- Turn community links into badges that load a community profile modal--->
{:else if community}
    <Badge color="gray" rightJustify={false} inline={true} icon={UserGroup} iconSize={14} label="!{community.name}@{new URL(community.actor_id).hostname}"
        on:click={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (community) communityProfileModal(community)
        }}
    >
        !{community.name}@{new URL(community.actor_id).hostname}
    </Badge>

<!---Universal Format Post Link--->
{:else if token.href.startsWith('/post/')}
    <Link href={token.href} newtab={$userSettings.openInNewTab.posts} preventDefault on:click={(e) => {
            let relLink = token.href.split('/')
            let postID = relLink.pop()
            let instance = relLink.pop()
            if (instance && postID) {
                e.preventDefault()
                e.stopPropagation()
                postViewerModal(instance, Number(postID))
            }
        }}
    >
        <!---Only badge-ify bare post links--->
        {#if !token.text || token.text.startsWith('https://')}
            <Badge color="cyan" rightJustify={false} inline={true} icon={Window} iconSize={14}  label="Post: {token.text}" >
                {token.text}
            </Badge>
        {:else}
            {token.text}
        {/if}
    </Link>

    <!---Universal Format Comment Link--->
{:else if token.href.startsWith('/comment/')}
    <Link href={token.href} newtab={$userSettings.openInNewTab.posts} preventDefault on:click={(e) => {
            let relLink = token.href.split('/')
            let commentID = relLink.pop()
            let instance = relLink.pop()
            if (instance && commentID) {
                e.preventDefault()
                e.stopPropagation()
                postViewerModal(instance, undefined, Number(commentID))
            }
        }}
    >
        <!---Only badge-ify bare comment links--->
        {#if !token.text || token.text.startsWith('https://')}
            <Badge color="teal" rightJustify={false} inline={true} icon={ChatBubbleLeftEllipsis} iconSize={14} label="Comment: {token.text}">
                {token.text}
            </Badge>
        {:else}
            {token.text}
        {/if}
</Link>

<!--Turn hashtags into badges but keep the original link--->
{:else if $userSettings.linkifyHashtags && hashtagRE.test(token.text)}
    <Link href={token.href} newtab={$userSettings.openInNewTab.posts} >
        <Badge color="yellow" rightJustify={false} inline={true} label="Search Hashtag: {token.text}">
            {token.text}
        </Badge>
    </Link>

<!---Display a regular link--->
{:else}
    <!---If a media item (image/video/audio) is the link "text", render it separately and put the hyperlink URL below it--->
    {#if imageVideoAudioRE.test(token.text) || stupidImgShieldRE.test(token.text)}
        <Markdown source={token.text} />
        
        <Link highlight 
            href={token.href} 
            title={token.title ?? token.href} 
            preview={
                !(token.href.startsWith('/')) && 
                $userSettings.uiState.linkPreviews &&
                !(options?.custom?.noPreview ?? false)
            }
            text={token.href}
            newtab={true}
        />
    {:else}
        <Link highlight 
            href={token.href} 
            title={token.title ?? token.href} 
            preview={
                !(token.href.startsWith('/')) && 
                $userSettings.uiState.linkPreviews &&
                !(options?.custom?.noPreview ?? false)
            }
            text={token.text}
            newtab={true}
        />
    {/if}
{/if}