import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import { WeeklyMonthCardPageDto } from "../config/WeeklyMonthCardConfig";

export class WeeklyMonthCardModel extends AbstractModel {
    public readonly page = new BindableProperty<WeeklyMonthCardPageDto | null>(null);
    public readonly tips = new BindableProperty<string | null>(null);

    protected OnInit(): void {}
}
