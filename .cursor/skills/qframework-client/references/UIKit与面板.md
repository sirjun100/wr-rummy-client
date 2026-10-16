# UIKit 与面板

源码：`assets/script/framework/toolkits/uiKit/UIKit.ts`。

## 初始化

在 `GameApp.Init()` 中：

```typescript
ResKit.Init();
UIKit.UseResKitLoader();
```

`UseResKitLoader()` 将 `UIKit.Config.PanelLoaderPool` 设为 `ResKitPanelLoaderPool`，面板 prefab 走 ResKit。

## UIPanel 生命周期

1. `UIKit.OpenPanel` → 加载 prefab → `panel.Init(uiData)` → `OnInit`
2. `Open` → `OnOpen`（`State = Opening`）
3. `Show` → 节点 `active = true` → `OnShow`
4. `Hide` → `OnHide`
5. `Close(destroy?)` → `OnClose` → 可选 `node.destroy()`、回收 Loader

子类必须实现 `protected abstract OnClose(): void`。

面板内关闭自身：`BaseDialog.CloseSelf()` → `UISystem.closeDialog`（带动效）；勿在业务层直接 `UIKit.ClosePanel`。

## UIKit 常用静态 API

| API | 用途 |
|-----|------|
| `OpenPanel(panelType, level?, uiData?, bundle?, prefab?, openType?)` | 同步打开 |
| `OpenPanelAsync(panelType, onLoaded, ...)` | 异步打开 |
| `OpenPanelWithData` / `OpenPanelWithOpenType` | C# 重载对齐 |
| `OpenPanelByName(name, level?, bundle?)` | 按 prefab 名 |
| `ClosePanel(type \| name \| UIPanel)` | 关闭 |
| `GetPanel(panelType)` | 获取已打开实例 |
| `RegisterPanel(panelType, prefabName)` | 类名与 prefab 路径不一致时注册 |
| `Back(name?)` | 栈回退 |
| `Stack` | `UIPanelStack` Push/Pop |

## UILevel / PanelOpenType

- `UILevel`：`Bg` / `Common` / `PopUI` / `CanvasPanel`
- `PanelOpenType.Single`：同类型单例复用；`Multiple` 可多开

## IUIData

打开面板时传入的数据对象，实现 `IUIData` 或继承 `UIPanelData`。

## 项目约定

- 新面板：`export class FooPanel extends UIPanel`，`@ccclass("FooPanel")` 与类名一致。
- 迁移期可 `extends BasePanel`（旧工程 `BasePanel extends UIPanel`），新功能优先直接 `UIPanel` 或项目统一基类放在 `game/` 下。
- Panel 脚本放在 bundle 的 `script/`；prefab 在 `prefab/`；通过 `OpenPanel(FooPanel, ..., bundleName)` 加载。

## UISystem（业务门面）

- 打开：`GetSystem(UISystem).openDialogAsync(PanelClass, BundleKey, prefabName, options?)`
- resources 面板：`openResourcesDialogAsync(PanelClass, "ui/dialog/.../Foo", options?)`
- 关闭：`closeDialog(panel, options?)`
- 场景切换仍用 `BundleSystem.enterGame` / `goLobby`，不由 UISystem 负责。

## 禁止

- Controller / Panel 内 `cc.resources.load` 打开 UI（应 `UISystem`）。
- 业务层直接 `UIKit.OpenPanel` / `AudioKit.PlaySound`（应 `UISystem` / `AudioSystem`）。
- 多个 `@ccclass` 写在同一文件（Cocos 限制；`ViewController` 代码生成组件单独文件）。
