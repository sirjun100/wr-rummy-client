import {
    Button,
    instantiate,
    Label,
    Node,
    ProgressBar,
    size,
    Sprite,
    SpriteAtlas,
    SpriteFrame,
    UITransform,
    v3,
} from "cc";
import { IUtility } from "../../../../../script/framework/QFramework";
import { Utility } from "../../../../../script/game/utility/Utility";
import {
    NewPlayerTaskActiveDto,
    NewPlayerTaskItemDto,
    NewPlayerTaskPageDto,
    NewPlayerTaskProgressDto,
    NewPlayerTaskRewardDto,
} from "../config/NewPlayerTaskConfig";

export type NewPlayerTaskUiRefs = {
    rootNode: Node;
    timeLabel: Label | null;
    taskItems: Node[];
    boxItems: Node[];
    progressItems: Node[];
    rewardModel: Node | null;
    tipsRewardModel: Node | null;
    tipsBubbleNode: Node | null;
    dailyItemSprites: SpriteFrame[];
    taskBtnSprites: SpriteFrame[];
    boxSprites: SpriteFrame[];
    rewardPlist: SpriteAtlas | null;
    inRoom: boolean;
};

/** 新手任务子包：列表/进度/气泡绑定（QFramework IUtility）。 */
export class NewPlayerTaskUtility implements IUtility {
    public formatTimeLeft(seconds: number): string {
        const prefix = "Time Left: ";
        if (Number.isNaN(seconds) || seconds <= 0) {
            return "";
        }
        return Utility.format.template("${0} ${1}", prefix, Utility.time.durationShort(seconds));
    }

    public applyPage(refs: NewPlayerTaskUiRefs, page: NewPlayerTaskPageDto): void {
        this.updateTaskListContent(refs, page.task ?? []);
        this.updateBottomProgress(refs, page.active_num ?? 0, page.active ?? []);
    }

    public updateTaskListContent(refs: NewPlayerTaskUiRefs, tasks: NewPlayerTaskItemDto[]): void {
        for (let i = 0; i < refs.taskItems.length && i < 3; i++) {
            const itemNode = refs.taskItems[i];
            const task = tasks[i];
            if (!itemNode || !task) {
                continue;
            }
            const status = Number(task.task_status ?? 0);
            const subType = Number(task.sub_type ?? 0);
            const title = task.sub_title ?? "";
            const nameLbl = itemNode.getChildByName("name")?.getComponent(Label);
            if (nameLbl && title.length > 0) {
                nameLbl.string = title;
            }
            if (task.num != null && task.total != null) {
                const num = Number(task.num);
                const total = Number(task.total);
                const progressLbl = itemNode.getChildByName("progress_num")?.getComponent(Label);
                if (progressLbl) {
                    progressLbl.string =
                        num > total
                            ? Utility.format.template("${0}/${1}", total, total)
                            : Utility.format.template("${0}/${1}", num, total);
                }
                const bar = itemNode.getChildByName("ProgressBar")?.getComponent(ProgressBar);
                if (bar && total > 0) {
                    bar.progress = Math.min(1, num / total);
                }
            }
            this.fillTaskRewards(refs, itemNode, task.reward ?? []);
            this.bindTaskButton(refs, itemNode, status, subType);
        }
    }

    private fillTaskRewards(refs: NewPlayerTaskUiRefs, itemNode: Node, rewards: NewPlayerTaskRewardDto[]): void {
        if (!refs.rewardModel || rewards.length === 0) {
            return;
        }
        const content = itemNode
            .getChildByName("rewardList")
            ?.getChildByName("view")
            ?.getChildByName("content");
        if (!content) {
            return;
        }
        content.removeAllChildren();
        for (let e = 0; e < rewards.length; e++) {
            const row = instantiate(refs.rewardModel);
            const rtype = Number(rewards[e].type ?? 0);
            this.updateRewardSprite(refs, row.getChildByName("ico"), rtype);
            const numLbl = row.getChildByName("num")?.getComponent(Label);
            if (numLbl) {
                numLbl.string = rewards[e].amt ?? "";
            }
            row.active = true;
            row.name = `reward${e}`;
            content.addChild(row);
        }
    }

    private bindTaskButton(refs: NewPlayerTaskUiRefs, itemNode: Node, status: number, subType: number): void {
        const btnNode = itemNode.getChildByName("btn");
        if (!btnNode) {
            return;
        }
        const btn = btnNode.getComponent(Button);
        const sprite = btnNode.getComponent(Sprite);
        const wz = btnNode.getChildByName("wz")?.getComponent(Label);
        btnNode.active = true;
        if (status === 2) {
            if (btn) {
                btn.interactable = false;
            }
            if (sprite && refs.taskBtnSprites[2]) {
                sprite.spriteFrame = refs.taskBtnSprites[2];
            }
            if (wz) {
                wz.string = "COLLECTED";
            }
        } else if (status === 1) {
            if (btn) {
                btn.interactable = true;
            }
            if (sprite && refs.taskBtnSprites[0]) {
                sprite.spriteFrame = refs.taskBtnSprites[0];
            }
            if (wz) {
                wz.string = "COLLECT";
            }
        } else if (subType === 1 || subType === 2) {
            if (btn) {
                btn.interactable = true;
            }
            if (sprite && refs.taskBtnSprites[1]) {
                sprite.spriteFrame = refs.taskBtnSprites[1];
            }
            if (wz) {
                wz.string = "PLAY NOW";
            }
        } else {
            if (wz) {
                wz.string = "ADD CASH";
            }
            if (refs.inRoom) {
                if (btn) {
                    btn.interactable = false;
                }
                if (sprite && refs.taskBtnSprites[2]) {
                    sprite.spriteFrame = refs.taskBtnSprites[2];
                }
            } else {
                if (btn) {
                    btn.interactable = true;
                }
                if (sprite && refs.taskBtnSprites[1]) {
                    sprite.spriteFrame = refs.taskBtnSprites[1];
                }
            }
        }
    }

    public updateBottomProgress(
        refs: NewPlayerTaskUiRefs,
        activeNum: number,
        milestones: NewPlayerTaskActiveDto[],
    ): void {
        const ballNum = refs.rootNode?.getChildByName("ball")?.getChildByName("num")?.getComponent(Label);
        if (ballNum) {
            ballNum.string = String(activeNum);
        }
        if (!milestones.length) {
            return;
        }
        const e = Number(activeNum);
        for (let t = 0; t < milestones.length && t < 4; t++) {
            const threshold = Number(milestones[t].amt ?? 0);
            const box = refs.boxItems[t];
            const progress = refs.progressItems[t]?.getComponent(ProgressBar);
            if (!box) {
                continue;
            }
            const boxSprite = box.getComponent(Sprite);
            if (e >= threshold) {
                if (boxSprite && refs.boxSprites[1]) {
                    boxSprite.spriteFrame = refs.boxSprites[1];
                }
                if (progress) {
                    progress.progress = 1;
                }
                continue;
            }
            if (boxSprite && refs.boxSprites[0]) {
                boxSprite.spriteFrame = refs.boxSprites[0];
            }
            if (progress) {
                const prev = t > 0 ? Number(milestones[t - 1].amt ?? 0) : 0;
                const span = threshold - prev;
                progress.progress = span > 0 ? (e - prev) / span : 0;
            }
            break;
        }
    }

    public showBoxTips(
        refs: NewPlayerTaskUiRefs,
        boxIndex: number,
        activeNum: number,
        milestone: NewPlayerTaskActiveDto,
    ): void {
        const bubble = refs.tipsBubbleNode;
        if (!bubble || !refs.tipsRewardModel || !refs.boxItems[boxIndex]) {
            return;
        }
        const layout = bubble.getChildByName("layout");
        const ballNum = bubble.getChildByName("ball_num")?.getComponent(Label);
        if (ballNum) {
            ballNum.string = Utility.format.template("${0}/${1}", activeNum, milestone.amt ?? 0);
        }
        layout?.removeAllChildren();
        const rewards = milestone.reward ?? [];
        for (let i = 0; i < rewards.length; i++) {
            const row = instantiate(refs.tipsRewardModel);
            this.updateRewardSprite(refs, row.getChildByName("ico"), Number(rewards[i].type ?? 0));
            const numLbl = row.getChildByName("num")?.getComponent(Label);
            if (numLbl) {
                numLbl.string = rewards[i].amt ?? "";
            }
            row.active = true;
            layout?.addChild(row);
        }
        const bg = bubble.getChildByName("bg")?.getComponent(UITransform);
        if (bg) {
            const s = bg.contentSize;
            const h = rewards.length > 2 ? 120 + 33 * (rewards.length - 2) : 120;
            bg.setContentSize(size(s.width, h));
        }
        const boxPos = refs.boxItems[boxIndex].position;
        bubble.setPosition(v3(boxPos.x, bubble.position.y, bubble.position.z));
        bubble.active = true;
        bubble.setScale(v3(1, 1, 1));
    }

    public updateRewardSprite(refs: NewPlayerTaskUiRefs, iconNode: Node | null, rewardType: number): void {
        if (!iconNode) {
            return;
        }
        const sprite = iconNode.getComponent(Sprite);
        if (!sprite) {
            return;
        }
        const idx = rewardType === 13 ? 2 : rewardType;
        if (idx >= 0 && idx < refs.dailyItemSprites.length) {
            sprite.spriteFrame = refs.dailyItemSprites[idx];
            return;
        }
        if (refs.rewardPlist) {
            const frame = refs.rewardPlist.getSpriteFrame(`reward_${rewardType}`);
            if (frame) {
                sprite.spriteFrame = frame;
            }
        }
    }

    public updateNovicesTaskBtn(btn: Node | null, progress: NewPlayerTaskProgressDto | undefined, show: boolean): void {
        if (!btn) {
            return;
        }
        const visible = show && progress != null;
        btn.active = visible;
        if (!visible || !progress) {
            return;
        }
        const red = btn.getChildByName("redpot");
        if (red) {
            red.active = Number(progress.red_dot ?? 0) === 1;
        }
        const status = Number(progress.task_status ?? 0);
        const progressNode = btn.getChildByName("progress");
        const wz = btn.getChildByName("wz")?.getComponent(Label);
        if (status === 2) {
            if (progressNode) {
                progressNode.active = false;
            }
            if (wz) {
                wz.string = "STARTER\nMISSION";
            }
            return;
        }
        if (progressNode) {
            progressNode.active = true;
            const bar = progressNode.getComponent(ProgressBar);
            const total = Number(progress.total ?? 1);
            const num = Number(progress.num ?? 0);
            if (bar && total > 0) {
                bar.progress = num / total;
            }
        }
        if (wz) {
            let kind = "";
            const sub = Number(progress.sub_type ?? 0);
            if (sub === 1) {
                kind = "GAMES";
            } else if (sub === 2) {
                kind = "WINS";
            } else if (sub === 3) {
                kind = "RECHARGE";
            }
            const total = Number(progress.total ?? 0);
            const num = Number(progress.num ?? 0);
            const line =
                num > total
                    ? Utility.format.template("${0}/${1}", total, total)
                    : Utility.format.template("${0}/${1}", num, total);
            wz.string = `${kind}\n${line}`;
        }
    }
}
