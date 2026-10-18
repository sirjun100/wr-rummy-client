import { _decorator, Label } from "cc";
import { BaseDialog } from "../../../../../../script/game/controller/engine/BaseDialog";
import type { TableInProgressDto } from "../../config/LobbyProtocol";

const { ccclass } = _decorator;

@ccclass("GameAlreadyJoinedDialog")
export class GameAlreadyJoinedDialog extends BaseDialog {
    protected OnInit(uiData: TableInProgressDto[] | null): void {
        const tables = uiData ?? [];
        this.wireByName("btn_close", () => this.CloseSelf());
        this.wireByName("close", () => this.CloseSelf());
        const listNode = this.findDeep("list") ?? this.findDeep("content");
        const label = listNode?.getComponent(Label) ?? this.findDeep("tips")?.getComponent(Label);
        if (label) {
            if (tables.length === 0) {
                label.string = "You have tables in progress.";
            } else {
                label.string = tables.map((t) => t.title ?? t.tid_key ?? "Table").join("\n");
            }
        }
    }

    protected OnClose(): void {}

    private findDeep(name: string): import("cc").Node | null {
        const stack = [this.node];
        while (stack.length) {
            const n = stack.pop()!;
            if (n.name === name) {
                return n;
            }
            for (const c of n.children) {
                stack.push(c);
            }
        }
        return null;
    }

    private wireByName(name: string, fn: () => void): void {
        const n = this.findDeep(name);
        n?.on("click", fn, this);
    }
}
