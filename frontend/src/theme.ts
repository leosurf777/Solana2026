import { createSystem } from '@chakra-ui/react';

const system = createSystem({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#fffdf7' },
          100: { value: '#fffbeb' },
          200: { value: '#fef3c7' },
          300: { value: '#fde68a' },
          400: { value: '#fcd34d' },
          500: { value: '#fbbf24' }, // Gold
          600: { value: '#f59e0b' },
          700: { value: '#d97706' },
          800: { value: '#b45309' },
          900: { value: '#78350f' },
        },
        matrix: {
          50: { value: '#d4f4dd' },
          100: { value: '#9ee8b3' },
          200: { value: '#6fdb87' },
          300: { value: '#3fce5c' },
          400: { value: '#22c031' }, // Matrix green
          500: { value: '#00b41b' },
          600: { value: '#009617' },
          700: { value: '#007813' },
          800: { value: '#005a0f' },
          900: { value: '#003c0b' },
        },
      },
    },
  },
  globalCss: {
    body: {
      bg: '#000000',
      color: '#22c031',
      fontFamily: '"Courier New", monospace',
    },
    '*': {
      borderColor: '#fbbf24',
    },
  },
});

export default system;