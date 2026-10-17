import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import { DailyWorkPageDto } from "../config/DailyWorkConfig";

export class DailyWorkModel extends AbstractModel {
    public readonly page = new BindableProperty<DailyWorkPageDto | null>(null);

    protected OnInit(): void {}
}
