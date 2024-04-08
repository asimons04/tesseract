<script lang="ts">
  export let width = 48
  export let alt: string = "Tesseract Logo"
  export let rounded:boolean = true
</script>

<div class="mx-auto my-auto">
    <img src="/img/TesseractAnimation256.gif" alt="{alt}" height="{width}" width="{width}" class="{rounded ? 'rounded-[999px]' : ''}" />
</div>
