const fs = require("fs");
const path = require("path");
const webpack = require("webpack");

const wasmPath = path.join(
    __dirname,
    "node_modules",
    "zxing-wasm",
    "dist",
    "reader",
    "zxing_reader.wasm"
);
const wasmBase64 = fs.readFileSync(wasmPath).toString("base64");
const wasmDataUrl = `data:application/wasm;base64,${wasmBase64}`;

module.exports = {
    // bundling mode
    mode: "production",
    // entry files
    entry: "./src/index.ts",
    // output bundles (location)
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "html5-qrcode.min.js",
        library: "__Html5QrcodeLibrary__",
    },
    // file resolutions
    resolve: {
        extensions: [".ts", ".js"],
    },
    target: "web",
    module: {
        rules: [
            {
                test: /\.tsx?/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            __ZXING_WASM_INLINE__: JSON.stringify(wasmDataUrl),
        }),
    ],
    optimization: {
        minimize: true,
        usedExports: true,
    },
};
