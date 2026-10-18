import { find, Label, Node, sp } from "cc";
import { SixpointGameSceneController } from "../controller/SixpointGameSceneController";
import { SixpointMainView } from "../ui/SixpointMainView";
import { SixpointTablePanel } from "../ui/SixpointTablePanel";
import { SixpointActionPanel } from "../ui/SixpointActionPanel";
import { SixpointTipPanel } from "../ui/SixpointTipPanel";
import { SixpointCardPlayerPanel } from "../ui/SixpointCardPlayerPanel";
import { SixpointChatPanel } from "../ui/SixpointChatPanel";

function labelUnder(root: Node | null, name: string): Label | null {
    if (!root) {
        return null;
    }
    const n = find(name, root) ?? root.getChildByName(name);
    return n?.getComponent(Label) ?? null;
}

export function bootstrapSixpointScene(canvas: Node): void {
    if (!canvas.getComponent(SixpointGameSceneController)) {
        canvas.addComponent(SixpointGameSceneController);
    }
    let main = canvas.getComponent(SixpointMainView);
    if (!main) {
        main = canvas.addComponent(SixpointMainView);
    }
    const root = find("root", canvas) ?? canvas;
    const tableNode = find("table_layout", root);
    let table = tableNode?.getComponent(SixpointTablePanel);
    if (tableNode && !table) {
        table = tableNode.addComponent(SixpointTablePanel);
    }
    if (table && tableNode) {
        for (let i = 0; i < 6; i++) {
            if (!table.meBetLabels[i]) {
                table.meBetLabels[i] = labelUnder(tableNode, `xz_me_gold${i}`);
            }
            if (!table.allBetLabels[i]) {
                table.allBetLabels[i] = labelUnder(tableNode, `xz_other_gold${i}`);
            }
        }
        if (table.trendRoots.length === 0) {
            for (let i = 0; i < 6; i++) {
                const tr =
                    find(`trendlist${i}`, tableNode) ??
                    find(`trend_root${i}`, tableNode) ??
                    tableNode.getChildByName(`trendlist${i}`);
                if (tr) {
                    table.trendRoots.push(tr);
                }
            }
        }
        if (!table.dsMoban) {
            table.dsMoban = find("dsMoban", tableNode) ?? tableNode.getChildByName("dsMoban");
        }
    }

    const actionNode = find("action_root", root);
    let action = actionNode?.getComponent(SixpointActionPanel);
    if (actionNode && !action) {
        action = actionNode.addComponent(SixpointActionPanel);
    }
    if (action && actionNode) {
        action.operateView = find("operateView", actionNode) ?? actionNode.getChildByName("operateView");
        action.bindGullakClick(() => {
            void import("../../../../../activity/piggy_bank/script/PiggyBankModule")
                .then((m) => m.openPiggyBankDialog?.())
                .catch(() => undefined);
        });
    }

    const tipNode = find("tip_root", root);
    let tip = tipNode?.getComponent(SixpointTipPanel);
    if (tipNode && !tip) {
        tip = tipNode.addComponent(SixpointTipPanel);
    }
    if (tip && tipNode) {
        const roll = find("rollDiceAnim", tipNode) ?? tipNode.getChildByName("rollDiceAnim");
        tip.rollDiceAnim = roll?.getComponent(sp.Skeleton) ?? null;
        tip.stateAnim = find("stateAnim", tipNode)?.getComponent(sp.Skeleton) ?? null;
        tip.initFromScene(tipNode);
    }

    const cardNode = find("card_player_root", root);
    let card = cardNode?.getComponent(SixpointCardPlayerPanel);
    if (cardNode && !card) {
        card = cardNode.addComponent(SixpointCardPlayerPanel);
    }
    if (card && cardNode) {
        card.selfCoinLabel =
            find("player6/name_bg/coin", cardNode)?.getComponent(Label) ??
            cardNode.getChildByName("player6")?.getChildByName("name_bg")?.getChildByName("coin")?.getComponent(Label) ??
            null;
        card.noSeatCountLabel =
            cardNode.getChildByName("player7")?.getChildByName("numbg")?.getChildByName("num")?.getComponent(Label) ??
            null;
        card.bindSeatNodes(cardNode);
    }

    const chatNode = find("chat_root", root);
    if (chatNode && !chatNode.getComponent(SixpointChatPanel)) {
        chatNode.addComponent(SixpointChatPanel);
    }
    const chatBtn = find("chat_btn", root) ?? find("chat_btn", chatNode ?? root);
    chatNode?.getComponent(SixpointChatPanel)?.bindChatButton(chatBtn);

    if (main) {
        main.tablePanel = table;
        main.actionPanel = action;
        main.tipPanel = tip;
        main.cardPlayerPanel = card;
    }
}
