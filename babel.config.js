module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
    ['@babel/preset-env', {
      exclude: ['@babel/plugin-transform-async-to-generator'],
      targets: {
        chrome: '73',
      },
    }],
  ],
}
