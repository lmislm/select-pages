const path = require('path')

function resolve (dir) {
  return path.join(__dirname, dir)
}

const name = 'vue Select Pages'

const port = process.env.port || process.env.npm_config_port || 9966 // dev port

module.exports = {
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  productionSourceMap: false,
  devServer: {
    port: port,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    }
  },
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: name,
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  }
  // chainWebpack(config) {
  //   config
  //   .when(process.env.NODE_ENV !== 'development',
  //     config => {
  //       config
  //         .plugin('ScriptExtHtmlWebpackPlugin')
  //         .after('html')
  //         .use('script-ext-html-webpack-plugin', [{
  //         // `runtime` must same as runtimeChunk name. default is `runtime`
  //           inline: /runtime\..*\.js$/
  //         }])
  //         .end()
  //       config
  //         .optimization.splitChunks({
  //           chunks: 'all',
  //           cacheGroups: {
  //             libs: {
  //               name: 'chunk-libs',
  //               test: /[\\/]node_modules[\\/]/,
  //               priority: 10,
  //               chunks: 'initial' // only package third parties that are initially dependent
  //             },
  //             commons: {
  //               name: 'chunk-commons',
  //               test: resolve('src/components'), // can customize your rules
  //               minChunks: 3, //  minimum common number
  //               priority: 5,
  //               reuseExistingChunk: true
  //             }
  //           }
  //         })
  //       config.optimization.runtimeChunk('single')
  //     }
  //   )
  // }
}