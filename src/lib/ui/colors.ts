import { get, writable } from 'svelte/store'
import { env } from '$env/dynamic/public'

export enum Color {
  'accent' = 'border border-black dark:border-white bg-black text-white\
    dark:bg-white dark:text-black hover:text-inherit hover:bg-transparent hover:dark:bg-transparent active:bg-black/10 active:dark:bg-white/10',
  'ghost' = 'bg-black/5 dark:bg-white/5 hover:bg-black/10 hover:dark:bg-white/10 text-black dark:text-white border border-transparent',
  'secondary' = 'hover:bg-black/10 hover:dark:bg-white/10 text-black dark:text-white fill-black dark:fill-white',
  'danger' = 'border border-red-500 bg-red-500 text-white hover:text-red-500 hover:bg-transparent',
  'dangerSecondary' = 'hover:bg-red-500 text-red-500 hover:text-white',
  'border' = 'border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-300 hover:dark:bg-zinc-700',
  'borderDark' = 'border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-300 hover:dark:bg-zinc-800',
}

// Button colors
export type ButtonColor = keyof typeof buttonColor
export const buttonColor = {
    primary: `border border-slate-900 bg-slate-900 dark:bg-zinc-100
        dark:border-zinc-100 dark:text-black hover:text-inherit hover:dark:text-inherit text-slate-100
        hover:bg-transparent hover:dark:bg-transparent
        active:bg-black/10 active:dark:bg-white/10`,

    secondary: `border border-slate-200 dark:border-zinc-700 dark:bg-zinc-900
        hover:bg-slate-100 hover:dark:bg-zinc-800 hover:dark:border-zinc-700 dark:text-zinc-400 hover:text-inherit
        hover:dark:text-inherit border-none`,

    tertiary:
      'border border-transparent bg-transparent hover:bg-slate-300 hover:dark:bg-zinc-700 dark:text-zinc-200  border-none disabled:border-none',
    
    "tertiary-border":
      'border border-slate-300 dark:border-zinc-700 rounded-lg bg-transparent hover:bg-slate-300 hover:dark:bg-zinc-700 dark:text-zinc-200  disabled:border-none',

    "tertiary-border-bottom":
        'border-b border-slate-300 dark:border-zinc-800 bg-transparent hover:bg-slate-100 hover:dark:bg-zinc-700 dark:text-zinc-200',

    danger:
      'border border-red-500 bg-red-500 hover:text-red-500 hover:bg-transparent text-white',

    'danger-hollow':
      'border border-red-500 bg-transparent hover:bg-red-500 text-red-500  hover:text-white',
    
    success:
      'border border-green-500 bg-green-500 hover:text-green-500 hover:bg-transparent text-white',

    'success-hollow':
      'border border-green-500 bg-transparent  hover:bg-green-500 text-green-500 hover:text-white',
    
    info:
      'border border-sky-700 bg-sky-700 hover:text-sky-700 hover:bg-transparent text-white',

    'info-hollow':
      'border border-sky-700 bg-transparent hover:bg-sky-700 text-sky-700  hover:text-white',

    warning:
      'border border-amber-500 bg-amber-500 hover:text-amber-500 hover:bg-transparent text-black',
    'warning-hollow':
      'border border-amber-500 bg-transparent hover:bg-amber-500 text-amber-500 hover:text-black',

    ghost: `border border-slate-200 dark:border-zinc-800 bg-transparent
        hover:bg-slate-100 hover:dark:bg-zinc-800 hover:dark:border-zinc-700 dark:text-zinc-400 hover:text-inherit
        hover:dark:text-inherit`,

    elevated: `bg-slate-100 dark:bg-zinc-800 border border-slate-200
        dark:border-zinc-700 hover:bg-slate-300 hover:dark:bg-zinc-700 hover:border-slate-300
        hover:dark:border-zinc-600`,

    elevatedLow: `bg-slate-100 dark:bg-zinc-900 border border-slate-200
        dark:border-zinc-800 hover:bg-slate-300 hover:dark:bg-zinc-800 hover:border-slate-300
        hover:dark:border-zinc-700`,

    
    none: '',
  }

export let dividerColors = "divide-slate-200 dark:divide-zinc-800"
export let hrColors = "border-slate-200 dark:border-zinc-800"


const configuredTheme = (env.PUBLIC_THEME ?? 'system') as 'system' | 'light' | 'dark' | undefined
export const theme = writable<'system' | 'light' | 'dark'>(configuredTheme)


export const toggleTheme = () => {
  theme.update((theme) => {
    if (theme == 'light') {
      return 'dark'
    } else if (theme == 'dark') {
      return 'system'
    } else {
      return 'light'
    }
  })
}

export const inDarkTheme = (): boolean => {
  if (typeof window != 'undefined') {
    return get(theme) == 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : get(theme) == 'dark'
  }
  return false
}

if (typeof localStorage != 'undefined') {
  const localTheme: 'system' | 'light' | 'dark' =
    (localStorage.getItem('theme') as 'system' | 'light' | 'dark') || configuredTheme

  theme.update((theme) => localTheme)

  theme.subscribe((theme) => {
    if (typeof document != 'undefined') {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches

      const html = document.querySelector('html')

      if (theme == 'system') {
        html?.classList.toggle('dark', prefersDark)
      } else {
        html?.classList.toggle('dark', theme === 'dark')
      }

      localStorage.setItem('theme', theme)
    }
  })
}
