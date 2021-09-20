const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
module.exports = (env, argv) => {
  console.log('argv.mode', argv.mode)
  const mode = argv.mode;
  const isDev = mode === 'development';
  const config = {
    entry: {
      background: "./src/background/index.js",
      popup: "./src/index.js",
      xuframe:"./src/background/service/ExtUtils.js"
    },
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "./[name].js",
    },
    module: {
      //加载器配置
      rules: [
        {
          test: /\.css$/,
          use: [
            {
              loader: "style-loader",
            },
            {
              loader: "css-loader",
              options: {
                url: false,
                sourceMap: true,
              },
            },
          ],
        },
        {
          test: /\.js$/, exclude: /node_modules/, loader: "babel-loader",
        },
        {
          test: /\.jsx$/,
          exclude: /(node_modules)/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/env", "@babel/react"],
            },
          },
        },
        {
          test: /\.scss$/,
          use: [
            {
              loader: "style-loader",
            },
            {
              loader: "css-loader",
            },
            {
              loader: "sass-loader",
            },
          ],
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          use: [
            {
              loader: "url-loader",
              options: {
                limit: 8192,
              },
            },
          ],
        },
      ],
    },
    plugins: getPlugins(isDev),
    performance: getPerformance(),
    // h/t: https://github.com/webpack/webpack/issues/11649#issuecomment-751620869
    resolve: {
      fallback: {
        fs: false,
        'child_process': false
      },
      alias: {
        buffer: 'buffer'
      }
    },
    optimization: {
      splitChunks: {
        chunks: "all",
        minSize: 4194300,
        cacheGroups: {
          default: {
            name: 'common',
            chunks: 'initial',
            minChunks: 2,
          },
        }
      }
    },
  };
  if (isDev) {
    config.devtool = 'cheap-module-source-map';
    config.optimization = {
      minimize: false,
    };
  }
  return config;
}


function getPerformance() {
  return {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  };
}
function getPlugins(isDev) {
  let plugins = [];
  plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        { from: "./public/static", to: "./" },
        { from: "./public/manifest.json", to: "./" },
        { from: "./public/oasis-xu-frame.html", to: "./" },
        { from: "./src/_locales", to: "./_locales" },
      ],
    }),
    new webpack.ProvidePlugin({
      React: "react",
    }),
    new webpack.DefinePlugin({
      'process.env': { 
        ...JSON.stringify(process.env.NODE_ENV),
        NODE_DEBUG: process.env.NODE_DEBUG
      },
      IS_DEV: JSON.stringify(isDev),
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    }),    
  );
  return plugins;
}
