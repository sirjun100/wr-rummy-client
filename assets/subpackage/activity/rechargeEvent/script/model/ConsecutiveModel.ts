import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import { ConsecutiveGiftPageDto } from "../config/RechargeEventConfig";

export class ConsecutiveModel extends AbstractModel {
    public readonly page = new BindableProperty<ConsecutiveGiftPageDto | null>(null);
    protected OnInit(): void {}
}
