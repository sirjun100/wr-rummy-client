import { _decorator, Component, instantiate, Label, Node, Sprite, SpriteFrame } from "cc";
import { Utility } from "../../../../../../script/game/utility/Utility";
import { BetAreaInfo, SixpointTableDto } from "../config/SixpointProtocol";

const { ccclass, property } = _decorator;

@ccclass("SixpointTablePanel")
export class SixpointTablePanel extends Component {
    @property([Label])
    public meBetLabels: Label[] = [];

    @property([Label])
    public allBetLabels: Label[] = [];

    @property([Node])
    public trendRoots: Node[] = [];

    @property(Node)
    public dsMoban: Node | null = null;

    @property([SpriteFrame])
    public dsBgs: SpriteFrame[] = [];

    public applySnapshot(dto: SixpointTableDto): void {
        if (dto.betAreaInfo) {
            this.applyAreas(dto.betAreaInfo);
        }
        if (dto.history_record) {
            this.refreshSeziHistoryRecode(false, dto.history_record);
        }
    }

    public applyAreas(areas: BetAreaInfo[]): void {
        for (const a of areas) {
            const o = a.option ?? 0;
            if (o < 0 || o > 5) {
                continue;
            }
            this.showMeXzGoldNum(a.selfbet ?? 0, o);
            this.showOthersXzGoldNum(a.allbet ?? 0, o);
        }
    }

    public showMeXzGoldNum(amount: number, option: number): void {
        const label = this.meBetLabels[option] ?? this.node.getChildByName(`xz_me_gold${option}`)?.getComponent(Label);
        if (label) {
            label.string = Utility.format.chipCompact(amount);
        }
    }

    public showOthersXzGoldNum(amount: number, option: number): void {
        const label = this.allBetLabels[option] ?? this.node.getChildByName(`xz_other_gold${option}`)?.getComponent(Label);
        if (label) {
            label.string = Utility.format.chipCompact(amount);
        }
    }

    public resetInfo(): void {
        for (let i = 0; i < 6; i++) {
            this.showMeXzGoldNum(0, i);
            this.showOthersXzGoldNum(0, i);
        }
    }

    public refreshSeziHistoryRecode(highlightLast: boolean, history?: number[][]): void {
        const cols = history ?? [];
        for (let col = 0; col < 6; col++) {
            const root = this.trendRoots[col];
            if (!root || !this.dsMoban) {
                continue;
            }
            root.active = true;
            root.removeAllChildren();
            const colData = cols[col] ?? [];
            if (colData.length === 0) {
                continue;
            }
            let start = 0;
            let len = colData.length;
            if (len > 12) {
                start = len - 12;
                len = 12 + start;
            }
            for (let s = start; s < len; s++) {
                const point = colData[s];
                const cell = instantiate(this.dsMoban);
                cell.active = true;
                const numNode = cell.getChildByName("num");
                const numLabel = numNode?.getComponent(Label);
                const spr = cell.getComponent(Sprite);
                if (point <= 1) {
                    if (spr && this.dsBgs[0]) {
                        spr.spriteFrame = this.dsBgs[0];
                    }
                    if (numLabel) {
                        numLabel.string = "X";
                    }
                } else {
                    if (spr && this.dsBgs[1]) {
                        spr.spriteFrame = this.dsBgs[1];
                    }
                    if (numLabel) {
                        numLabel.string = String(point);
                    }
                }
                const effect = cell.getChildByName("effect");
                if (effect) {
                    effect.active = highlightLast && s === len - 1;
                }
                root.addChild(cell);
            }
        }
    }
}
