import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lumis: {
          bg: {
            primary: '#F8F6F3',
            secondary: '#F2EFE9',
            tertiary: '#EBE7DF',
          },
          surface: {
            DEFAULT: '#E8E3D8',
            hover: '#DFD9CC',
            elevated: '#FFFFFF',
          },
          accent: {
            primary: '#9CAF9E',
            'primary-hover': '#8A9D8C',
            'primary-light': '#C5D4C6',
            secondary: '#C9A58F',
            'secondary-hover': '#B8947D',
            'secondary-light': '#E5D4C5',
            ai: '#B5A8C1',
            'ai-hover': '#A396AF',
            'ai-light': '#D9D2E0',
            gold: '#D4B896',
            'gold-hover': '#C2A684',
            'gold-light': '#EBE0D0',
          },
          text: {
            primary: '#3D3935',
            secondary: '#6B6560',
            tertiary: '#9B9590',
            disabled: '#C4BFB8',
            inverse: '#F8F6F3',
          },
          success: {
            DEFAULT: '#8FA888',
            bg: '#E8F0E7',
            border: '#C5D9C3',
          },
          warning: {
            DEFAULT: '#D4A574',
            bg: '#F9F0E6',
            border: '#EDD9C3',
          },
          error: {
            DEFAULT: '#C89090',
            bg: '#F5E8E8',
            border: '#E5CFCF',
          },
          info: {
            DEFAULT: '#94A8B8',
            bg: '#E7EDF2',
            border: '#C8D7E3',
          },
        },
        emotion: {
          joyful: '#E8C4A0',
          safe: '#A8C4A8',
          energized: '#F0D4A0',
          peaceful: '#B0C8D8',
          loved: '#D8B0C0',
          anxious: '#C8B8A8',
          drained: '#A8A8B8',
          confused: '#B8B0C0',
          hurt: '#C8A8A8',
        },
      },
      fontFamily: {
        serif: ['Crimson Pro', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        // Base scale — unchanged, body text reads well at these sizes
        xs: '0.75rem',       // 12px
        sm: '0.875rem',      // 14px
        base: '1rem',        // 16px
        lg: '1.125rem',      // 18px
        xl: '1.25rem',       // 20px
        '2xl': '1.5rem',     // 24px
        // Reduced from Tailwind defaults — headlines & decorative numbers were oversized
        '3xl': '1.625rem',   // 26px  (default 30px)
        '4xl': '2rem',       // 32px  (default 36px)
        '5xl': '2.5rem',     // 40px  (default 48px)
        '6xl': '3rem',       // 48px  (default 60px)
        '7xl': '3.5rem',     // 56px  (default 72px)
        '8xl': '4rem',       // 64px  (default 96px)
        '9xl': '5rem',       // 80px  (default 128px)
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '1.75rem',    // 28px  (default 32px)
        '10': '2.25rem',   // 36px  (default 40px)
        '12': '2.75rem',   // 44px  (default 48px)
        '16': '4rem',      // 64px  — keep: used as fixed header offset
        '20': '4.5rem',    // 72px  (default 80px)
        '24': '5.5rem',    // 88px  (default 96px)
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '12px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(61, 57, 53, 0.08)',
        DEFAULT: '0 4px 12px rgba(61, 57, 53, 0.10)',
        md: '0 4px 12px rgba(61, 57, 53, 0.10)',
        lg: '0 8px 24px rgba(61, 57, 53, 0.12)',
        xl: '0 16px 48px rgba(61, 57, 53, 0.14)',
        inner: 'inset 0 2px 4px rgba(61, 57, 53, 0.06)',
      },
      transitionDuration: {
        fast: '150ms',
        DEFAULT: '250ms',
        slow: '400ms',
      },
    },
  },
  plugins: [],
};

export default config;
