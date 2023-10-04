/** @type {import('tailwindcss').Config} */
export default {
    content: ['src/**/*.{js,ts,svelte,html}'],
    darkMode: 'class',
    theme: {
        fontFamily: {
            'sans': ['sans-serif'],
            'system': ['system-ui'], 
            'serif': ['serif']
        },
        fontSize: {
            xs: '0.8rem',
            sm: '0.9rem',
            base: '1.1rem',
            lg: '1.125rem',
            xl: '1.2rem',
            '2xl': '1.563rem',
            '3xl': '1.953rem',
            '4xl': '2.441rem',
            '5xl': '3.052rem',
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

