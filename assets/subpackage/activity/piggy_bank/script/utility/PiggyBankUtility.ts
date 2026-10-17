import { Button, HorizontalTextAlignment, Label, Node, ProgressBar, Sprite, sp } from "cc";
import { IUtility } from "../../../../../script/framework/QFramework";
import { PiggyBankPageDto, PiggyBankTipsDto } from "../config/PiggyBankConfig";

export type PiggyBankUiRefs = {
    progressBar: ProgressBar | null;
    buyNode: Node | null;
    gullakRootNode: Node | null;
    guanziSkeleton: sp.Skeleton | null;
    biaogeNode: Node | null;
    topTipsNode: Node | null;
    downTipNode: Node | null;
    ruleLabel: Label | null;
};

/** 存钱罐子包 UI 绑定（QFramework IUtility）。 */
export class PiggyBankUtility implements IUtility {
    public loopAnimForStatus(status: number): string {
        if (status === 2) {
            return "ps_xh";
        }
        if (status === 1) {
            return "cqg_xh";
        }
        return "cqg_ct";
    }

    public entryAnimOnProgressChange(): string {
        return "cqg_cq";
    }

    public applyPage(refs: PiggyBankUiRefs, page: PiggyBankPageDto, playEntryAnim: boolean): void {
        this.bindProgress(refs, page);
        this.bindBuyButton(refs, page);
        this.bindRewardItems(refs, page);
        this.bindTopTips(refs, page);
        this.bindDownTip(refs, page);
        this.bindTipsTable(refs, page.tips);
        this.bindClubLevel(refs, page.club ?? 0);
        if (refs.guanziSkeleton) {
            refs.guanziSkeleton.node.active = true;
            if (playEntryAnim) {
                refs.guanziSkeleton.clearTracks();
                refs.guanziSkeleton.setToSetupPose();
                refs.guanziSkeleton.setAnimation(0, this.entryAnimOnProgressChange(), false);
                refs.guanziSkeleton.setCompleteListener(() => {
                    refs.guanziSkeleton?.setCompleteListener(null);
                    this.setLoopAnim(refs.guanziSkeleton, page.status ?? 0);
                });
            } else {
                this.setLoopAnim(refs.guanziSkeleton, page.status ?? 0);
            }
        }
        if (refs.ruleLabel && refs.ruleLabel.horizontalAlign !== undefined) {
            refs.ruleLabel.horizontalAlign = HorizontalTextAlignment.LEFT;
        }
    }

    private setLoopAnim(sk: sp.Skeleton | null, status: number): void {
        if (!sk) {
            return;
        }
        sk.clearTracks();
        sk.setToSetupPose();
        sk.setAnimation(0, this.loopAnimForStatus(status), true);
    }

    public playSmashAnim(sk: sp.Skeleton | null, onDone: () => void): void {
        if (!sk) {
            onDone();
            return;
        }
        sk.clearTracks();
        sk.setToSetupPose();
        sk.setAnimation(0, "ps", false);
        let done = false;
        sk.setCompleteListener(() => {
            if (done) {
                return;
            }
            done = true;
            sk.setCompleteListener(null);
            sk.setAnimation(0, "ps_xh", true);
            onDone();
        });
    }

    private bindProgress(refs: PiggyBankUiRefs, page: PiggyBankPageDto): void {
        const max = Number(page.max ?? 1);
        const progress = Number(page.progress ?? 0);
        const ratio = max > 0 ? progress / max : 0;
        if (refs.progressBar) {
            refs.progressBar.progress = ratio > 1 ? 1 : ratio;
        }
        const progressBg = refs.progressBar?.node.parent?.getChildByName("progressBg");
        const currPro = progressBg?.getChildByName("currpro")?.getComponent(Label);
        const currLabel = progressBg?.getChildByName("currlabel")?.getComponent(Label);
        if (ratio >= 1) {
            if (currPro) {
                currPro.string = "80%";
            }
            if (currLabel) {
                currLabel.string = "MAX";
            }
        } else {
            if (currPro) {
                currPro.string =
                    progress / Number(page.money ?? 1) - 1 < 0 ? "0%" : String(page.discount_ratio ?? "0%");
            }
            if (currLabel) {
                currLabel.string = "Current";
            }
        }
    }

    private bindBuyButton(refs: PiggyBankUiRefs, page: PiggyBankPageDto): void {
        if (!refs.buyNode) {
            return;
        }
        refs.buyNode.active = true;
        const status = Number(page.status ?? 0);
        const label = refs.buyNode.getChildByName("Label")?.getComponent(Label);
        const label2 = refs.buyNode.getChildByName("Label2")?.getComponent(Label);
        const btn = refs.buyNode.getComponent(Button);
        const moneyStr = `₹${page.money ?? 0}`;
        if (label) {
            label.string = moneyStr;
        }
        if (label2) {
            label2.string = moneyStr;
        }
        if (status === 0 || status === 1) {
            if (btn) {
                btn.interactable = true;
            }
            if (label) {
                label.active = true;
            }
            if (label2) {
                label2.active = false;
            }
        } else if (status === 2) {
            if (btn) {
                btn.interactable = false;
            }
            if (label) {
                label.active = false;
            }
            if (label2) {
                label2.active = true;
            }
        }
    }

    private bindRewardItems(refs: PiggyBankUiRefs, page: PiggyBankPageDto): void {
        const items = refs.gullakRootNode?.getChildByName("items");
        if (!items) {
            return;
        }
        const plus = items.getChildByName("plus");
        const cashItem = items.getChildByName("cashItem");
        const bonusItem = items.getChildByName("bonusItem");
        let hasCash = false;
        let hasBonus = false;
        if (cashItem) {
            hasCash = Number(page.cash ?? 0) > 0;
            cashItem.active = hasCash;
            if (hasCash) {
                cashItem.getChildByName("num")?.getComponent(Label)?.string = String(page.cash);
            }
        }
        if (bonusItem) {
            hasBonus = Number(page.bonus ?? 0) > 0;
            bonusItem.active = hasBonus;
            if (hasBonus) {
                bonusItem.getChildByName("num")?.getComponent(Label)?.string = String(page.bonus);
            }
        }
        if (plus) {
            plus.active = hasCash && hasBonus;
        }
        const flag = refs.buyNode?.getChildByName("flag");
        const ratio = page.discount_ratio ?? "";
        if (flag) {
            flag.active = ratio.length > 0;
            flag.getChildByName("Label")?.getComponent(Label)?.string = ratio;
        }
    }

    private bindTopTips(refs: PiggyBankUiRefs, page: PiggyBankPageDto): void {
        const tip = page.max_tip ?? "";
        if (!refs.topTipsNode || !tip) {
            return;
        }
        const parts = tip.split("to");
        const l1 = refs.topTipsNode.getChildByName("label1")?.getComponent(Label);
        const l2 = refs.topTipsNode.getChildByName("label2")?.getComponent(Label);
        if (l1) {
            l1.string = parts.length > 1 ? `${parts[0]}to` : tip;
        }
        if (l2 && parts.length > 1) {
            l2.string = parts[1];
        }
    }

    private bindDownTip(refs: PiggyBankUiRefs, page: PiggyBankPageDto): void {
        const lbl = refs.downTipNode?.getComponent(Label);
        if (!lbl) {
            return;
        }
        lbl.string =
            Number(page.status) === 2 ? String(page.reset ?? "") : String(page.currentDesc ?? "");
    }

    public bindTipsTable(refs: PiggyBankUiRefs, tips: PiggyBankTipsDto | undefined): void {
        if (!refs.biaogeNode || !tips) {
            return;
        }
        this.fillTipColumn(refs.biaogeNode, "bonus", tips.bonus);
        this.fillTipColumn(refs.biaogeNode, "cash", tips.cash);
        this.fillTipColumn(refs.biaogeNode, "daily", tips.daily);
        this.fillTipColumn(refs.biaogeNode, "spending", tips.spending);
        this.fillTipColumn(refs.biaogeNode, "storage", tips.storage);
    }

    private fillTipColumn(root: Node, prefix: string, values?: string[]): void {
        if (!values?.length) {
            return;
        }
        for (let i = 0; i < 9 && i < values.length; i++) {
            const cell = root.getChildByName(`${prefix}${i + 1}`);
            cell?.getComponent(Label)?.string = String(values[i]);
        }
    }

    private bindClubLevel(refs: PiggyBankUiRefs, club: number): void {
        const root = refs.gullakRootNode;
        const levelSprite = root?.getChildByName("level")?.getComponent(Sprite);
        const icons = root?.getChildByName("clubicons");
        if (!levelSprite || !icons) {
            return;
        }
        const idx = Math.min(5, Math.max(0, club));
        const iconNode = icons.getChildByName(`club_small_pic${idx}`);
        const frame = iconNode?.getComponent(Sprite)?.spriteFrame;
        if (frame) {
            levelSprite.spriteFrame = frame;
        }
    }

    public updateGullakBtn(btn: Node | null, open: number, fullStatus: number, playBurst: boolean): void {
        if (!btn) {
            return;
        }
        btn.active = Number(open) === 1;
        if (!btn.active) {
            return;
        }
        const anim = btn.getChildByName("anim")?.getComponent(sp.Skeleton);
        if (!anim) {
            return;
        }
        anim.clearTracks();
        anim.setToSetupPose();
        if (playBurst) {
            anim.setAnimation(0, "2", false);
            anim.setCompleteListener(() => {
                anim.setCompleteListener(null);
                anim.clearTracks();
                anim.setToSetupPose();
                anim.setAnimation(0, Number(fullStatus) === 0 ? "0" : "1", true);
            });
        } else {
            anim.setAnimation(0, Number(fullStatus) === 0 ? "0" : "1", true);
        }
    }
}
