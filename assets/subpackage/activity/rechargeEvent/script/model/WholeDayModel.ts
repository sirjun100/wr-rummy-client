import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import { TwentyFourPageDto } from "../config/RechargeEventConfig";

export class WholeDayModel extends AbstractModel {
    public readonly page = new BindableProperty<TwentyFourPageDto | null>(null);
    protected OnInit(): void {}
}
