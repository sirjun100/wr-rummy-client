import { AbstractSystem } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { LoginFailedEvent } from "../event/LoginFailedEvent";
import { LoginSuccessEvent } from "../event/LoginSuccessEvent";
import { SessionModel } from "../model/SessionModel";
import { GateHttpDefaults, GateWsDefaults, LobbyRoute } from "../config/StartConfig";
import type { FeatureSwitchInfo, MaintainInfo } from "../model/AppBootstrapModel";
import { sys } from "cc";

// --- 可随 NetworkSystem 一并拷贝的配置（与 wr-rummy-server gate etc 默认一致）---

const GATE_WEBSOCKET_URL = GateWsDefaults.url;
const CALL_TIMEOUT_MS = 8000;
const HEARTBEAT_INTERVAL_MS = 10000;
const ROUTE_LOBBY_LOGIN = LobbyRoute.Login;
const DUE_OK_CODE = 0;
const DUE_CODE_MESSAGE: Record<number, string> = {
    0: "OK",
    3: "invalid argument（如密码错误）",
    6: "internal error（常见：BindGate 失败或注册 UID 失败）",
};

interface LoginReq {
    account: string;
    password: string;
}

interface LoginRes {
    code: number;
    uid?: number;
}

/**
 * Due 网关连接、编解码与业务 RPC（登录等）。
 * **自包含**：传输层实现在本文件内，拷贝本文件 + 注册 GameApp 即可使用（另需 QFramework / SessionModel / 事件类）。
 */
export interface BootstrapDataDto {
    server_ver?: string;
    hot_update_url?: string;
    hot_update_type?: number;
    ws_gate_urls?: string[];
    http_base_urls?: string[];
    apk_type?: number;
    apk_url?: string;
    apk_h5?: string;
    apk_title?: string;
    apk_desc?: string;
    maintain?: MaintainInfo | null;
    feature_switch?: FeatureSwitchInfo;
    server_time_ms?: number;
}

export class NetworkSystem extends AbstractSystem {
    private readonly client = new DueWebSocketClient();
    private httpBaseUrl = GateHttpDefaults.baseUrls[0];
    private gateUrl = GATE_WEBSOCKET_URL;

    protected OnInit(): void {}

    protected OnDeinit(): void {
        this.client.close();
    }

    public get isConnected(): boolean {
        return this.client.connected;
    }

    public get resolvedHttpBase(): string {
        return this.httpBaseUrl;
    }

    public async resolveHttpBase(): Promise<string> {
        const cached = sys.localStorage.getItem(GateHttpDefaults.cachedBaseKey);
        const candidates = cached ? [cached, ...GateHttpDefaults.baseUrls] : [...GateHttpDefaults.baseUrls];
        const unique = [...new Set(candidates)];
        for (const base of unique) {
            try {
                await dueHttpGet(`${base}${GateHttpDefaults.healthPath}`, GateHttpDefaults.httpTimeoutMs);
                this.httpBaseUrl = base.replace(/\/$/, "");
                sys.localStorage.setItem(GateHttpDefaults.cachedBaseKey, this.httpBaseUrl);
                return this.httpBaseUrl;
            } catch {
                LogKit.W("[NetworkSystem] http base unreachable {0}", base);
            }
        }
        this.httpBaseUrl = GateHttpDefaults.baseUrls[0].replace(/\/$/, "");
        return this.httpBaseUrl;
    }

    public async fetchBootstrap(): Promise<BootstrapDataDto> {
        const url = `${this.httpBaseUrl}${GateHttpDefaults.bootstrapPath}`;
        const raw = await dueHttpGet(url, GateHttpDefaults.httpTimeoutMs);
        const parsed = JSON.parse(raw) as { code?: number; data?: BootstrapDataDto | { code?: number; data?: BootstrapDataDto } };
        let data: BootstrapDataDto;
        if (parsed.data && typeof parsed.data === "object" && "data" in parsed.data) {
            data = (parsed.data as { data?: BootstrapDataDto }).data ?? {};
        } else {
            data = (parsed.data as BootstrapDataDto) ?? (parsed as BootstrapDataDto);
        }
        if (data.ws_gate_urls?.length) {
            this.gateUrl = data.ws_gate_urls[0];
        }
        return data;
    }

    public async sendOtp(phone: string): Promise<number> {
        const url = `${this.httpBaseUrl}${GateHttpDefaults.otpSendPath}`;
        const raw = await dueHttpPost(url, { phone }, GateHttpDefaults.httpTimeoutMs);
        const parsed = JSON.parse(raw) as { data?: { timeout_sec?: number } };
        return parsed.data?.timeout_sec ?? 60;
    }

    public connect(gateUrl?: string): Promise<void> {
        const url = gateUrl ?? this.gateUrl;
        LogKit.I("[NetworkSystem] connect gate={0}", url);
        return this.client.connect(url);
    }

    public disconnect(): void {
        this.client.close();
    }

    public async login(account: string, password: string): Promise<void> {
        await this.loginWithRoute(ROUTE_LOBBY_LOGIN, { account, password }, account.trim());
    }

    public async loginGuest(deviceId: string): Promise<void> {
        await this.loginWithRoute(LobbyRoute.Guest, { device_id: deviceId }, `guest:${deviceId}`);
    }

    public async loginOtp(phone: string, code: string): Promise<void> {
        await this.loginWithRoute(LobbyRoute.Otp, { phone, code }, phone);
    }

    public async loginFacebook(token: string): Promise<void> {
        await this.loginWithRoute(LobbyRoute.Facebook, { access_token: token }, "facebook");
    }

    public async loginGoogle(token: string): Promise<void> {
        await this.loginWithRoute(LobbyRoute.Google, { access_token: token }, "google");
    }

    public async loginApple(token: string): Promise<void> {
        await this.loginWithRoute(LobbyRoute.Apple, { access_token: token }, "apple");
    }

    private async loginWithRoute(route: number, body: object, accountLabel: string): Promise<void> {
        const label = (accountLabel ?? "").trim();
        if (!label) {
            this.failLogin(label, "account empty");
            return;
        }
        try {
            LogKit.I("[NetworkSystem] login route={0} account={1}", route, label);
            await this.connect();
            const packet = await this.client.call(route, body);
            const json = new TextDecoder().decode(packet.message);
            const res = JSON.parse(json) as LoginRes;
            if (res.code !== DUE_OK_CODE) {
                const hint = DUE_CODE_MESSAGE[res.code] ?? "unknown";
                this.failLogin(label, `login code=${res.code} (${hint})`, res.code);
                return;
            }
            const uid = res.uid ?? 0;
            const session = this.GetModel(SessionModel);
            session.uid = uid;
            session.account = label;
            this.SendEvent(new LoginSuccessEvent(uid, label));
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.failLogin(label, message);
        }
    }

    private failLogin(account: string, message: string, code = -1): void {
        LogKit.W("[NetworkSystem] login fail account={0} code={1} msg={2}", account, code, message);
        this.SendEvent(new LoginFailedEvent(account, message, code));
    }

    /** Generic lobby node RPC (post-login, Auth middleware). */
    public async callLobby<T extends { code?: number }>(route: number, body: object = {}): Promise<T> {
        if (!this.client.connected) {
            await this.connect();
        }
        const packet = await this.client.call(route, body);
        const json = new TextDecoder().decode(packet.message);
        const res = JSON.parse(json) as T;
        const code = res.code ?? DUE_OK_CODE;
        if (code !== DUE_OK_CODE) {
            const hint = DUE_CODE_MESSAGE[code] ?? "unknown";
            throw new Error(`lobby route=${route} code=${code} (${hint})`);
        }
        return res;
    }
}

// #region Due HTTP transport (private)

async function dueHttpGet(url: string, timeoutMs: number): Promise<string> {
    return dueHttpRequest(url, "GET", undefined, timeoutMs);
}

async function dueHttpPost(url: string, body: object, timeoutMs: number): Promise<string> {
    return dueHttpRequest(url, "POST", JSON.stringify(body), timeoutMs);
}

function dueHttpRequest(url: string, method: string, body: string | undefined, timeoutMs: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.timeout = timeoutMs;
        xhr.open(method, url, true);
        if (body) {
            xhr.setRequestHeader("Content-Type", "application/json");
        }
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.responseText);
            } else {
                reject(new Error(`HTTP ${xhr.status}`));
            }
        };
        xhr.onerror = () => reject(new Error("HTTP network error"));
        xhr.ontimeout = () => reject(new Error("HTTP timeout"));
        xhr.send(body ?? null);
    });
}

// #endregion

// #region Due transport (private — do not split into utility files)

interface DueDataPacket {
    route: number;
    seq: number;
    message: Uint8Array;
}

const PACKET_ROUTE_BYTES = 2;
const PACKET_SEQ_BYTES = 2;
const PACKET_HEADER_HEARTBEAT = 0x80;

class DuePacketCodec {
    public static encodeDataPacket(route: number, seq: number, message: Uint8Array): ArrayBuffer {
        const payloadLen = 1 + PACKET_ROUTE_BYTES + PACKET_SEQ_BYTES + message.length;
        const buf = new ArrayBuffer(4 + payloadLen);
        const view = new DataView(buf);
        view.setUint32(0, payloadLen, false);
        view.setUint8(4, 0);
        view.setInt16(5, route, false);
        view.setInt16(7, seq, false);
        new Uint8Array(buf, 9).set(message);
        return buf;
    }

    public static encodeHeartbeat(): ArrayBuffer {
        const buf = new ArrayBuffer(5);
        const view = new DataView(buf);
        view.setUint32(0, 1, false);
        view.setUint8(4, PACKET_HEADER_HEARTBEAT);
        return buf;
    }

    public static decode(buffer: ArrayBuffer): DueDataPacket | null {
        if (buffer.byteLength < 5) {
            return null;
        }
        const view = new DataView(buffer);
        const size = view.getUint32(0, false);
        if (size + 4 > buffer.byteLength) {
            return null;
        }
        const header = view.getUint8(4);
        if ((header & PACKET_HEADER_HEARTBEAT) !== 0) {
            return null;
        }
        const route = view.getInt16(5, false);
        const seq = view.getInt16(7, false);
        const msgStart = 4 + 1 + PACKET_ROUTE_BYTES + PACKET_SEQ_BYTES;
        const message = new Uint8Array(buffer, msgStart, size - 1 - PACKET_ROUTE_BYTES - PACKET_SEQ_BYTES);
        return { route, seq, message };
    }

    public static isHeartbeat(buffer: ArrayBuffer): boolean {
        if (buffer.byteLength < 5) {
            return false;
        }
        const view = new DataView(buffer);
        const size = view.getUint32(0, false);
        if (size !== 1 && size !== 9) {
            return false;
        }
        return (view.getUint8(4) & PACKET_HEADER_HEARTBEAT) !== 0;
    }
}

type PendingCall = {
    route: number;
    seq: number;
    resolve: (packet: DueDataPacket) => void;
    reject: (err: Error) => void;
    timer: ReturnType<typeof setTimeout>;
};

function formatNetworkPayload(bytes: Uint8Array, maxLen = 1024): string {
    if (!bytes || bytes.length === 0) {
        return "";
    }
    try {
        const text = new TextDecoder().decode(bytes);
        return text.length > maxLen ? `${text.slice(0, maxLen)}...` : text;
    } catch {
        return `<binary ${bytes.length}B>`;
    }
}

class DueWebSocketClient {
    private ws: WebSocket = null;
    private seq = 0;
    private pending: PendingCall | null = null;
    private callQueue: (() => void)[] = [];
    private callInFlight = false;
    private heartbeatTimer: ReturnType<typeof setInterval> = null;
    private connectPromise: Promise<void> | null = null;
    private readonly defaultUrl: string;
    private readonly callTimeoutMs: number;
    private readonly heartbeatMs: number;

    public constructor(
        defaultUrl: string = GATE_WEBSOCKET_URL,
        callTimeoutMs: number = CALL_TIMEOUT_MS,
        heartbeatMs: number = HEARTBEAT_INTERVAL_MS,
    ) {
        this.defaultUrl = defaultUrl;
        this.callTimeoutMs = callTimeoutMs;
        this.heartbeatMs = heartbeatMs;
    }

    public get connected(): boolean {
        return this.ws != null && this.ws.readyState === WebSocket.OPEN;
    }

    public connect(url?: string): Promise<void> {
        const target = url ?? this.defaultUrl;
        if (this.connected) {
            return Promise.resolve();
        }
        if (this.connectPromise) {
            return this.connectPromise;
        }
        LogKit.I("[DueWS] connecting {0}", target);
        this.connectPromise = new Promise((resolve, reject) => {
            const ws = new WebSocket(target);
            ws.binaryType = "arraybuffer";
            this.ws = ws;

            ws.onopen = () => {
                LogKit.I("[DueWS] connected {0}", target);
                this.startHeartbeat();
                this.connectPromise = null;
                resolve();
            };
            ws.onerror = () => {
                LogKit.E("[DueWS] error url={0}", target);
                this.connectPromise = null;
                reject(new Error(`WebSocket error: ${target}`));
            };
            ws.onclose = (ev) => {
                LogKit.W("[DueWS] closed url={0} code={1} reason={2}", target, ev.code, ev.reason || "-");
                this.stopHeartbeat();
                this.ws = null;
                this.rejectPending(new Error("WebSocket closed"));
            };
            ws.onmessage = (ev) => this.onMessage(ev.data as ArrayBuffer);
        });
        return this.connectPromise;
    }

    public close(): void {
        this.stopHeartbeat();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.rejectPending(new Error("WebSocket closed by client"));
    }

    public call(route: number, req: object, timeoutMs?: number): Promise<DueDataPacket> {
        const body = new TextEncoder().encode(JSON.stringify(req));
        const timeout = timeoutMs ?? this.callTimeoutMs;
        return this.enqueueCall(() => this.callInternal(route, body, timeout));
    }

    private enqueueCall<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            const run = () => {
                this.callInFlight = true;
                fn()
                    .then(resolve, reject)
                    .finally(() => {
                        this.callInFlight = false;
                        const next = this.callQueue.shift();
                        if (next) {
                            next();
                        }
                    });
            };
            if (this.callInFlight) {
                this.callQueue.push(run);
            } else {
                run();
            }
        });
    }

    private callInternal(route: number, body: Uint8Array, timeoutMs: number): Promise<DueDataPacket> {
        if (!this.connected) {
            return Promise.reject(new Error("WebSocket not connected"));
        }
        if (this.pending) {
            return Promise.reject(new Error("Due client: concurrent call"));
        }
        const seq = this.nextSeq();
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                if (this.pending) {
                    this.pending = null;
                }
                LogKit.E("[DueWS] TIMEOUT route={0} seq={1} ms={2}", route, seq, timeoutMs);
                reject(new Error(`call route ${route} timeout`));
            }, timeoutMs);

            this.pending = { route, seq, resolve, reject, timer };
            const packet = DuePacketCodec.encodeDataPacket(route, seq, body);
            LogKit.I("[DueWS] >>> REQ route={0} seq={1} body={2}", route, seq, formatNetworkPayload(body));
            this.ws.send(packet);
        });
    }

    private onMessage(data: ArrayBuffer): void {
        if (DuePacketCodec.isHeartbeat(data)) {
            LogKit.I("[DueWS] <<< HB bytes={0}", data.byteLength);
            return;
        }
        const decoded = DuePacketCodec.decode(data);
        if (!decoded) {
            LogKit.W("[DueWS] <<< unknown frame bytes={0}", data.byteLength);
            return;
        }
        const bodyText = formatNetworkPayload(decoded.message);
        if (this.pending && decoded.seq === this.pending.seq) {
            const p = this.pending;
            this.pending = null;
            clearTimeout(p.timer);
            LogKit.I("[DueWS] <<< RES route={0} seq={1} body={2}", decoded.route, decoded.seq, bodyText);
            p.resolve(decoded);
            return;
        }
        if (this.pending && decoded.seq > 0) {
            LogKit.W(
                "[DueWS] <<< RES seq mismatch expect={0} got={1} route={2} body={3}",
                this.pending.seq,
                decoded.seq,
                decoded.route,
                bodyText,
            );
        } else {
            LogKit.I("[DueWS] <<< PUSH route={0} seq={1} body={2}", decoded.route, decoded.seq, bodyText);
        }
    }

    private nextSeq(): number {
        do {
            this.seq = (this.seq + 1) | 0;
        } while (this.seq <= 0);
        return this.seq;
    }

    private rejectPending(err: Error): void {
        if (this.pending) {
            clearTimeout(this.pending.timer);
            this.pending.reject(err);
            this.pending = null;
        }
    }

    private startHeartbeat(): void {
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            if (this.connected) {
                this.ws.send(DuePacketCodec.encodeHeartbeat());
            }
        }, this.heartbeatMs);
    }

    private stopHeartbeat(): void {
        if (this.heartbeatTimer != null) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
}

// #endregion
