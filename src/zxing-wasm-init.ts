/**
 * Configures zxing-wasm to load WASM from the build (not CDN).
 */
import { prepareZXingModule } from "zxing-wasm/reader";

/** Set by webpack DefinePlugin for the UMD/min bundle (inline wasm). */
declare const __ZXING_WASM_INLINE__: string | undefined;

const ZXING_READER_WASM_FILE = "zxing_reader.wasm";

let wasmReady: Promise<void> | null = null;

function resolveWasmUrl(): string {
    if (typeof __ZXING_WASM_INLINE__ !== "undefined" && __ZXING_WASM_INLINE__) {
        return __ZXING_WASM_INLINE__;
    }
    if (typeof document !== "undefined") {
        const scripts = document.getElementsByTagName("script");
        for (let i = scripts.length - 1; i >= 0; i--) {
            const src = scripts[i].src;
            if (src && (src.includes("html5-qrcode") || src.includes("Html5Qrcode"))) {
                const slash = src.lastIndexOf("/");
                if (slash >= 0) {
                    return src.substring(0, slash + 1) + ZXING_READER_WASM_FILE;
                }
            }
        }
    }
    return ZXING_READER_WASM_FILE;
}

/**
 * Ensures the ZXing reader WASM module is loaded before decoding.
 */
export function ensureZxingWasmReady(): Promise<void> {
    if (wasmReady) {
        return wasmReady;
    }
    const wasmUrl = resolveWasmUrl();
    wasmReady = (prepareZXingModule({
        overrides: {
            locateFile: (path: string, prefix: string) => {
                if (path.endsWith(".wasm")) {
                    return wasmUrl;
                }
                return prefix + path;
            },
        },
        fireImmediately: true,
    } as { fireImmediately: true }) as unknown as Promise<unknown>)
        .then(() => undefined);
    return wasmReady;
}
