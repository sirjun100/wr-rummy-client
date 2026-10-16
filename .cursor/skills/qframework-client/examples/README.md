# examples 说明

本目录为**参考片段**，不参与 Cocos 编译。复制到 `assets/script/game/` 或 subpackage 时调整 import 路径。

| 文件 | 复制目标建议 |
|------|----------------|
| GameApp-init.ts | `game/GameApp.ts` |
| RegisterSystem.ts | `GameApp.Init()` 片段 |
| MainController.ts | `game/controller/` |
| TypedEvent.ts | `game/event/` |
| Command-Query.ts | `game/command/`、`game/query/` |
| OpenPanel.ts | Controller 或 System 内调用 |
