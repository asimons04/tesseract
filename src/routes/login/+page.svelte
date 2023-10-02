<script lang="ts">
    import { goto } from '$app/navigation'
    import Button from '$lib/components/input/Button.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { DEFAULT_INSTANCE_URL } from '$lib/instance.js'
    import { validateInstance } from '$lib/lemmy.js'
  
    let instance: string = ''
    let validating: boolean = false
  </script>
  
  <svelte:head>
    <title>Login | Choose Instance</title>
  </svelte:head>
  
  <div class="mx-auto max-w-xl flex flex-col gap-4">
      <h1 class="font-bold text-2xl">Login</h1>
      <p class="text-sm">
          Enter your instance domain and click go.
      </p>
      <form
          class="flex flex-col gap-4"
          on:submit|preventDefault={async () => {
              if (instance != '') {
                  validating = true
                  if (await validateInstance(instance.trim())) {
                      goto(`/login/${instance}`)
                  } else {
                      toast({
                          content: 'Could not contact that instance URL',
                          type: 'error',
                      })
                  }
                  validating = false
              }
          }}
      >
          <TextInput
              bind:value={instance}
              label="Instance URL"
              required
              placeholder={DEFAULT_INSTANCE_URL}
              on:input={() => {
                  instance = instance.toLowerCase().replaceAll(' ', '')
              }}
              focus={true}
          />
              <Button
                  submit
                  color="primary"
                  size="lg"
                  loading={validating}
                  disabled={validating}
              >
                  Go
              </Button>
      </form>
  </div>
  