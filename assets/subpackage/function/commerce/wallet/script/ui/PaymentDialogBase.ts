import { Button, Label, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";

export abstract class PaymentDialogBase extends BaseDialog {
    protected wireByName(name: string, fn: () => void): void {
        const stack: Node[] = [this.node];
        while (stack.length) {
            const n = stack.pop()!;
            if (n.name === name && n.getComponent(Button)) {
                n.off(Button.EventType.CLICK);
                n.on(
                    Button.EventType.CLICK,
                    () => {
                        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
                        fn();
                    },
                    this,
                );
            }
            for (const c of n.children) {
                stack.push(c);
            }
        }
    }

    protected setLabelByName(root: Node, nodeName: string, text: string): void {
        const stack: Node[] = [root ?? this.node];
        while (stack.length) {
            const n = stack.pop()!;
            if (n.name === nodeName) {
                const lb = n.getComponent(Label);
                if (lb) {
                    lb.string = text;
                }
            }
            for (const c of n.children) {
                stack.push(c);
            }
        }
    }
}
