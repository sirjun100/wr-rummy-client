/**
 * Minimal zlib.deflateSync / inflateSync for CompressUtils (pako-backed).
 * Load after pako.js plugin.
 */
(function () {
    var g = typeof window !== "undefined" ? window : globalThis;
    var pakoLib = g.pako;
    if (!pakoLib && typeof globalThis !== "undefined") {
        pakoLib = globalThis.pako;
    }
    if (!pakoLib) {
        console.error("[zlib-shim] pako not loaded");
        return;
    }

    function toUint8Array(data) {
        if (data == null) {
            return new Uint8Array(0);
        }
        if (data instanceof Uint8Array) {
            return data;
        }
        if (typeof ArrayBuffer !== "undefined" && data instanceof ArrayBuffer) {
            return new Uint8Array(data);
        }
        if (typeof data === "string") {
            var len = data.length;
            var out = new Uint8Array(len);
            for (var i = 0; i < len; i++) {
                out[i] = data.charCodeAt(i) & 0xff;
            }
            return out;
        }
        if (data.buffer && data.byteLength != null) {
            return new Uint8Array(data.buffer, data.byteOffset || 0, data.byteLength);
        }
        throw new Error("[zlib-shim] unsupported input type");
    }

    function pakoOpts(options) {
        var opts = {};
        if (options && options.dictionary != null) {
            opts.dictionary = toUint8Array(options.dictionary);
        }
        return opts;
    }

    g.zlib = {
        deflateSync: function (data, options) {
            return pakoLib.deflate(toUint8Array(data), pakoOpts(options || {}));
        },
        inflateSync: function (data, options) {
            return pakoLib.inflate(toUint8Array(data), pakoOpts(options || {}));
        },
    };
})();
