import { _decorator, Button, instantiate, Label, Node, ScrollView } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { HallPlayerModel } from "../../../../hall/hallMenu/script/model/HallPlayerModel";
import { RankTabIndex } from "../config/GameActLeaderboardConfig";
import type { GameActLeaderboardOpenData, RoomChallengerPageDto } from "../config/GameActLeaderboardProtocol";
import { FetchRoomChallengerPageCommand } from "../command/FetchRoomChallengerPageCommand";
import { SubmitChallengerOptInCommand } from "../command/SubmitChallengerOptInCommand";
import { CloseRoomChallengerEvent } from "../event/GameActLeaderboardEvents";
import { GameActLeaderboardModel } from "../model/GameActLeaderboardModel";
import { bindRankRow, formatCountdown } from "../utility/GameActLeaderboardUiHelper";
import { GameActLeaderboardScrollHelper } from "./GameActLeaderboardScrollHelper";

const { ccclass } = _decorator;

@ccclass("GameActLeaderboardDialog")
export class GameActLeaderboardDialog extends BaseDialog {
    private openData = new GameActLeaderboardOpenData();

    private rootNode: Node | null = null;

    private tabIndex = 0;

    private countdownSec = 0;

    private countdownTimer = 0;

    private loadingMore = false;

    private pendingOptInSucc = false;

    protected OnInit(uiData: GameActLeaderboardOpenData = null): void {
        if (uiData) {
            this.openData = uiData;
        }
        this.rootNode = this.findDeep(this.node, "root") ?? this.node;
        const model = GameApp.Interface.GetModel(GameActLeaderboardModel);
        model.page.RegisterWithInitValue((p) => this.applyPage(p), this).UnRegisterWhenGameObjectDestroyed(this.node);
        model.listRows.RegisterWithInitValue((rows) => this.renderList(rows), this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
        model.entryStatus.RegisterWithInitValue((status) => this.onEntryStatus(status), this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
        GameApp.Interface.RegisterEvent(CloseRoomChallengerEvent, () => this.CloseSelf(), this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
        this.wireButtons();
        const cached = model.getCached(this.openData.vid);
        if (cached) {
            this.applyPage(cached);
        }
        const sv = this.findDeep(this.rootNode, "ScrollView");
        const helper = sv?.getComponent(GameActLeaderboardScrollHelper) ?? sv?.addComponent(GameActLeaderboardScrollHelper);
        if (helper) {
            helper.scrollView = sv?.getComponent(ScrollView) ?? null;
            helper.bindReachBottom(() => this.onScrollBottom());
        }
        this.applyNewRankLayout();
    }

    protected OnClose(): void {
        this.unschedule(this.tickCountdown);
    }

    private wireButtons(): void {
        const names = ["close", "ok", "continue", "opt_in", "opt_in_process", "end"];
        for (const n of names) {
            const node = this.findDeep(this.rootNode, n);
            const btn = node?.getComponent(Button);
            if (btn) {
                btn.node.on(Button.EventType.CLICK, () => this.onButton(n), this);
            }
        }
        const tabs = ["hour_tab", "daily_tab", "mega_tab"];
        tabs.forEach((name, idx) => {
            const node = this.findDeep(this.rootNode, name);
            const btn = node?.getComponent(Button);
            if (btn) {
                btn.node.on(Button.EventType.CLICK, () => this.selectTab(idx), this);
            }
        });
    }

    private onButton(tag: string): void {
        switch (tag) {
            case "close":
            case "ok":
            case "continue":
                this.CloseSelf();
                break;
            case "opt_in":
                this.pendingOptInSucc = true;
                GameApp.Interface.SendCommand(new SubmitChallengerOptInCommand(this.openData.vid));
                break;
            case "opt_in_process": {
                const tips = this.findDeep(this.rootNode, "tips");
                if (tips) {
                    tips.active = false;
                }
                break;
            }
            case "end":
                globalThis.wrUi?.showToast?.("The next event is coming soon");
                break;
            default:
                break;
        }
    }

    private selectTab(index: number): void {
        this.tabIndex = index;
        const type = RankTabIndex[index] ?? "hour";
        GameApp.Interface.SendCommand(new FetchRoomChallengerPageCommand(this.openData.vid, type, 1, false));
        this.refreshTabVisual(index);
    }

    private onScrollBottom(): void {
        const model = GameApp.Interface.GetModel(GameActLeaderboardModel);
        if (model.hasNextPage !== 1 || this.loadingMore) {
            return;
        }
        this.loadingMore = true;
        const next = model.curPage + 1;
        GameApp.Interface.SendCommand(
            new FetchRoomChallengerPageCommand(this.openData.vid, model.currentTab, next, true),
        );
        this.scheduleOnce(() => {
            this.loadingMore = false;
        }, 0.5);
    }

    private applyPage(page: RoomChallengerPageDto): void {
        const entry = Number(page.entry_status ?? 0);
        const tips = this.findDeep(this.rootNode, "tips");
        const rankList = this.findDeep(this.rootNode, "rank_list");
        const optSucc = this.findDeep(this.rootNode, "opt_in_succ");
        if (entry === 0) {
            if (tips) {
                tips.active = true;
                this.setLabel(tips, "total_prize", page.total_reward);
                this.setLabel(tips, "tips", `*Fees: ${page.ratio ?? ""} of cash game winnings`);
                this.setLabel(tips, "deta", page.cycle_tips);
                this.countdownSec = page.left_time ?? 0;
                this.startCountdown(tips.getChildByName("end_time"));
            }
            if (rankList) {
                rankList.active = false;
            }
        } else {
            if (tips) {
                tips.active = false;
            }
            if (rankList) {
                rankList.active = true;
                this.setLabel(rankList, "deta", `${page.total_reward ?? ""} ${page.cycle_tips ?? ""}`);
                this.countdownSec = this.leftTimeForTab(page);
                this.startCountdown(rankList.getChildByName("end_time"));
            }
            this.refreshTabVisual(this.tabIndex);
            if (optSucc) {
                optSucc.active = false;
            }
        }
        const model = GameApp.Interface.GetModel(GameActLeaderboardModel);
        if (Number(model.entryStatus.value) === 1 && entry === 1 && optSucc && !optSucc.active) {
            /* opt-in success shown only right after opt_in click — handled in Submit command refresh */
        }
    }

    private leftTimeForTab(page: RoomChallengerPageDto): number {
        if (this.tabIndex === 0) {
            return page.hour_left_time ?? 0;
        }
        if (this.tabIndex === 1) {
            return page.daily_left_time ?? 0;
        }
        return page.mega_left_time ?? 0;
    }

    private refreshTabVisual(active: number): void {
        const page = GameApp.Interface.GetModel(GameActLeaderboardModel).page.value;
        const tabs = ["hour_tab", "daily_tab", "mega_tab"];
        tabs.forEach((name, i) => {
            const tab = this.findDeep(this.rootNode, name);
            if (!tab) {
                return;
            }
            const line = tab.getChildByName("line");
            if (line) {
                line.active = i === active;
            }
            const lbl = tab.getChildByName("Label")?.getComponent(Label);
            if (lbl && i === 0 && page.hour_reward) {
                lbl.string = `Hour ${page.hour_reward}`;
            }
            if (lbl && i === 1 && page.day_reward) {
                lbl.string = `Day ${page.day_reward}`;
            }
        });
    }

    private renderList(rows: import("../config/GameActLeaderboardProtocol").RankRowDto[]): void {
        const rankList = this.findDeep(this.rootNode, "rank_list");
        const scroll = this.findDeep(rankList ?? this.rootNode, "ScrollView");
        const content = scroll?.getComponent(ScrollView)?.content;
        const template = this.findDeep(this.rootNode, "item");
        if (!content || !template) {
            return;
        }
        content.removeAllChildren();
        for (let i = 0; i < rows.length; i++) {
            const rowNode = instantiate(template);
            rowNode.active = true;
            content.addChild(rowNode);
            bindRankRow(rowNode, rows[i], i);
        }
        template.active = false;
    }

    private onEntryStatus(status: number): void {
        if (status !== 1 || !this.pendingOptInSucc) {
            return;
        }
        this.pendingOptInSucc = false;
        const optSucc = this.findDeep(this.rootNode, "opt_in_succ");
        if (optSucc) {
            optSucc.active = true;
        }
    }

    private applyNewRankLayout(): void {
        const isNew = Number(GameApp.Interface.GetModel(HallPlayerModel).player.value.is_new_rank ?? 0) === 1;
        const tabRoot = this.findDeep(this.rootNode, "tab_root");
        if (tabRoot) {
            tabRoot.active = !isNew;
        }
    }

    private startCountdown(labelNode: Node | null): void {
        this.unschedule(this.tickCountdown);
        if (!labelNode) {
            return;
        }
        const lbl = labelNode.getComponent(Label);
        if (!lbl) {
            return;
        }
        lbl.string = formatCountdown(this.countdownSec);
        labelNode.active = this.countdownSec > 0;
        if (this.countdownSec > 0) {
            this.schedule(this.tickCountdown, 1);
        }
    }

    private tickCountdown = (): void => {
        if (this.countdownSec > 0) {
            this.countdownSec -= 1;
        }
        const rankList = this.findDeep(this.rootNode, "rank_list");
        const tips = this.findDeep(this.rootNode, "tips");
        const target =
            tips?.active ? tips.getChildByName("end_time") : rankList?.getChildByName("end_time");
        const lbl = target?.getComponent(Label);
        if (lbl) {
            lbl.string = formatCountdown(this.countdownSec);
        }
        if (this.countdownSec <= 0) {
            this.unschedule(this.tickCountdown);
        }
    };

    private setLabel(parent: Node, childName: string, text?: string): void {
        const lbl = parent.getChildByName(childName)?.getComponent(Label);
        if (lbl && text != null) {
            lbl.string = text;
        }
    }

    private findDeep(root: Node | null, name: string): Node | null {
        if (!root) {
            return null;
        }
        if (root.name === name) {
            return root;
        }
        for (const c of root.children) {
            const hit = this.findDeep(c, name);
            if (hit) {
                return hit;
            }
        }
        return null;
    }
}
