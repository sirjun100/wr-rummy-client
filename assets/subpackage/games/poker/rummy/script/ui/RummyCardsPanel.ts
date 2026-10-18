import { _decorator, Component, instantiate, Label, Node, Prefab } from "cc";
import { GameApp } from "../../../../../../script/game/GameApp";
import { RummyCardDto } from "../config/RummyProtocol";
import { RummyHandCardsEvent } from "../event/RummyEvents";
import { RummyModel } from "../model/RummyModel";
import { RummyCardCodec } from "../utility/RummyCardCodec";
import { RummyMeldHelper } from "../utility/RummyMeldHelper";
import { RummyActionPanel } from "./RummyActionPanel";

const { ccclass, property } = _decorator;

@ccclass("RummyCardsPanel")
export class RummyCardsPanel extends Component {
    @property(Label)
    public handLabel: Label | null = null;

    @property(Prefab)
    public cardPrefab: Prefab | null = null;

    @property(Node)
    public handRoot: Node | null = null;

    protected onLoad(): void {
        GameApp.Interface.RegisterEvent(RummyHandCardsEvent, this.onHand, this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
    }

    private onHand(e: RummyHandCardsEvent): void {
        const model = GameApp.Interface.GetModel(RummyModel);
        model.groups = RummyMeldHelper.defaultGroups(e.cards);
        if (this.handLabel) {
            this.handLabel.string = `Hand: ${e.cards.length}`;
        }
        this.renderHand(e.cards);
    }

    private renderHand(cards: RummyCardDto[]): void {
        const root = this.handRoot ?? this.node;
        root.removeAllChildren();
        const action = this.node.parent?.getComponentInChildren(RummyActionPanel);
        for (const c of cards) {
            const legacy = RummyCardCodec.dtoToLegacy(c);
            let cardNode: Node;
            if (this.cardPrefab) {
                cardNode = instantiate(this.cardPrefab);
            } else {
                cardNode = new Node(`card_${c.id}`);
                const lbl = cardNode.addComponent(Label);
                lbl.string = `${legacy}`;
            }
            cardNode.on(Node.EventType.TOUCH_END, () => action?.setSelectedCard(c.id), this);
            root.addChild(cardNode);
        }
    }
}
