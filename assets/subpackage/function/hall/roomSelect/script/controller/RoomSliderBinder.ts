import { Label, Node, Slider } from "cc";
import { findDeep } from "../utility/SelectionVenueUiHelper";
import type { RoomCatalogEntryDto } from "../config/SelectionVenueProtocol";

export class RoomSliderBinder {
    private onChange: ((index: number) => void) | null = null;

    public constructor(private readonly roomInfo: Node | null) {}

    public bind(onChange: (index: number) => void): void {
        this.onChange = onChange;
        const sliderRoot = findDeep(this.roomInfo, "slider_view");
        const slider = sliderRoot?.getChildByName("Slider")?.getComponent(Slider);
        if (slider) {
            slider.node.off("slide");
            slider.node.on("slide", () => {
                const max = Math.max(0, slider.max);
                const idx = Math.round(slider.progress * max);
                this.onChange?.(idx);
            });
        }
        const reduce = findDeep(sliderRoot, "btn_reduce");
        const add = findDeep(sliderRoot, "btn_add");
        reduce?.off(Node.EventType.TOUCH_END);
        add?.off(Node.EventType.TOUCH_END);
        reduce?.on(Node.EventType.TOUCH_END, () => this.nudge(-1), this);
        add?.on(Node.EventType.TOUCH_END, () => this.nudge(1), this);
    }

    private nudge(delta: number): void {
        const sliderRoot = findDeep(this.roomInfo, "slider_view");
        const slider = sliderRoot?.getChildByName("Slider")?.getComponent(Slider);
        if (!slider) {
            return;
        }
        const max = Math.max(0, slider.max);
        const idx = Math.round(slider.progress * max) + delta;
        const next = Math.max(0, Math.min(max, idx));
        slider.progress = max === 0 ? 0 : next / max;
        this.onChange?.(next);
    }

    public render(rooms: RoomCatalogEntryDto[], index: number): void {
        const sliderRoot = findDeep(this.roomInfo, "slider_view");
        const slider = sliderRoot?.getChildByName("Slider")?.getComponent(Slider);
        if (slider) {
            const max = Math.max(0, rooms.length - 1);
            slider.max = max;
            slider.progress = max === 0 ? 0 : index / max;
        }
        const betLab = findDeep(sliderRoot, "bet")?.getComponent(Label);
        if (betLab && rooms[index]) {
            betLab.string = String(rooms[index].boot ?? "");
        }
    }
}
