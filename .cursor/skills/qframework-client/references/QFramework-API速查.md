# QFramework API 速查

源码：`assets/script/framework/QFramework.ts`。

## IArchitecture / GameApp.Interface

| 方法 | 说明 |
|------|------|
| `RegisterModel(model)` | 注册 Model，自动 `SetArchitecture` |
| `RegisterSystem(system)` | 注册 System |
| `RegisterUtility(utility)` | 注册 Utility |
| `GetModel(Token?)` | 须传 `GetModel(FooModel)` |
| `GetSystem(Token?)` | 须传 `GetSystem(BarSystem)` |
| `GetUtility(Token?)` | 须传 token |
| `SendCommand(cmd \| CmdClass)` | 执行命令 |
| `SendQuery(query)` | 执行查询，返回结果 |
| `SendEvent(EventClass)` | 无参广播 |
| `SendEvent(instance)` | 带数据实例广播 |
| `RegisterEvent(EventClass, handler, target?)` | 返回 `IUnRegister` |
| `UnRegisterEvent(EventClass, handler, target?)` | 手动注销 |
| `Deinit()` | 销毁架构（慎用） |

## 成员基类

| 类型 | 扩展点 |
|------|--------|
| `AbstractController` | `GetArchitecture(): IArchitecture`（抽象） |
| `AbstractSystem` | `OnInit()` / `OnDeinit()` |
| `AbstractModel` | `OnInit()` / `OnDeinit()` |
| `AbstractCommand` | `OnExecute()` |
| `AbstractCommandWithResult<TResult>` | `OnExecute(): TResult` |
| `AbstractQuery<TResult>` | `OnDo(): TResult` |

`ArchitectureMember` 子类自动拥有 `GetModel` / `SendCommand` / `RegisterEvent` 等（Command/Query/System/Model）。

## IUnRegister

- `UnRegister()`
- `UnRegisterWhenGameObjectDestroyed(node)`
- `UnRegisterWhenDisabled(node)`
- `UnRegisterWhenCurrentSceneUnloaded()`

## BindableProperty

- `BindableProperty<T>`：`Value`、`Register` / `RegisterWithInitValue`、`UnRegister`

## 禁止幻觉 API（常见误写）

| 误写 | 正确 |
|------|------|
| `RegisterEvent("channel", fn)` | 架构事件用 **Event class**；字符串频道用 `GameEventSystem` |
| `GetSystem<MySys>()` 无参数 | `GetSystem(MySys)` |
| `Architecture.OnGetArchitecture` | Controller 实现 `GetArchitecture()` |
| `ctx.Abort()` / `Router.Use` | 服务端 Due API，客户端不存在 |
| `UIKit.Show()` | `UIKit.OpenPanel` / `panel.Show()` |
| `IArchitecture.RegisterController` | 不存在；Controller 不注册进 IOC |
| `SendEvent()` 无参且无类型 | 必须传事件 class 或实例 |
| `UnRegister` 小写 `unregister` | 框架 API 为 `UnRegister`（PascalCase） |

## TypeToken

TS 运行时无泛型，`resolveTypeToken` 在 token 缺失时抛错。所有 `GetModel`/`GetSystem`/`GetUtility` 调用都应传入构造函数。
