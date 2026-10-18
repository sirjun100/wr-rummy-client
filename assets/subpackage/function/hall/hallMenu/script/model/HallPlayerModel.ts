import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import type { HallPlayerDto } from "../config/HallConfig";

export class HallPlayerModel extends AbstractModel {
    public readonly player = new BindableProperty<HallPlayerDto>({});

    protected OnInit(): void {}

    public apply(dto: HallPlayerDto): void {
        this.player.value = { ...dto };
    }

    public clear(): void {
        this.player.value = {};
    }
}
