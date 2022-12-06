import { defineConfig } from 'windicss/helpers'
import plugin from 'windicss/plugin'

export default defineConfig({
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background-color)',
        surface: 'var(--surface-color)',
        primary: 'var(--primary-color)',
        'primary-50': 'var(--primary-50)',
        'primary-100': 'var(--primary-100)',
        'primary-200': 'var(--primary-200)',
        'primary-300': 'var(--primary-300)',
        'primary-400': 'var(--primary-400)',
        'primary-500': 'var(--primary-500)',
        'primary-600': 'var(--primary-600)',
        'primary-700': 'var(--primary-700)',
        'primary-800': 'var(--primary-800)',
        'primary-900': 'var(--primary-900)',
        'gray-50': 'var(--gray-50)',
        'gray-100': 'var(--gray-100)',
        'gray-200': 'var(--gray-200)',
        'gray-300': 'var(--gray-300)',
        'gray-400': 'var(--gray-400)',
        'gray-500': 'var(--gray-500)',
        'gray-600': 'var(--gray-600)',
        'gray-700': 'var(--gray-700)',
        'gray-800': 'var(--gray-800)',
        'gray-900': 'var(--gray-900)',
        'green-50': '#e0f2f1',
        'green-100': '#b2dfdb',
        'green-200': '#80cbc4',
        'green-300': '#4db6ac',
        'green-400': '#26a69a',
        'green-500': '#009688',
        'green-600': '#00897b',
        'green-700': '#00796b',
        'green-800': '#00695c',
        'green-900': '#004d40',
        'red-50': '#ffebee',
        'red-100': '#ffcdd2',
        'red-200': '#ef9a99',
        'red-300': '#e57372',
        'red-400': '#ef534f',
        'red-500': '#f44334',
        'red-600': '#e53934',
        'red-700': '#d32f2e',
        'red-800': '#c62827',
        'red-900': '#b71c1b',
        label: 'rgba(var(--label-tuple), var(--label-opacity))',
        medium: 'rgba(var(--label-tuple), .6)',
        disabled: 'rgba(var(--label-tuple), .38)',
        divider: 'rgba(var(--label-tuple), .12)',
        well: 'rgba(var(--label-tuple), .06)',
      },
    },
  },
  plugins: [
    require('windicss/plugin/forms'),
    plugin(({ addUtilities }) => {
      addUtilities({
        '.states': {
          '--state-opacity': '0.0',
          '&:hover': {
            '--state-opacity': '0.04',
          },
          '&:active': {
            '--state-opacity': '0.10',
          },
          '&:focus': {
            '--state-opacity': '0.12',
          },
          "&:disabled, &[aria-disabled='true']": {
            '--state-opacity': '0.0',
            '--tw-text-opacity': '0.38',
          },
          position: 'relative',
          overflow: 'hidden',
          '&:after': {
            content: "''",
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'rgba(var(--label-tuple), var(--state-opacity, 0))',
            pointerEvents: 'none',
            transition: 'background 75ms linear',
          },
        },
        '.bg-states': {
          'background-color':
            'rgba(var(--label-tuple), var(--state-opacity, 0))',
        },
        '.label-white': {
          '--label-tuple': '255, 255, 255',
        },
        '.label-black': {
          '--label-tuple': '0, 0, 0',
        },
        '.surface-primary': {
          '--background-color': 'var(--primary-100)',
          '--surface-color': 'var(--primary-50)',
          '.dark &': {
            '--surface-color': 'var(--primary-800)',
            '--background-color': 'var(--primary-900)',
          },
        },
        '.surface-light': {
          '--surface-color': 'var(--gray-50)',
          '--background-color': 'var(--gray-100)',
        },
        '.surface-dark': {
          '--surface-color': 'var(--gray-800)',
          '--background-color': 'var(--gray-900)',
        },
      })
    }),
  ],
})
