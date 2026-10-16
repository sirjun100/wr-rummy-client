import { Architecture, IArchitecture } from "../framework/QFramework";
import { ResKit } from "../framework/toolkits/resKit/ResKit";
import { UIKit } from "../framework/toolkits/uiKit/UIKit";


export class GameApp extends Architecture<GameApp> {
    private static sBootstrapped = false;

    protected Init(): void {
        ResKit.Init();
        UIKit.UseResKitLoader();


    }

    /** Idempotent: safe from GameEntry / LoginScene onLoad. */
    public static bootstrap(): IArchitecture {
        if (!GameApp.sBootstrapped) {
            GameApp.sBootstrapped = true;
        }
        return GameApp.InitArchitecture();
    }

    public static get Interface(): IArchitecture {
        return GameApp.bootstrap();
    }
}
