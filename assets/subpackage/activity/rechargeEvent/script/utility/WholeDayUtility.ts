import { Label, Node, Sprite, SpriteFrame } from "cc";
import { IUtility } from "../../../../../script/framework/QFramework";
import { TwentyFourPageDto } from "../config/RechargeEventConfig";

export type WholeDayUiRefs = {
    mainRoot: Node | null;
    leftTimeLabel: Label | null;
    bgSpriteFrames: SpriteFrame[];
};

export class WholeDayUtility implements IUtility {
    public applyPage(refs: WholeDayUiRefs, page: TwentyFourPageDto, inRoom: boolean): void {
        if (inRoom && refs.mainRoot && refs.bgSpriteFrames.length > 1) {
            const sp = refs.mainRoot.getComponent(Sprite);
            if (sp) {
                sp.spriteFrame = refs.bgSpriteFrames[1];
            }
            const itemRoot = refs.mainRoot.getChildByName("item_root");
            itemRoot?.setPosition(0, 0, 0);
        }
        const main = refs.mainRoot;
        if (!main) {
            return;
        }
        const flag = main.getChildByName("flag")?.getComponent(Label);
        if (flag && page.title) {
            flag.string = page.title;
        }
        const submit = main.getChildByName("submit_btn");
        const wz = submit?.getChildByName("wz")?.getComponent(Label);
        if (wz && page.price != null) {
            wz.string = `₹${page.price}`;
        }
        const itemRoot = main.getChildByName("item_root");
        if (itemRoot) {
            const cashWz = itemRoot.getChildByName("item_cash")?.getChildByName("wz")?.getComponent(Label);
            if (cashWz && page.cash != null) {
                cashWz.string = `₹${page.cash}`;
            }
            const bonusNode = itemRoot.getChildByName("item_bonus");
            const addWz = itemRoot.getChildByName("add_wz");
            if (bonusNode && page.bonus && Number(page.bonus) > 0) {
                bonusNode.active = true;
                addWz?.active = true;
                bonusNode.getChildByName("wz")?.getComponent(Label)?.string = `₹${page.bonus}`;
            } else {
                if (bonusNode) {
                    bonusNode.active = false;
                }
                if (addWz) {
                    addWz.active = false;
                }
            }
        }
        const ratioFlag = submit?.getChildByName("flag");
        if (ratioFlag && page.ratio) {
            ratioFlag.active = true;
            ratioFlag.getChildByName("wz")?.getComponent(Label)?.string = page.ratio;
        } else if (ratioFlag) {
            ratioFlag.active = false;
        }
    }

    public formatCountdown(sec: number): string {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }
}
