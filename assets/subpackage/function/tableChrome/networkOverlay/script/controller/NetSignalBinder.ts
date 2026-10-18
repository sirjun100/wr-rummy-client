import { _decorator, Component, Label, Sprite, SpriteFrame } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { NetworkDelayModel } from "../model/NetworkDelayModel";
import { currentNetworkType, pickSignalFrameIndex } from "../utility/NetSignalUtil";

const { ccclass, property } = _decorator;

@ccclass("NetSignalBinder")
export class NetSignalBinder extends Component {
    @property(Sprite)
    public signal: Sprite = null;

    @property(Label)
    public delayMs: Label = null;

    @property([SpriteFrame])
    public mobileSignals: SpriteFrame[] = [];

    @property([SpriteFrame])
    public wifiSignals: SpriteFrame[] = [];

    protected onLoad(): void {
        GameApp.Interface.GetModel(NetworkDelayModel)
            .lastPingMs.RegisterWithInitValue((ms) => this.applyPing(ms), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.GetModel(NetworkDelayModel)
            .config.RegisterWithInitValue((cfg) => {
                if ((cfg.games_delay_open ?? 0) !== 1 && this.signal) {
                    this.signal.node.active = false;
                }
            }, this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
    }

    private applyPing(pingMs: number): void {
        const model = GameApp.Interface.GetModel(NetworkDelayModel);
        if ((model.config.value.games_delay_open ?? 0) !== 1 || !this.signal) {
            return;
        }
        const netType = currentNetworkType();
        const isWifi = netType === 1;
        const frames = isWifi ? this.wifiSignals : this.mobileSignals;
        let ms = pingMs;
        if (!this.signal.node.active) {
            ms = 200;
        }
        this.signal.node.active = true;
        const idx = pickSignalFrameIndex(ms, netType, isWifi);
        if (frames[idx]) {
            this.signal.spriteFrame = frames[idx];
        }
        if (this.delayMs) {
            const show = (model.config.value.signal_delay_show ?? 0) === 1;
            this.delayMs.node.active = show;
            if (show) {
                this.delayMs.string = `${ms}ms`;
            }
        }
    }
}
