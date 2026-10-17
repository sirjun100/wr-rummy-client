import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import { RebateRechargePageDto } from "../config/RechargeEventConfig";

export class RebateModel extends AbstractModel {
    public readonly page = new BindableProperty<RebateRechargePageDto | null>(null);
    protected OnInit(): void {}
}
