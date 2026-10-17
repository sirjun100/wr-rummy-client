/** 与 wr-rummy-server api/protocol 对齐 */

export enum LoginType {
    Guest = "0",
    Facebook = "1",
    Password = "2",
    Otp = "3",
    Apple = "5",
    Google = "7",
}

export const LobbyRoute = {
    Login: 1001,
    Guest: 1002,
    Otp: 1003,
    Facebook: 1004,
    Google: 1005,
    Apple: 1006,
} as const;

export const GateHttpDefaults = {
    baseUrls: ["http://127.0.0.1:8080"],
    healthPath: "/health",
    bootstrapPath: "/v1/bootstrap",
    otpSendPath: "/v1/auth/otp/send",
    httpTimeoutMs: 8000,
    cachedBaseKey: "wr_due_http_base",
} as const;

export const GateWsDefaults = {
    url: "ws://127.0.0.1:3553/",
} as const;

export const DemoPassword = "123456";

export const StartupSteps = [
    { id: 0, label: "init", start: 0, end: 0.15 },
    { id: 1, label: "bootstrap", start: 0.15, end: 0.35 },
    { id: 2, label: "hotupdate", start: 0.35, end: 0.7 },
    { id: 3, label: "login", start: 0.7, end: 0.9 },
    { id: 4, label: "lobby", start: 0.9, end: 1 },
] as const;
