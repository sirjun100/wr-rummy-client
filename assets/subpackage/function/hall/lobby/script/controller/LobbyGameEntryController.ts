import { _decorator, Component, find, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { HALL_ACT_BUTTON_NODES } from "../config/LobbyConfig";
import { LobbyModel } from "../model/LobbyModel";

const { ccclass, property } = _decorator;

@ccclass("LobbyGameEntryController")
export class LobbyGameEntryController extends Component {
    @property(Node)
    gameEntryPageNode: Node | null = null;

    protected onLoad(): void {
        const model = GameApp.Interface.GetModel(LobbyModel);
        model.gameEntryActIds.RegisterWithInitValue((ids) => this.applyEntryVisibility(ids), this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
        model.home.RegisterWithInitValue((home) => {
            if (this.gameEntryPageNode) {
                this.gameEntryPageNode.active = home.show_sgame === 1;
            }
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);
    }

    private applyEntryVisibility(actIds: number[]): void {
        const root = this.gameEntryPageNode ?? this.node;
        for (const [actId, nodeName] of Object.entries(HALL_ACT_BUTTON_NODES)) {
            const id = Number(actId);
            const n = find(nodeName, root) ?? find(nodeName, this.node);
            if (n) {
                n.active = actIds.includes(id);
            }
        }
    }
}
