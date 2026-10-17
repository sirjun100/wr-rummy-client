import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import { AdvancedGiftPageDto } from "../config/AdvancedGiftTypes";

export class AdvancedGiftModel extends AbstractModel {
    public readonly page = new BindableProperty<AdvancedGiftPageDto | null>(null);

    protected OnInit(): void {}
}
