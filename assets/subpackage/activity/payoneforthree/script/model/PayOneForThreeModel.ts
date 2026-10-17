import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import { PayOneForThreePageDto } from "../config/PayOneForThreeConfig";

export class PayOneForThreeModel extends AbstractModel {
    public readonly page = new BindableProperty<PayOneForThreePageDto | null>(null);

    protected OnInit(): void {}
}
