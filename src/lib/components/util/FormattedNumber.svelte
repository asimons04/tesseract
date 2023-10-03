<script lang="ts">
  export let number: number
  export let locale: string = 'en'
  export let options: Intl.NumberFormatOptions = {
    notation: 'compact',
  }
</script>

<span title="{number.toString()}">{Intl.NumberFormat(locale, options).format(number)}</span>
