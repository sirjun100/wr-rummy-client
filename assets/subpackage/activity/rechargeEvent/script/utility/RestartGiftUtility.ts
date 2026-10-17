import { Button, Label, Node, Sprite, SpriteFrame, v3 } from "cc";
import { IUtility } from "../../../../../script/framework/QFramework";
import { RestartGiftPageDto } from "../config/RechargeEventConfig";

export class RestartGiftUtility implements IUtility {
    public applyRoomScale(root: Node | null, inRoom: boolean): void {
        if (inRoom && root) {
            root.setScale(v3(0.69, 0.69, 0.69));
        }
    }

    public applyPage(
        root: Node | null,
        rewardRoot: Node | null,
        okBtn: Node | null,
        okBtnSprites: SpriteFrame[],
        page: RestartGiftPageDto,
    ): void {
        if (!root || !rewardRoot || !okBtn) {
            return;
        }
        const total = root.getChildByName("total_amt")?.getComponent(Label);
        if (total && page.tips_text) {
            total.string = page.tips_text;
        }
        const less = root.getChildByName("less_tips")?.getComponent(Label);
        if (less && page.tips_text2) {
            less.string = page.tips_text2;
        }
        rewardRoot.getChildByName("item_cash")?.getChildByName("wz")?.getComponent(Label)?.string =
            `₹${page.instant_amount ?? 0}`;
        const bonus = rewardRoot.getChildByName("item_bonus");
        if (bonus && Number(page.instant_bonus) > 0) {
            bonus.active = true;
            rewardRoot.getChildByName("add")?.active = true;
            bonus.getChildByName("wz")?.getComponent(Label)?.string = `₹${page.instant_bonus}`;
        }
        const status = Number(page.status ?? 0);
        const sp = okBtn.getComponent(Sprite);
        if (sp && okBtnSprites.length > 1) {
            sp.spriteFrame = status === 0 || status === 1 ? okBtnSprites[1] : okBtnSprites[0];
        }
        const wz = okBtn.getChildByName("wz")?.getComponent(Label);
        if (wz) {
            wz.string = status === 0 ? `₹${page.instant_amount ?? 0}` : "COLLECT";
        }
        okBtn.getComponent(Button)?.interactable = status !== 2;
        page.collect?.forEach((c, i) => {
            const item = root.getChildByName(`item${i}`);
            const gou = root.getChildByName(`gou${i}`);
            if (item) {
                item.getChildByName("title")?.getComponent(Label)?.string = String(c.tips ?? "");
                item.getChildByName("num")?.getComponent(Label)?.string = `₹${c.amt ?? 0}`;
            }
            if (gou) {
                gou.active = Number(c.iscollect) === 1;
            }
        });
    }
}
