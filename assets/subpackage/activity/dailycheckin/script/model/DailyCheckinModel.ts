import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import { DailyCheckinPageDto } from "../config/DailyCheckinConfig";

export class DailyCheckinModel extends AbstractModel {
    public readonly page = new BindableProperty<DailyCheckinPageDto | null>(null);

    protected OnInit(): void {}
}
