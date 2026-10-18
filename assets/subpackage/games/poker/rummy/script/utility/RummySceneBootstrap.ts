import { find, Node } from "cc";
import { RummyActionPanel } from "../ui/RummyActionPanel";
import { RummyCardsPanel } from "../ui/RummyCardsPanel";
import { RummyMainView } from "../ui/RummyMainView";
import { RummyPlayerPanel } from "../ui/RummyPlayerPanel";
import { RummyTipPanel } from "../ui/RummyTipPanel";

export type RummySceneRefs = {
    main: RummyMainView | null;
    cards: RummyCardsPanel | null;
    action: RummyActionPanel | null;
    player: RummyPlayerPanel | null;
    tip: RummyTipPanel | null;
};

export function bootstrapRummyScene(root: Node): RummySceneRefs {
    const mainNode =
        find("RummyMain", root) ??
        find("Canvas/RummyMain", root) ??
        find("main_root", root) ??
        root;
    let main = mainNode.getComponent(RummyMainView);
    if (!main) {
        main = mainNode.addComponent(RummyMainView);
    }

    const cardsNode = find("cards_root", mainNode) ?? find("CardsRoot", mainNode);
    const actionNode = find("action_root", mainNode) ?? find("ActionRoot", mainNode);
    const playerNode = find("player_root", mainNode) ?? find("PlayerRoot", mainNode);
    const tipNode = find("tip_root", mainNode) ?? find("TipRoot", mainNode);
    const openCard = find("open_card", mainNode) ?? find("openCard", mainNode);
    if (openCard && main) {
        (main as RummyMainView & { openCardNode?: Node }).openCardNode = openCard;
    }

    const attach = <T extends import("cc").Component>(
        node: Node | null,
        Cls: new () => T,
    ): T | null => {
        if (!node) {
            return null;
        }
        let c = node.getComponent(Cls);
        if (!c) {
            c = node.addComponent(Cls);
        }
        return c;
    };

    return {
        main,
        cards: attach(cardsNode, RummyCardsPanel),
        action: attach(actionNode, RummyActionPanel),
        player: attach(playerNode, RummyPlayerPanel),
        tip: attach(tipNode, RummyTipPanel),
    };
}
