<script lang="ts">
  export let width = 48
  export let url: string = "/logo_512.png"
  export let alt: string = "Tesseract Logo"
  export let rounded:boolean = true
</script>

<img src="{url}" alt="{alt}" height="{width}" width="{width}" class="invert dark:invert-0 {rounded ? 'rounded-[999px]' : ''}" />
