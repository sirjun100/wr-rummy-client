import { _decorator, Component, Label, Node } from "cc";
import { GameApp } from "../../../../../../script/game/GameApp";
import { SessionModel } from "../../../../../../script/game/model/SessionModel";
import { RummyHandEndEvent, RummyTableUpdatedEvent, RummyTurnEvent } from "../event/RummyEvents";
import { RummyModel } from "../model/RummyModel";
import { openRummyDialog } from "../RummyGameModule";
import { GameRummyDealsRecordDialog } from "./dialogs/GameRummyDealsRecordDialog";
import { GameRummyPoolDialog } from "./dialogs/GameRummyPoolDialog";
import { RummyGameOverDialog } from "./dialogs/RummyGameOverDialog";

const { ccclass } = _decorator;

@ccclass("RummyMainView")
export class RummyMainView extends Component {
    public openCardNode: Node | null = null;

    protected onLoad(): void {
        GameApp.Interface.RegisterEvent(RummyTableUpdatedEvent, this.onTable, this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
        GameApp.Interface.RegisterEvent(RummyTurnEvent, this.onTurn, this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
        GameApp.Interface.RegisterEvent(RummyHandEndEvent, this.onHandEnd, this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
    }

    private onTable(): void {
        /* panels listen separately */
    }

    private onTurn(e: RummyTurnEvent): void {
        const model = GameApp.Interface.GetModel(RummyModel);
        model.turnCd = e.cd;
    }

    private onHandEnd(e: RummyHandEndEvent): void {
        const model = GameApp.Interface.GetModel(RummyModel);
        void import("../../../../function/tableChrome/roomLeaderboard/script/GameActLeaderboardModule").then((mod) => {
            mod.ensureGameActLeaderboardRegistered();
            void import(
                "../../../../function/tableChrome/roomLeaderboard/script/command/FetchRoomChallengerProgressCommand"
            ).then((cmd) => {
                GameApp.Interface.SendCommand(new cmd.FetchRoomChallengerProgressCommand(model.vid));
            });
        });
        const uid = GameApp.Interface.GetModel(SessionModel).uid;
        void openRummyDialog(RummyGameOverDialog, "RummyGameOverDialog").then((dlg) => {
            dlg?.bindResult(e.winner, e.penalties, uid);
        });
        const fmt = GameApp.Interface.GetModel(RummyModel).table.value?.format ?? "";
        if (fmt.includes("pool")) {
            void openRummyDialog(GameRummyPoolDialog, "GameRummyPoolDialog");
        }
        if (fmt.includes("deals")) {
            void openRummyDialog(GameRummyDealsRecordDialog, "GameRummyDealsRecordDialog");
        }
    }
}
