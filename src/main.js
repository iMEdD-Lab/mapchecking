import { ViteSSG } from 'vite-ssg/single-page'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import './index.css'

import el from "./locales/el.json";
import en from "./locales/en.json";

const i18n = createI18n({
    locale: `${import.meta.env.VITE_TOOL_LOCALE}`,
    fallbackLocale: `${import.meta.env.VITE_TOOL_LOCALE_FALLBACK}`,
    messages: { el, en },
  });
  
export const createApp = ViteSSG(App,
    ({ app, initialState }) => {
      app.use(i18n)
  
    },
  )
