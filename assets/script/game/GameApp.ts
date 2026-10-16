import { Architecture } from "../framework/QFramework";
import { ResKit } from "../framework/toolkits/resKit/ResKit";
import { UIKit } from "../framework/toolkits/uiKit/UIKit";
import { GameplayContextModel } from "./model/GameplayContextModel";
import { SessionModel } from "./model/SessionModel";
import { BundleSystem } from "./system/BundleSystem";
import { GameEventSystem } from "./system/GameEventSystem";
import { I18NSystem } from "./system/I18NSystem";
import { NetworkSystem } from "./system/NetworkSystem";
import { PlatformSystem } from "./system/PlatformSystem";

export class GameApp extends Architecture<GameApp> {
    protected Init(): void {
        ResKit.Init();
        UIKit.UseResKitLoader();

        this.RegisterModel(new SessionModel());
        this.RegisterModel(new GameplayContextModel());
        this.RegisterSystem(new GameEventSystem());
        this.RegisterSystem(new I18NSystem());
        this.RegisterSystem(new PlatformSystem());
        this.RegisterSystem(new NetworkSystem());
        this.RegisterSystem(new BundleSystem());
    }

}
