/** @type {import('tailwindcss').Config} */
export default {
    content: ['src/**/*.{js,ts,svelte,html}'],
    darkMode: 'class',
    theme: {
        fontFamily: {
            'sans': ['sans-serif'],
            'system': ['system-ui'], 
            'serif': ['serif'],
            'atkinson': ['AtkinsonHyperlegible', 'sans-serif', 'system-ui'],
            'inter': ['Inter', 'sans-serif', 'system-ui'],
            'opendyslexic' : ['OpenDyslexic', 'serif', 'system-ui'],
            'roboto': ['Roboto', 'sans-serif', 'system-ui'],
            'reddit': ['RedditMono', 'sans-serif', 'system-ui'],
            'ubuntu': ['Ubuntu', 'sans-serif', 'system-ui'],
            'urbanist': ['Urbanist', 'sans-serif', 'system-ui']
        },
        fontSize: {
            xs: '0.85rem',
            sm: '0.9rem',
            base: '1.0rem',
            lg: '1.1rem',
            xl: '1.3rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem',
            '5xl': '3rem',
            '6xl': '3.75rem',
            '7xl': '4.5rem',
            '8xl': '6rem',
            '9xl': '8rem'
        },
        
        extend: {
            animation: {
                'pop-in': 'pop-in 0.25s ease-out forwards'
            },
            keyframes: {
                'pop-in': {
                    '0%, 100%': { transform: 'translateX(8px)', opacity: 0 }
                }
            },
            colors: {
                'zinc': {
                    700: '#34343b',
                    800: '#1f1f24',
                    900: '#121215'
                }
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}

