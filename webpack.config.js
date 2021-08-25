const CopyPlugin = require('copy-webpack-plugin')
const path = require('path')

module.exports = {
    entry: {
        popup: {
            import: './src/scripts/popup.tsx',
            filename: 'popup.js'
        },
        info: {
            import: './src/scripts/info.tsx',
            filename: 'info.js'
        },
        background: {
            import: './src/scripts/background.ts',
            filename: 'background.js'
        },
        videoCheck: {
            import: './src/scripts/videoCheck.ts',
            filename: 'videoCheck.js'
        },
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
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
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
    devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'inline-cheap-source-map'
}