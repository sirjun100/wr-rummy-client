import { _decorator, Button, Component, Node } from "cc";
import { GameApp } from "../../../../../../script/game/GameApp";
import { SixpointChatCommand } from "../command/SixpointChatCommand";
import { openSixpointChatFromRummy } from "../SixpointGameModule";

const { ccclass } = _decorator;

@ccclass("SixpointChatPanel")
export class SixpointChatPanel extends Component {
    public bindChatButton(btn: Node | null): void {
        if (!btn) {
            return;
        }
        const button = btn.getComponent(Button);
        const target = button?.node ?? btn;
        target.on(Button.EventType.CLICK, () => {
            void openSixpointChatFromRummy();
        });
    }

    public sendChat(msg: string): void {
        GameApp.Interface.SendCommand(new SixpointChatCommand(msg));
    }
}
