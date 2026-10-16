/**
 * Cocos plugin scripts: globals exposed when JS is imported as plugin.
 */
export {};

declare global {
    const pako: {
        deflate(data: ArrayBuffer | Uint8Array, options?: { dictionary?: Uint8Array }): Uint8Array;
        inflate(data: ArrayBuffer | Uint8Array, options?: { dictionary?: Uint8Array }): Uint8Array;
    };

    const zlib: {
        deflateSync(data: string | Uint8Array | ArrayBuffer, options?: { dictionary?: string | Uint8Array | null }): Uint8Array;
        inflateSync(data: string | Uint8Array | ArrayBuffer, options?: { dictionary?: string | Uint8Array | null }): Uint8Array;
    };

    /** Android JSB diagnostics (rummy-diagnostics.js plugin). */
    const __rummyDiagnostics: {
        report(message: string, stackTrace?: string): void;
        breadcrumb(value: string): void;
        heartbeat(payload: unknown): void;
    } | undefined;

    const CryptoJS: {
        MD5(message: string): { toString(encoder?: unknown): string };
        AES: {
            encrypt(message: string, key: unknown, cfg?: object): { toString(): string };
            decrypt(ciphertext: string, key: unknown, cfg?: object): { toString(encoder?: unknown): string };
        };
        enc: {
            Latin1: { parse(s: string): unknown };
            Utf8: unknown;
        };
        mode: { CBC: unknown };
    };
}
