const CopyPlugin = require('copy-webpack-plugin')
const path = require('path')

module.exports = {
    entry: {
        popup: {
            import: './src/scripts/popup.tsx',
            filename: 'popup.js'
        },
        background: {
            import: './src/scripts/background.ts',
            filename: 'background.js'
        },
        videoCheck: {
            import: './src/scripts/videoCheck.ts',
            filename: 'videoCheck.js'
        },
        style: {
            import: './src/styles/popup.scss',
            filename: 'popup.css'
        }
    },
    output: {
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    "style-loader",
                    "css-loader",
                    "sass-loader"
                ],
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: 'public',
                    to: '.'
                }
            ]
        })
    ],
    devtool: 'inline-cheap-source-map'
}