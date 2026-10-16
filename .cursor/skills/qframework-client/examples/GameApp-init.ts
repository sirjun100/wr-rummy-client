/**
 * 架构入口模板 — 对应 assets/script/game/GameApp.ts
 * 挂载：无需挂载；Controller 通过 BaseController.GetArchitecture() → GameApp.Interface 懒初始化
 */
import { Architecture } from "../framework/QFramework"; // 示例路径，实际为 ../../framework/...
import { ResKit } from "../framework/toolkits/resKit/ResKit";
import { UIKit } from "../framework/toolkits/uiKit/UIKit";

export class GameApp extends Architecture<GameApp> {
    protected Init(): void {
        ResKit.Init();
        UIKit.UseResKitLoader();
        // this.RegisterSystem(new NetworkSystem());
        // this.RegisterModel(new UserModel());
    }
}
