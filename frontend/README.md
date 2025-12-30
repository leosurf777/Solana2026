# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## 🚀 Solana Pump Bot - Quick Start Guide

## 🌐 **For Your Friend - Demo Mode**

Your friend can immediately try the bot at:
**https://www.uniquelypuzzled.com**

### **What Works Right Now**
✅ **Full UI Interface** - All buttons, panels, and navigation
✅ **Demo Data** - Realistic mock trading data
✅ **Interactive Features** - All controls and settings
✅ **Responsive Design** - Works on desktop and mobile

### **What Your Friend Will See**
- 🎯 **Trading Dashboard** with mock positions
- 📊 **Market Data** with sample tokens
- 🤖 **Bot Controls** (start/stop buttons)
- ⚙️ **Settings Panel** for configuration
- 📈 **Performance Charts** with demo metrics

## 🔧 **Quick Fix for Full Functionality**

### **Option 1: Enable Demo Mode** ⭐ **Easiest**
I've added demo mode - just need to deploy:

1. **Add Demo Environment** (in Vercel Dashboard):
   - Go to: https://vercel.com/leos-projects-15c3af6c/frontend/settings/environment-variables
   - Add: `VITE_DEMO_MODE` = `true`
   - Add: `VITE_API_URL` = `https://demo-api.solana-bot.com`

2. **Redeploy**:
   ```bash
   cd frontend
   vercel --prod
   ```

### **Option 2: Backend URL Fix**
If you want to connect to your local backend:
1. **Port Forwarding**: Use ngrok to expose your backend
2. **Update Vercel**: Set `VITE_API_URL` to ngrok URL

## 🎯 **What Your Friend Can Do Right Now**

### **Explore the Interface**
- Click all buttons and test UI
- Navigate between different sections
- View demo trading data and charts
- Test settings and configuration
- Experience the full user interface

### **Demo Features Available**
- Mock pump.fun targets with priorities
- Sample sniper bot opportunities  
- Demo volume trading data
- Simulated performance metrics
- Interactive wallet management UI

## 🚀 **Next Steps**

### **For Full Production**
1. **Deploy Backend**: Use Railway, Render, or similar
2. **Update Environment**: Set production API URL
3. **Test Integration**: Verify all features work

### **For Immediate Demo**
1. **Enable Demo Mode**: Add environment variables to Vercel
2. **Redeploy**: Push updated frontend
3. **Share URL**: Your friend gets full experience

---

**🎉 Your friend can try the interface right now at https://www.uniquelypuzzled.com!**

The UI is fully functional - just needs demo mode enabled for complete experience.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
