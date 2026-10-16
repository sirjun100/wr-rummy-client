# 网络与 Due 对接

## 落点

- 客户端网络实现放在 `game/system/NetworkSystem.ts`（**单文件自包含**）。
- 在 `GameApp.Init()` 中 `this.RegisterSystem(new NetworkSystem())`。
- Controller / Command **不**直接持有 Socket；通过 `GetSystem(NetworkSystem)` 发请求或订阅推送。

## NetworkSystem 自包含规范

`NetworkSystem.ts` 结构：

1. **文件顶部**：网关 URL、超时、路由号、Due 错误码等常量（可按环境改）。
2. **`export class NetworkSystem`**：业务 API（`connect` / `login` / 后续 RPC）。
3. **文件底部 `#region Due transport`（不 export）**：`DuePacketCodec`、`DueWebSocketClient` 等传输实现。

**禁止**将 Due 包编解码或 WebSocket 客户端拆到 `game/utility/` 或其它 System；保证复制一个文件即可迁移完整网络能力（另需 QFramework、`SessionModel`、登录相关 Event）。

协议：Due v2 数据包 `size|header|route|seq|message`（与 gate `etc.toml` `[packet]` 一致）。服务端细节见 `wr-rummy-server/.cursor/skills/due-v2/references/框架设计/通信协议.md`。

## 与架构协作

- 收到推送 → `NetworkSystem` 内解析后 `SendEvent(XxxPushEvent)`（日志前缀 `[DueWS] <<< PUSH`）。
- 用户操作 → `LoginCommand` → `NetworkSystem.login` → `LoginSuccessEvent` / `LoginFailedEvent`。
- 会话 `uid` / `account` 写入 `SessionModel`。

## 禁止

- Panel 内 `new WebSocket()`。
- 独立的 `DueWebSocketClient.ts` / `DuePacketCodec.ts`（已合并进 NetworkSystem）。
- 硬编码 gate 散落在多个文件（集中在 `NetworkSystem.ts` 顶部常量）。
