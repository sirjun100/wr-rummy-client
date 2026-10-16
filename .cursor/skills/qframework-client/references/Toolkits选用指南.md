# Toolkits 选用指南

路径：`assets/script/framework/toolkits/`。

## 优先顺序

1. **架构能力**（`QFramework`）：跨模块业务用 System / Model / Command / 类型事件。
2. **UIKit / ResKit**：UI 与资源。
3. **其他 Toolkit**：局部技术能力，不替代架构分层。

## 常用 Kit

| Kit | 用途 | 注意 |
|-----|------|------|
| `LogKit` | 分级日志 `I/W/E` | 替代 `console.log` |
| `EventKit` / `StringEventSystem` | 字符串 key 事件 | 架构内频道总线请用 `GameEventSystem` 包装 |
| `FSMKit` | 有限状态机 | 单玩法/单 UI 流程 |
| `LocaleKit` / `LocaleText` | 多语言 | 与 bundle `config` 语言表配合 |
| `AudioKit` | 音效 BGM 内核 | **业务只通过** `game/system/AudioSystem`；子包 `BundleKey.Sound` |
| `PoolKit` | 对象池 | UIKit 内部已用；业务节点池可复用 |
| `SingletonKit` | `MonoSingleton` | UIKit UIManager 等；**新业务 Singleton Manager 禁止** |
| `ActionKit` | 动作序列 | 动画/延时链 |
| `TableKit` / `GridKit` / `GraphKit` | 数据结构/UI 辅助 | 按玩法选用 |
| `codeGenKit` | 编辑器绑定生成 | `ViewController` + `Bind` |
| `IOCKit` | 独立 IOC | **不要**与 `Architecture` 双轨全局 DI |

## GameEventSystem（项目层）

旧工程 `GameEventSystem extends AbstractSystem` 用 `StringEventSystem` 做 `emit(channel, payload)` / `on(channel, ...)`。

- 适合：遗留 `PushEvent` 字符串、数字 jump id、全局 UI 栈通知。
- 不适合：新业务核心状态变更（优先类型事件 class + `SendEvent`）。

## 日志与调试

- 开发调试可用 `ConsoleKit`（若启用）；提交代码路径用 `LogKit`。
