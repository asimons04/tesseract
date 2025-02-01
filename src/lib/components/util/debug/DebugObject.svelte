<script lang="ts">
  import Modal from '$lib/components/ui/modal/Modal.svelte'
  import DebugTree from '$lib/components/util/debug/DebugTree.svelte'

  import { BugAnt} from 'svelte-hero-icons'

  export let object: any
  export let open: boolean = false
</script>

<Modal bind:open title="Debug Data Explorer" icon={BugAnt} width="max-w-4xl" on:close={() => { history.back() }}>
  <DebugTree {object} isParent={true} />
</Modal>
