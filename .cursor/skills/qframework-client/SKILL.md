---
name: qframework-client
description: >-
  wr-rummy-client Cocos Creator + QFramework 架构开发指南。涵盖 Architecture 分层、Controller/System/Model/Command/Query、
  类型事件、UIKit/ResKit、Bundle 目录与 Toolkits 选用。在修改 wr-rummy-client 脚本、subpackage 业务、面板与资源加载时使用。
---

# wr-rummy-client QFramework 开发参考

本技能包约束 **wr-rummy-client** 的代码风格与架构落点，对照 [assets/script/framework/QFramework.ts](../../../assets/script/framework/QFramework.ts) 与现有 [GameApp](../../../assets/script/game/GameApp.ts) 编写。

## 关键约定（速查）

> 以下已对照当前仓库 `QFramework.ts` / `UIKit.ts` / `ResKit.ts` 核实；**禁止**使用不存在的 API 或 Unity/C# 独有写法。

- **架构入口**：业务通过 `GameApp.Interface`（`Architecture` 内置 `InitArchitecture()`，首次访问自动 `Init()`）；`GameApp.Init()` 内注册 System/Model/Utility，并固定 `ResKit.Init()` + `UIKit.UseResKitLoader()`。
- **分层目录**：新逻辑落在 `assets/script/game/<layer>/` 或 subpackage 的 `.../script/`；`game` 层含 `command` / `controller` / `event` / `model` / `query` / `system` / `utility`。
- **Controller**：继承 `AbstractController`，实现 `GetArchitecture(): IArchitecture` 并返回 `GameApp.Interface`；**不存在** `IController` 的默认 `GetArchitecture` 实现。
- **System / Model**：分别继承 `AbstractSystem` / `AbstractModel`；生命周期为 `OnInit` / `OnDeinit`（`Init()`/`Deinit()` 由基类调用）。
- **Command / Query**：继承 `AbstractCommand` / `AbstractQuery`（或 `AbstractCommandWithResult` / `AbstractQuery`）；通过 `SendCommand` / `SendQuery` 触发，**不存在** `Architecture.Execute` 对外 API。
- **类型事件**：`SendEvent` / `RegisterEvent` **必须**使用事件 **class**（如 `RegisterEvent(LoginSuccessEvent, handler, this)`）；**不存在** `RegisterEvent(string, ...)` 的架构事件 API。
- **泛型 Token**：`GetModel` / `GetSystem` / `GetUtility` 必须传入类引用：`GetSystem(NetworkSystem)`；裸 `GetSystem<NetworkSystem>()` 运行时会抛错。
- **注销**：`RegisterEvent` 返回 `IUnRegister`；挂在 Component 上须 `UnRegisterWhenGameObjectDestroyed(node)` 或 `UnRegisterWhenDisabled(node)`。
- **频道事件（迁移）**：字符串/数字频道用 `GameEventSystem`（`game/system`），**不要**与架构 `TypeEventSystem` 混用同一 channel 语义。
- **UI**：业务打开/关闭 Dialog 用 `GetSystem(UISystem).openDialogAsync` / `closeDialog`（内部 UIKit + 动效）；面板脚本继承 `UIPanel` / `BaseDialog`。**不存在** `UIKit.ShowPanel`；避免业务直接 `UIKit.OpenPanel`。
- **音频**：`GetSystem(AudioSystem).playFx` / `preloadCommon` / `switchBgm`；勿 `SoundManager.shared()` 或业务直接 `AudioKit`。
- **资源**：全局初始化 `ResKit.Init()`；面板经 `UIKit.UseResKitLoader()`；直接加载可用 `ResKit.LoadAsync` / `ResLoader.Allocate()`。**不存在** `ResKit.LoadBundle` 静态方法名（用 `ResLoader` + bundle 名）。
- **框架边界**：`assets/script/framework/**` 为移植内核；业务功能加在 `game/` 或薄包装类，**禁止**在业务中复制 IOC/事件总线。
- **命名**：与 C# QF 对齐 — 框架约定方法/类为 **PascalCase**；新业务 **具名 export**，新代码避免 `export default`（迁移旧文件除外）。
- **日志**：使用 `LogKit`（`LogKit.I/W/E`），避免生产路径裸 `console.log`。
- **Bundle 目录**：每 bundle 仅允许 `audio` / `config` / `prefab` / `script` / `effect` / `texture`；`scene` 放在 bundle 根目录（见 [AI.txt](../../../../AI.txt)）。
- **Bundle 标识**：`BundleKey`（21 个资源包）用于 Manifest / `openDialogAsync`；`SubGameId`（6 个可进局玩法）用于 `enterGame` / `GameplayContextModel`。**勿**用单一 `GameId` 混表示大厅与活动。
- **工具类**：无状态 helpers 在 `game/utility/`（如 `NodeUtil`、`ChipFormatUtil`）；**勿**恢复旧 `ToolUtils` Component；对照 [反模式与迁移](references/反模式与迁移.md) ToolUtils 表。
- **NetworkSystem 自包含**：Due 编解码、WebSocket、心跳、RPC 与业务入口均在 [`game/system/NetworkSystem.ts`](../../../assets/script/game/system/NetworkSystem.ts) 单文件内（文件底部 `#region Due transport`）；**禁止**拆到 `utility/DuePacketCodec` 等分散文件。拷贝到其他项目时带走该 System 文件 + `GameApp` 注册 + 依赖的 Model/Event 即可。
- **PlatformSystem 自包含**：设备标识、原生 JNI/iOS 桥、权限/定位/分享/归因等均在 [`game/system/PlatformSystem.ts`](../../../assets/script/game/system/PlatformSystem.ts) 单文件（`IPlatform` + `WebPlatform` / `AndroidPlatform` / `IosPlatform`）；频道回调用 `GameEventSystem` + `PushEvent`。

## Agent 工作流（每次改 client 前）

1. 判定属于哪一层 → 文件落在 `game/<layer>/` 或 subpackage `script/`。
2. 新 System/Model/Utility → 仅在 `GameApp.Init()` 注册。
3. 监听/广播 → **架构事件 class** 或 **GameEventSystem 频道**（二选一，见 [事件总线与注销](references/事件总线与注销.md)）。
4. 涉及 UI → `UIKit` + bundle 名 / prefab 名；必要时 `UIKit.RegisterPanel`。
5. 改网络 → 只改 `NetworkSystem.ts` 单文件，保持传输层与 System 同文件。
6. 自检 [反模式与迁移](references/反模式与迁移.md)。

## 参考文档（references/）

| 文档 | 说明 |
|------|------|
| [架构与分层](references/架构与分层.md) | 依赖方向与各层职责 |
| [QFramework-API速查](references/QFramework-API速查.md) | 架构 API 与禁止幻觉列表 |
| [UIKit与面板](references/UIKit与面板.md) | UIPanel 生命周期与 Open/Close |
| [ResKit与Bundle](references/ResKit与Bundle.md) | ResLoader、subpackage 资源 |
| [Toolkits选用指南](references/Toolkits选用指南.md) | LogKit、FSMKit、LocaleKit 等 |
| [事件总线与注销](references/事件总线与注销.md) | TypeEvent vs GameEventSystem |
| [网络与Due对接](references/网络与Due对接.md) | NetworkSystem 落点与协议引用 |
| [反模式与迁移](references/反模式与迁移.md) | 旧工程习惯 vs 新规范 |

## 示例代码（examples/）

| 示例 | 说明 |
|------|------|
| [GameApp-init.ts](examples/GameApp-init.ts) | 架构入口与 Toolkit 初始化 |
| [RegisterSystem.ts](examples/RegisterSystem.ts) | 在 Init 中注册 System |
| [MainController.ts](examples/MainController.ts) | AbstractController 模板 |
| [TypedEvent.ts](examples/TypedEvent.ts) | 事件 class + RegisterEvent |
| [Command-Query.ts](examples/Command-Query.ts) | Command / Query 模板 |
| [OpenPanel.ts](examples/OpenPanel.ts) | UIKit 打开面板 |

验收用业务骨架（须符合本技能）：`game/command/LoginCommand.ts`、`game/controller/LoginController.ts`、`game/event/LoginSuccessEvent.ts`。
