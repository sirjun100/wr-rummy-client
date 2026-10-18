import { AbstractModel } from "../../../../../script/framework/QFramework";
import type { TransitionIntent } from "../config/TransitionProtocol";

export class TransitionModel extends AbstractModel {
    public intent: TransitionIntent | null = null;
    public running = false;

    protected OnInit(): void {}

    public consumeIntent(): TransitionIntent | null {
        const current = this.intent;
        this.intent = null;
        return current;
    }
}
