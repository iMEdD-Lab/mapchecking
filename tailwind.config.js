module.exports = {

  content: [
    "./src/**/*.vue",
    "./index.html"
  ],
  theme: {
    extend : {
        colors: {
            customPrimary: '#CE251E',
            link: '#114B5F',
            darker: '#484E4E',
            lighter: "#666F6F",
        },
        fontFamily: {
            sans: ['Roboto', 'sans-serif'],
            slab: ['RobotoSlab', 'serif'],
        },
    }
   
  },
  variants: {},
  plugins: [],
}
