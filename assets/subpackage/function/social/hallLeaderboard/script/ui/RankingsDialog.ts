import { _decorator, Button, Node, ScrollView } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { ChallengerEntryModel } from "../../../../../script/game/challenger/model/ChallengerEntryModel";
import { ChallengerOptEntryCommand } from "../../../../../script/game/challenger/command/ChallengerOptEntryCommand";
import { HallRankTabIndex } from "../config/RankingsConfig";
import type { HallRankDetailDto } from "../config/RankingsProtocol";
import { FetchHallRankBoardListCommand } from "../command/FetchHallRankBoardListCommand";
import { FetchHallRankDetailCommand } from "../command/FetchHallRankDetailCommand";
import { FetchHallRankScheduleCommand } from "../command/FetchHallRankScheduleCommand";
import { SetHallRankAutoEntryCommand } from "../command/SetHallRankAutoEntryCommand";
import { RankingsListBinder } from "../controller/RankingsListBinder";
import { RankingsScheduleBinder } from "../controller/RankingsScheduleBinder";
import { RankingsModel } from "../model/RankingsModel";
import { findDeep, formatCountdown, setLabel } from "../utility/RankingsUiHelper";

const { ccclass } = _decorator;

@ccclass("RankingsDialog")
export class RankingsDialog extends BaseDialog {
    private rootNode: Node | null = null;

    private tabIndex = 0;

    private countdownSec = 0;

    private loadingMore = false;

    private listBinder: RankingsListBinder | null = null;

    private scheduleBinder: RankingsScheduleBinder | null = null;

    protected OnInit(): void {
        this.rootNode = findDeep(this.node, "rootNode") ?? findDeep(this.node, "root") ?? this.node;
        const model = GameApp.Interface.GetModel(RankingsModel);
        const scroll = findDeep(this.rootNode, "ScrollView");
        const rankItem = findDeep(this.rootNode, "rank_item");
        this.listBinder = new RankingsListBinder(scroll, rankItem);
        const schedulePanel = findDeep(this.rootNode, "scheduleListNode");
        const scheduleItem = findDeep(this.rootNode, "item_time") ?? findDeep(this.rootNode, "item_date");
        this.scheduleBinder = new RankingsScheduleBinder(schedulePanel, scheduleItem);

        model.rankDetail.RegisterWithInitValue((d) => this.applyDetail(d), this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
        model.listRows.RegisterWithInitValue((rows) => this.listBinder?.render(rows), this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
        model.schedule.RegisterWithInitValue((s) => this.scheduleBinder?.apply(s), this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
        GameApp.Interface.GetModel(ChallengerEntryModel)
            .entryStatus.RegisterWithInitValue((st) => this.onEntryStatus(st), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);

        this.wireButtons();
        const sv = scroll?.getComponent(ScrollView);
        if (sv) {
            sv.node.on(ScrollView.EventType.SCROLL_ENDED, this.onScrollEnd, this);
        }
    }

    protected OnClose(): void {
        this.unschedule(this.tickCountdown);
        const scroll = findDeep(this.rootNode, "ScrollView");
        scroll?.getComponent(ScrollView)?.node.off(ScrollView.EventType.SCROLL_ENDED, this.onScrollEnd, this);
    }

    private wireButtons(): void {
        const map: Record<string, () => void> = {
            back_btn: () => this.CloseSelf(),
            btn_close: () => this.CloseSelf(),
            btn_schedule: () => this.openSchedule(),
            btn_optin: () => this.showOptInPanel(true),
            btn_opt_out: () => this.showOptOutPanel(true),
            btn_proced: () => {
                const optOut = findDeep(this.rootNode, "opt_out");
                if (optOut?.active) {
                    this.submitOptOut();
                } else {
                    this.submitOptIn();
                }
            },
            btn_playnow: () => this.onPlayNow(),
            btn_help: () => this.toggleAutoHelp(true),
            btn_otpin: () => this.toggleAutoEntry(),
            btn_banner: () => this.toggleBanner(true),
            btn_end: () => this.hideToolPanels(),
            btn_got: () => this.hideToolPanels(),
            btn_not_now: () => this.hideToolPanels(),
        };
        for (const [name, fn] of Object.entries(map)) {
            const node = findDeep(this.rootNode, name);
            const btn = node?.getComponent(Button);
            if (btn) {
                btn.node.on(Button.EventType.CLICK, fn, this);
            }
        }
        const tab0 = findDeep(this.rootNode, "tab0");
        const tab1 = findDeep(this.rootNode, "tab1");
        tab0?.getComponent(Button)?.node.on(Button.EventType.CLICK, () => this.selectTab(0), this);
        tab1?.getComponent(Button)?.node.on(Button.EventType.CLICK, () => this.selectTab(1), this);
    }

    private applyDetail(d: HallRankDetailDto): void {
        const mini = d.mini_tab;
        if (mini?.left_time != null) {
            this.countdownSec = mini.left_time;
            this.unschedule(this.tickCountdown);
            this.schedule(this.tickCountdown, 1);
            this.tickCountdown();
        }
        setLabel(findDeep(this.rootNode, "bannel_title"), d.cycle_tips ?? "");
        setLabel(findDeep(this.rootNode, "reward_title"), mini?.total_reward ?? "");
        setLabel(findDeep(this.rootNode, "center_tips"), d.entry_tips ?? "");
        const sub = findDeep(this.rootNode, "subTimeTx") ?? findDeep(this.rootNode, "end_time");
        if (mini?.select_item?.[0]?.value) {
            setLabel(sub, mini.select_item[0].value);
        }
    }

    private tickCountdown(): void {
        if (this.countdownSec <= 0) {
            GameApp.Interface.SendCommand(new FetchHallRankDetailCommand(true));
            return;
        }
        this.countdownSec -= 1;
        const text = formatCountdown(this.countdownSec);
        setLabel(findDeep(this.rootNode, "leftTimeTx"), text);
        setLabel(findDeep(this.rootNode, "bottomLeftTimeTx"), text);
    }

    private onEntryStatus(status: number): void {
        const optedIn = status === 1;
        const optIn = findDeep(this.rootNode, "opt_in");
        const optOut = findDeep(this.rootNode, "opt_out");
        const play = findDeep(this.rootNode, "btn_playnow");
        if (optIn) {
            optIn.active = !optedIn;
        }
        if (optOut) {
            optOut.active = optedIn;
        }
        if (play) {
            play.active = optedIn;
        }
    }

    private selectTab(idx: number): void {
        if (this.tabIndex === idx) {
            return;
        }
        this.tabIndex = idx;
        const model = GameApp.Interface.GetModel(RankingsModel);
        model.currentTab = HallRankTabIndex[idx] ?? "daily";
        model.resetList();
        GameApp.Interface.SendCommand(new FetchHallRankBoardListCommand(1, false));
    }

    private onScrollEnd(): void {
        const model = GameApp.Interface.GetModel(RankingsModel);
        if (this.loadingMore || model.hasNextPage !== 1) {
            return;
        }
        this.loadingMore = true;
        const next = model.curPage + 1;
        GameApp.Interface.SendCommand(new FetchHallRankBoardListCommand(next, true));
        this.loadingMore = false;
    }

    private openSchedule(): void {
        GameApp.Interface.SendCommand(new FetchHallRankScheduleCommand(true));
        const panel = findDeep(this.rootNode, "scheduleListNode");
        if (panel) {
            panel.active = true;
            this.showToolMask(true);
        }
    }

    private showOptInPanel(show: boolean): void {
        const node = findDeep(this.rootNode, "opt_in");
        if (node) {
            node.active = show;
            this.showToolMask(show);
        }
    }

    private showOptOutPanel(show: boolean): void {
        const node = findDeep(this.rootNode, "opt_out");
        if (node) {
            node.active = show;
            this.showToolMask(show);
        }
    }

    private submitOptIn(): void {
        GameApp.Interface.SendCommand(
            new ChallengerOptEntryCommand(1, () => {
                GameApp.Interface.SendCommand(new FetchHallRankDetailCommand(true));
                GameApp.Interface.SendCommand(new FetchHallRankBoardListCommand(1, false));
                this.showOptInPanel(false);
                const suc = findDeep(this.rootNode, "opt_in_suc");
                if (suc) {
                    suc.active = true;
                }
            }),
        );
    }

    private submitOptOut(): void {
        GameApp.Interface.SendCommand(
            new ChallengerOptEntryCommand(0, () => {
                GameApp.Interface.GetModel(RankingsModel).resetList();
                GameApp.Interface.SendCommand(new FetchHallRankDetailCommand(true));
                this.showOptOutPanel(false);
            }),
        );
    }

    private onPlayNow(): void {
        this.CloseSelf();
        const wr = (globalThis as { wrLobby?: { openFastBuy?: () => Promise<void> } }).wrLobby;
        void wr?.openFastBuy?.();
    }

    private toggleAutoHelp(show: boolean): void {
        const tips = findDeep(this.rootNode, "auto_tips");
        if (tips) {
            tips.active = show;
            this.showToolMask(show);
        }
    }

    private toggleAutoEntry(): void {
        const model = GameApp.Interface.GetModel(ChallengerEntryModel);
        const next = model.autoEntry.value === 1 ? 0 : 1;
        GameApp.Interface.SendCommand(new SetHallRankAutoEntryCommand(next));
    }

    private toggleBanner(show: boolean): void {
        const node = findDeep(this.rootNode, "banner_reward") ?? findDeep(this.rootNode, "bannel_reward");
        if (node) {
            node.active = show;
            this.showToolMask(show);
        }
        const detail = GameApp.Interface.GetModel(RankingsModel).rankDetail.value;
        setLabel(findDeep(node, "total"), detail.issued_reward ? `Total Prize Issued: ${detail.issued_reward}` : "");
    }

    private hideToolPanels(): void {
        this.showToolMask(false);
        for (const name of ["opt_in", "opt_out", "opt_in_suc", "opt_out_suc", "scheduleListNode", "auto_tips", "banner_reward", "bannel_reward"]) {
            const n = findDeep(this.rootNode, name);
            if (n) {
                n.active = false;
            }
        }
    }

    private showToolMask(on: boolean): void {
        const tool = findDeep(this.rootNode, "tool_rootNode");
        const mask = tool ? findDeep(tool, "mask") : null;
        if (tool) {
            tool.active = on || tool.active;
        }
        if (mask) {
            mask.active = on;
        }
    }
}
