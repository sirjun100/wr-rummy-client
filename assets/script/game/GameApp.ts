import { Architecture } from "../framework/QFramework";
import { ResKit } from "../framework/toolkits/resKit/ResKit";
import { UIKit } from "../framework/toolkits/uiKit/UIKit";
import { GameplayContextModel } from "./model/GameplayContextModel";
import { SessionModel } from "./model/SessionModel";
import { AudioSystem } from "./system/AudioSystem";
import { BundleSystem } from "./system/BundleSystem";
import { I18NSystem } from "./system/I18NSystem";
import { NetworkSystem } from "./system/NetworkSystem";
import { UISystem } from "./system/UISystem";
import { AudioKit } from "../framework/toolkits/audioKit/AudioKit";

export class GameApp extends Architecture<GameApp> {
    protected Init(): void {
        ResKit.Init();
        UIKit.UseResKitLoader();
        AudioKit.UseResKitLoader();

        this.RegisterModel(new SessionModel());
        this.RegisterModel(new GameplayContextModel());
        this.RegisterSystem(new I18NSystem());
        this.RegisterSystem(new AudioSystem());
        this.RegisterSystem(new UISystem());
        this.RegisterSystem(new NetworkSystem());
        this.RegisterSystem(new BundleSystem());
    }

}
