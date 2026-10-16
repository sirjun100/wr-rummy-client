# ResKit 与 Bundle

源码：`assets/script/framework/toolkits/resKit/ResKit.ts`。

## 初始化

```typescript
ResKit.Init();        // 同步，内部 ResMgr.Init()
ResKit.InitAsync(done); // 可选异步
```

须在 `GameApp.Init()` 最早调用（UIKit 依赖 ResKit 时在其前）。

## 高层 API

| API | 说明 |
|-----|------|
| `ResKit.ToResourcesAssetName(path)` | 转为 `resources://...` |
| `ResKit.LoadAsync(pathUnderResources, assetType?)` | Promise 加载 resources 下资源并 Retain |
| `ResKit.LoadSync(pathUnderResources, assetType?)` | 同步（需已缓存） |

路径相对 `assets/resources/`，无扩展名。

## ResLoader（细粒度）

```typescript
const loader = ResLoader.Allocate();
ResLoaderAdd2Load(loader, assetName, callback, true, cc.Prefab);
ResLoaderAdd2LoadWithBundle(loader, bundleName, assetName, ...);
loader.LoadAsync();
// 用完 loader.Recycle2Cache() — 除非长期持有（见 ResKit 内部 persistLoader）
```

UIKit 的 `ResKitPanelLoader` 内部使用 `ResLoader` + `AssetBundleName`。

## subpackage / Asset Bundle

- `OpenPanel(..., assetBundleName, prefabName)` 的 bundle 名与 Cocos 构建配置一致。
- 业务常量集中放在 `game/` 或 `config`（如 `BundleNameDefined`），避免魔法字符串散落。

## 与 AI.txt 目录关系

每个 bundle 根下仅：`audio` / `config` / `prefab` / `script` / `effect` / `texture`；场景在 bundle 根。

资源路径设计应使 prefab 引用与 `script` 中 `OpenPanel` 的 bundle 名一致。

## 禁止幻觉

- `ResKit.LoadBundle(name)` — **不存在**；用 `assetManager.loadBundle` 或 ResLoader bundle API。
- 在 Model/Utility 中长期 `Allocate()` 却不 `Recycle2Cache` — 易泄漏；短生命周期加载用 `ResKit.LoadAsync` 或明确生命周期。
