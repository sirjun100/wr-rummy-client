import { _decorator, AudioSource, Component, director, Node } from "cc";
import { GameApp } from "../GameApp";
import { AudioSystem } from "../system/AudioSystem";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";

const { ccclass, property } = _decorator;

/** 挂到常驻节点：注入 hall / room / sfx 音源，对齐旧 GameSound.prefab */
@ccclass("AudioBootstrap")
export class AudioBootstrap extends Component {
    @property(Node)
    public lobBg: Node = null;

    @property(Node)
    public roomBg: Node = null;

    @property(Node)
    public sound: Node = null;

    protected onLoad(): void {
        director.addPersistRootNode(this.node);
        const hall = this.lobBg?.getComponent(AudioSource);
        const room = this.roomBg?.getComponent(AudioSource);
        const sfx = this.sound?.getComponent(AudioSource);
        if (!hall || !room || !sfx) {
            LogKit.W("[AudioBootstrap] missing AudioSource on lob_bg / room_bg / sound");
            return;
        }
        GameApp.Interface.GetSystem(AudioSystem).attachSources(hall, room, sfx);
    }
}
