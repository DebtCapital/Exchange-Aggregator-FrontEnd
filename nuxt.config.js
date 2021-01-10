export default {
  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: 'Aggregator-FrontEnd',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  ssr: false,
  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [
  ],
  script: [
    { src: '/charting_library/charting_library.min.js', type: 'text/javascript' },
    { src: '/datafeeds/udf/dist/polyfills.js', type: 'text/javascript' },
    { src: '/datafeeds/udf/dist/bundle.js', type: 'text/javascript' },
  ],
  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
    { src: '~/plugins/tradingview', ssr: false },
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
  ],

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
  }
}
