import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        // p5.js (global mode, loaded via script in index.html)
        createCanvas: 'readonly',
        createCapture: 'readonly',
        image: 'readonly',
        VIDEO: 'readonly',
        width: 'readonly',
        height: 'readonly',
        fill: 'readonly',
        noStroke: 'readonly',
        noFill: 'readonly',
        stroke: 'readonly',
        circle: 'readonly',
        mouseX: 'readonly',
        mouseY: 'readonly',
        frameCount: 'readonly',
        // ml5.js (loaded via script in index.html)
        ml5: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^(preload|setup|draw|mousePressed|noseOffsetFromRef|[A-Z_])' }],
    },
  },
])
