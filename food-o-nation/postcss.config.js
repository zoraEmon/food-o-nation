module.exports = {
  plugins: {
    // This plugin processes your CSS with Tailwind and resolves the previous build error
    '@tailwindcss/postcss': {}, 
    // This plugin adds necessary vendor prefixes (like -webkit-, -moz-)
    'autoprefixer': {},
  },
}