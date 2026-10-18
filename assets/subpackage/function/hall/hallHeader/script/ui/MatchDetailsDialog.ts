import { _decorator, Label } from "cc";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import type { OpenMatchDetailsData } from "../config/LobbyTopViewProtocol";
import { getCachedTournamentDetail } from "../command/FetchTournamentDetailCommand";

const { ccclass } = _decorator;

@ccclass("MatchDetailsDialog")
export class MatchDetailsDialog extends BaseDialog {
    protected OnInit(uiData: OpenMatchDetailsData | null): void {
        this.wireByName("btn_close", () => this.CloseSelf());
        this.wireByName("close", () => this.CloseSelf());
        const detail = getCachedTournamentDetail();
        const title = this.findLabel("title");
        if (title) {
            title.string = detail?.name ?? `Tournament ${uiData?.tournamentId ?? ""}`;
        }
        const overview = this.findLabel("overview") ?? this.findLabel("overViewTips");
        if (overview && detail?.overview) {
            overview.string = detail.overview;
        }
        const prizes = this.findLabel("prizesTips");
        if (prizes && detail?.prizes?.length) {
            prizes.string = detail.prizes.map((p) => `#${p.rank} ${p.reward}`).join("\n");
        }
    }

    protected OnClose(): void {}

    private findLabel(name: string): Label | null {
        const stack = [this.node];
        while (stack.length) {
            const n = stack.pop()!;
            if (n.name === name) {
                return n.getComponent(Label);
            }
            for (const c of n.children) {
                stack.push(c);
            }
        }
        return null;
    }

    private wireByName(name: string, fn: () => void): void {
        const stack = [this.node];
        while (stack.length) {
            const n = stack.pop()!;
            if (n.name === name) {
                n.on("click", fn, this);
            }
            for (const c of n.children) {
                stack.push(c);
            }
        }
    }
}
