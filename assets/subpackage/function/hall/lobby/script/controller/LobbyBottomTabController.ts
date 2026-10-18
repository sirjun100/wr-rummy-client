import { _decorator, Button, Component, find, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { LobbyTabIndex } from "../config/LobbyConfig";
import { LobbyModel } from "../model/LobbyModel";

const { ccclass, property } = _decorator;

@ccclass("LobbyBottomTabController")
export class LobbyBottomTabController extends Component {
    @property([Node])
    pageNodes: Node[] = [];

    protected onLoad(): void {
        const bind = (name: string, tab: number) => {
            const n = find(name, this.node) ?? find(`Canvas/${name}`, this.node);
            const btn = n?.getComponent(Button);
            btn?.node.on(Button.EventType.CLICK, () => this.selectTab(tab), this);
        };
        bind("btn_lobby", LobbyTabIndex.GameEntry);
        bind("btn_game", LobbyTabIndex.MiniGame);
        bind("btn_invite", LobbyTabIndex.Invite);
        bind("btn_menu", LobbyTabIndex.Menu);

        const model = GameApp.Interface.GetModel(LobbyModel);
        model.selectedTab.RegisterWithInitValue((tab) => this.showPage(tab), this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
        this.selectTab(model.selectedTab.value);
    }

    public selectTab(tab: number): void {
        GameApp.Interface.GetModel(LobbyModel).selectedTab.value = tab;
        this.showPage(tab);
    }

    private showPage(tab: number): void {
        for (let i = 0; i < this.pageNodes.length; i++) {
            const page = this.pageNodes[i];
            if (page) {
                page.active = i === tab;
            }
        }
    }
}
