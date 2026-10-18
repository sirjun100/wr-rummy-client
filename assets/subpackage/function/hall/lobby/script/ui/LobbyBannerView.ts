import { _decorator, Component, find, Label, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import type { BannerDto } from "../config/LobbyProtocol";
import { LobbyModel } from "../model/LobbyModel";

const { ccclass } = _decorator;

@ccclass("LobbyBannerView")
export class LobbyBannerView extends Component {
    private bannerRoot: Node | null = null;

    protected onLoad(): void {
        this.bannerRoot = this.node;
        const model = GameApp.Interface.GetModel(LobbyModel);
        model.home.RegisterWithInitValue((home) => this.applyBanners(home.banner ?? []), this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
    }

    private applyBanners(list: BannerDto[]): void {
        if (!this.bannerRoot) {
            return;
        }
        this.bannerRoot.active = list.length > 0;
        const hint = find("hint", this.bannerRoot) ?? find("Label", this.bannerRoot);
        const lab = hint?.getComponent(Label);
        if (lab && list[0]?.imgurl) {
            lab.string = list[0].imgurl;
        }
    }
}
