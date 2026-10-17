import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import { RestartGiftPageDto } from "../config/RechargeEventConfig";

export class RestartGiftModel extends AbstractModel {
    public readonly page = new BindableProperty<RestartGiftPageDto | null>(null);
    protected OnInit(): void {}
}
