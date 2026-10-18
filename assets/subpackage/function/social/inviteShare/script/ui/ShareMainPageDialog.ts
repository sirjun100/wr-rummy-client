import {
    _decorator,
    color,
    find,
    instantiate,
    Label,
    Layout,
    Node,
    RichText,
    ScrollView,
    tween,
    UITransform,
    v3,
} from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { FetchShareEarnDetailsCommand } from "../command/FetchShareEarnDetailsCommand";
import { FetchSharePageCommand } from "../command/FetchSharePageCommand";
import { FetchShareRankListCommand } from "../command/FetchShareRankListCommand";
import type { EarnRecordDto, RankEntryDto, SharePageDto } from "../config/ShareConfig";
import { CloseInviteEvent, ShareRefreshEvent } from "../event/ShareEvents";
import { ShareModel } from "../model/ShareModel";
import { shareLinkCopy, shareWhatsApp } from "../utility/ShareActions";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { PlatformSystem } from "../../../../../script/game/system/PlatformSystem";
import { Utility } from "../../../../../script/game/utility/Utility";
import { ShareListScrollHelper } from "./ShareListScrollHelper";

const { ccclass, property } = _decorator;

@ccclass("ShareMainPage")
export class ShareMainPageDialog extends BaseDialog {
    @property(Node)
    public homeNode: Node = null;

    @property(Node)
    public rankMoban: Node = null;

    @property(Node)
    public hisMobanNode: Node = null;

    @property(Node)
    public hisScrollViewNode: Node = null;

    @property(Node)
    public hisNoDataNode: Node = null;

    @property(Node)
    public hisTitleNode: Node = null;

    @property(Node)
    public hisboardNode: Node = null;

    @property(Node)
    public scrollViewNode: Node = null;

    @property(Node)
    public tabNode: Node = null;

    @property(Label)
    public broadcastLabel: Label = null;

    @property(RichText)
    public broadcastRichLabel: RichText = null;

    private curTab = 0;
    private shareUrl = "";
    private shareText = "";
    private carousel: string[] = [];
    private rankPage = 0;
    private rankHasNext = 0;
    private rankLoading = false;
    private earnLoading = false;
    private lastShareClick = 0;
    private broadcastTween: ReturnType<typeof tween> | null = null;
    private embedded = false;

    public setEmbeddedMode(on: boolean): void {
        this.embedded = on;
    }

    protected OnInit(): void {
        this.resolveNodes();
        const model = GameApp.Interface.GetModel(ShareModel);
        model.page.RegisterWithInitValue((p) => this.applyPage(p), this).UnRegisterWhenGameObjectDestroyed(this.node);
        model.rank.RegisterWithInitValue((r) => this.applyRank(r.rankList, r.page), this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
        model.earnRecords.RegisterWithInitValue((list) => this.refreshEarnList(list), this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
        GameApp.Interface.RegisterEvent(ShareRefreshEvent, () => {
            GameApp.Interface.SendCommand(new FetchSharePageCommand());
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);

        const helper = this.hisScrollViewNode?.getComponent(ShareListScrollHelper);
        helper?.bindReachBottom(() => {
            if (this.earnLoading || model.earnHasNext.value !== 1) {
                return;
            }
            this.earnLoading = true;
            GameApp.Interface.SendCommand(
                new FetchShareEarnDetailsCommand(model.earnPage.value + 1, true, () => {
                    this.earnLoading = false;
                }),
            );
        });
    }

    protected onEnable(): void {
        const model = GameApp.Interface.GetModel(ShareModel);
        if (!model.page.value) {
            GameApp.Interface.SendCommand(new FetchSharePageCommand());
        } else {
            this.applyPage(model.page.value);
        }
        this.curTab = 0;
        this.updateTabView();
        this.dealTabContentLogic();
        this.rankPage = 0;
        GameApp.Interface.SendCommand(
            new FetchShareRankListCommand(1, false, () => {
                this.rankPage = 1;
            }),
        );
    }

    private resolveNodes(): void {
        const root = find("root", this.node) ?? this.node;
        this.homeNode = this.homeNode ?? find("content/center/home_node", root) ?? find("home_node", root);
        this.rankMoban = this.rankMoban ?? find("rank_moban", this.homeNode ?? root);
        this.tabNode = this.tabNode ?? find("content/select_diban", root) ?? find("tabNode", root);
        this.scrollViewNode = this.scrollViewNode ?? find("content/center/scrollView", root);
        this.hisScrollViewNode = this.hisScrollViewNode ?? find("content/center/his_scroll", root);
        this.hisMobanNode = this.hisMobanNode ?? find("his_moban", root);
        this.hisNoDataNode = this.hisNoDataNode ?? find("his_nodata", root);
        this.hisTitleNode = this.hisTitleNode ?? find("his_title", root);
        this.hisboardNode = this.hisboardNode ?? find("hisboard", root);
        const bc = find("content/broadcast", root);
        if (bc) {
            this.broadcastLabel = this.broadcastLabel ?? bc.getComponentInChildren(Label);
            this.broadcastRichLabel = this.broadcastRichLabel ?? bc.getComponentInChildren(RichText);
        }
        if (this.rankMoban) {
            this.rankMoban.active = false;
        }
        if (this.hisMobanNode) {
            this.hisMobanNode.active = false;
        }
    }

    private applyPage(page: SharePageDto | null): void {
        if (!page) {
            return;
        }
        this.shareUrl = page.share_url ?? "";
        this.shareText = page.share_text ?? "";
        this.carousel = page.carousel ?? [];
        if (this.carousel.length > 0) {
            this.playBroadcast(0);
        }
        const earnRoot = find("content/earn_node", find("root", this.node) ?? this.node);
        if (earnRoot) {
            const cashLab = find("cash/num", earnRoot)?.getComponent(Label);
            const bonusLab = find("bonus/num", earnRoot)?.getComponent(Label);
            if (cashLab && page.total_cash !== undefined) {
                cashLab.string = Utility.format.money(page.total_cash);
            }
            if (bonusLab && page.total_bonus !== undefined) {
                bonusLab.string = Utility.format.money(page.total_bonus);
            }
        }
    }

    private applyRank(data: { rank_list?: RankEntryDto[]; has_next?: number; user_share_data?: RankEntryDto }, page: number): void {
        if (!this.homeNode) {
            return;
        }
        this.rankPage = page > 0 ? page : this.rankPage;
        this.rankHasNext = data.has_next ?? 0;
        const btnMore = find("btn_more", this.homeNode);
        if (btnMore) {
            btnMore.active = this.rankHasNext === 1;
        }
        const list = data.rank_list ?? [];
        const rankRoot = find("rank_root", this.homeNode);
        if (!rankRoot || !this.rankMoban) {
            return;
        }
        rankRoot.removeAllChildren();
        const top = find("earn_rank", this.homeNode);
        if (top && list.length > 0) {
            top.active = true;
            for (let i = 0; i < 3; i++) {
                const slot = find(`player${i}`, top);
                const row = list[i];
                if (!slot || !row) {
                    continue;
                }
                const nameLab = find("name", slot)?.getComponent(Label);
                const cashLab = find("cash", slot)?.getComponent(Label);
                if (nameLab && row.name) {
                    nameLab.string = row.name;
                }
                if (cashLab && row.cash !== undefined) {
                    cashLab.string = Utility.format.money(row.cash);
                }
            }
        }
        const userRow = data.user_share_data;
        let skip = 3;
        if (userRow) {
            const me = instantiate(this.rankMoban);
            me.active = true;
            rankRoot.addChild(me);
            this.fillRankMoban(me, userRow);
            if (userRow.rank === 4) {
                skip = 4;
            }
        }
        for (let i = skip; i < list.length; i++) {
            const row = instantiate(this.rankMoban);
            row.active = true;
            rankRoot.addChild(row);
            this.fillRankMoban(row, list[i]);
        }
        rankRoot.getComponent(Layout)?.updateLayout();
    }

    private fillRankMoban(node: Node, row: RankEntryDto): void {
        const num = find("num", node)?.getComponent(Label);
        const name = find("name", node)?.getComponent(Label);
        const refer = find("refer", node)?.getComponent(Label);
        if (num) {
            num.string = row.rank === 0 ? "Not\nListed" : String(row.rank ?? "");
        }
        if (name && row.name) {
            name.string = row.name;
        }
        if (refer && row.invite_num !== undefined) {
            refer.string = String(row.invite_num);
        }
        const prize = find("prize_node", node);
        if (prize) {
            const cash = find("cash", prize);
            const bonus = find("bonus", prize);
            if (cash) {
                cash.active = (row.cash ?? 0) > 0;
                const lab = find("num", cash)?.getComponent(Label);
                if (lab && row.cash !== undefined) {
                    lab.string = Utility.format.money(row.cash);
                }
            }
            if (bonus) {
                bonus.active = (row.bonus ?? 0) > 0;
                const lab = find("num", bonus)?.getComponent(Label);
                if (lab && row.bonus !== undefined) {
                    lab.string = Utility.format.money(row.bonus);
                }
            }
        }
    }

    private refreshEarnList(list: EarnRecordDto[]): void {
        const parent = this.hisScrollViewNode?.getChildByName("view")?.getChildByName("content");
        if (!parent || !this.hisMobanNode) {
            return;
        }
        parent.removeAllChildren();
        if (!list.length) {
            if (this.hisNoDataNode) {
                this.hisNoDataNode.active = this.curTab === 1;
            }
            return;
        }
        if (this.hisNoDataNode) {
            this.hisNoDataNode.active = false;
        }
        for (const row of list) {
            const item = instantiate(this.hisMobanNode);
            item.active = true;
            parent.addChild(item);
            find("name", item)?.getComponent(Label)?.string = row.name ?? "";
            find("date", item)?.getComponent(Label)?.string = row.date ?? "";
            find("htype", item)?.getComponent(Label)?.string = row.reason ?? "";
            const r0 = find("reward_root/reward0", item);
            const r1 = find("reward_root/reward1", item);
            if (r0) {
                r0.active = (row.cash ?? 0) > 0;
                find("wz", r0)?.getComponent(Label)?.string = Utility.format.money(row.cash ?? 0);
            }
            if (r1) {
                r1.active = (row.bonus ?? 0) > 0;
                find("wz", r1)?.getComponent(Label)?.string = Utility.format.money(row.bonus ?? 0);
            }
        }
    }

    public onBtnClick(_e: unknown, custom: string): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        const now = Date.now();
        if (custom === "whatsapp") {
            const platform = GameApp.Interface.GetSystem(PlatformSystem);
            if (!platform.isPackageInstalled("com.whatsapp")) {
                shareLinkCopy(this.shareText, this.shareUrl);
                return;
            }
            if (now - this.lastShareClick < 500) {
                return;
            }
            this.lastShareClick = now;
            shareWhatsApp(this.shareText, this.shareUrl);
        } else if (custom === "link") {
            if (now - this.lastShareClick < 500) {
                return;
            }
            this.lastShareClick = now;
            shareLinkCopy(this.shareText, this.shareUrl);
        } else if (custom === "tab0") {
            this.curTab = 0;
            this.updateTabView();
            this.dealTabContentLogic();
        } else if (custom === "tab1" || custom === "history") {
            this.curTab = 1;
            this.updateTabView();
            this.dealTabContentLogic();
            this.loadEarnFirstPage();
        } else if (custom === "close") {
            this.onBackView();
        } else if (custom === "more") {
            if (this.rankHasNext !== 1 || this.rankLoading) {
                return;
            }
            this.rankLoading = true;
            GameApp.Interface.SendCommand(
                new FetchShareRankListCommand(this.rankPage + 1, true, () => {
                    this.rankLoading = false;
                    this.rankPage += 1;
                }),
            );
        }
    }

    private loadEarnFirstPage(): void {
        this.earnLoading = true;
        GameApp.Interface.SendCommand(
            new FetchShareEarnDetailsCommand(1, false, () => {
                this.earnLoading = false;
                const model = GameApp.Interface.GetModel(ShareModel);
                const user = model.rank.value.rankList.user_share_data;
                if (this.hisboardNode && user) {
                    this.hisTitleNode?.active = true;
                    this.hisboardNode.active = true;
                    find("cash", this.hisboardNode)?.getComponent(Label)?.string = Utility.format.money(user.cash ?? 0);
                    find("bonus", this.hisboardNode)?.getComponent(Label)?.string = Utility.format.money(user.bonus ?? 0);
                }
            }),
        );
    }

    private updateTabView(): void {
        if (!this.tabNode) {
            return;
        }
        const homeBtn = find("hone_btn", this.tabNode);
        const histBtn = find("history_btn", this.tabNode);
        const on = color(147, 11, 11);
        const off = color(102, 102, 102);
        find("line", homeBtn)?.active = this.curTab === 0;
        find("line", histBtn)?.active = this.curTab === 1;
        homeBtn?.getChildByName("Label")?.getComponent(Label)?.color = this.curTab === 0 ? on : off;
        histBtn?.getChildByName("Label")?.getComponent(Label)?.color = this.curTab === 1 ? on : off;
    }

    private dealTabContentLogic(): void {
        if (this.scrollViewNode) {
            this.scrollViewNode.active = this.curTab === 0;
            this.scrollViewNode.getComponent(ScrollView)?.scrollToTop(0.1);
        }
        if (this.hisScrollViewNode) {
            this.hisScrollViewNode.active = this.curTab === 1;
            this.hisScrollViewNode.getComponent(ScrollView)?.scrollToTop(0.1);
        }
    }

    private playBroadcast(index: number): void {
        if (!this.broadcastRichLabel || this.carousel.length === 0) {
            return;
        }
        let i = index;
        if (i >= this.carousel.length) {
            i = 0;
        }
        const text = this.carousel[i];
        if (this.broadcastLabel) {
            this.broadcastLabel.string = text;
        }
        this.broadcastRichLabel.string = text;
        this.scheduleOnce(() => {
            const parentH = this.broadcastRichLabel.node.parent?.getComponent(UITransform)?.height ?? 40;
            this.broadcastRichLabel.node.setPosition(v3(0, -parentH, 0));
            this.broadcastTween = tween(this.broadcastRichLabel.node)
                .to(0.7, { position: v3(0, -8, 0) })
                .delay(3)
                .to(0.7, { position: v3(0, parentH, 0) })
                .delay(1)
                .call(() => {
                    this.broadcastTween = null;
                    this.playBroadcast(i + 1);
                })
                .start();
        }, 0.05);
    }

    public onBackView(): void {
        if (this.embedded) {
            this.node.active = false;
        } else {
            this.CloseSelf();
        }
        GameApp.Interface.SendEvent(new CloseInviteEvent());
    }

    protected OnClose(): void {
        if (this.broadcastTween) {
            this.broadcastTween.stop();
            this.broadcastTween = null;
        }
    }
}
