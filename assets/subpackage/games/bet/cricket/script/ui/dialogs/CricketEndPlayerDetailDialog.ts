import { _decorator } from "cc";
import { GameApp } from "../../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../../script/game/controller/engine/BaseDialog";
import { IUIData } from "../../../../../../script/framework/toolkits/uiKit/UIKit";
import { FetchCricketEndPlayerDetailCommand } from "../../command/FetchCricketEndPlayerDetailCommand";
import { CricketOpenData } from "../../config/CricketProtocol";

const { ccclass } = _decorator;

@ccclass("CricketEndPlayerDetailDialog")
export class CricketEndPlayerDetailDialog extends BaseDialog {
    protected OnInit(uiData: IUIData = null): void {
        const data = (uiData as CricketOpenData & { player_id?: number }) ?? {};
        GameApp.Interface.SendCommand(new FetchCricketEndPlayerDetailCommand(data));
    }

    protected OnClose(): void {}
}
