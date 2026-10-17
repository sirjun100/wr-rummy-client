import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import { FirstRechargePageDto } from "../config/RechargeEventConfig";

export class FirstBuyModel extends AbstractModel {
    public readonly page = new BindableProperty<FirstRechargePageDto | null>(null);
    protected OnInit(): void {}
}
