<script lang="ts">
  export let width = 48
  let darkMode: boolean

  //@ts-ignore
  $: darkMode = dark()
</script>

<img src="/logo_512.png" alt="Tesseract Logo" height="{width}" width="{width}" class="rounded-[999px] {darkMode ? '' : 'invert'}"/>