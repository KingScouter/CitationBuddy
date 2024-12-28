const { composePlugins, withNx } = require('@nx/webpack');

module.exports = composePlugins(
  // Default Nx composable plugin
  withNx(),
  // Custom composable plugin
  (config, { options, context }) => {
    // `config` is the Webpack configuration object
    // `options` is the options passed to the `@nx/webpack:webpack` executor
    // `context` is the context passed to the `@nx/webpack:webpack` executor
    // customize configuration here
    // Enable source maps
    config.devtool = 'source-map'; // Use 'source-map' for production builds

    config.module.rules[0] = {
      test: /\.js$/,
      enforce: 'pre',
      exclude: /node_modules.*/,
      use: [
        {
          //needed to chain sourcemaps.  see: https://webpack.js.org/loaders/source-map-loader/
          loader: 'source-map-loader',
          options: {
            filterSourceMappingUrl: (url, resourcePath) => {
              //  console.log({ url, resourcePath }) example:
              // {
              //  url: 'index.js.map',
              //  resourcePath: '/repos/xlib-wsl/common/temp/node_modules/.pnpm/https-proxy-agent@5.0.0/node_modules/https-proxy-agent/dist/index.js'
              // }

              if (/.*\/node_modules\/.*/.test(resourcePath)) {
                return false;
              }
              return true;
            },
          },
        },
      ],
    };
    config.module.rules.push({
      test: /\.node$/,
      loader: 'node-loader',
    });

    return config;
  }
);
