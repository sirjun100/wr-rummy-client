import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import { PiggyBankPageDto } from "../config/PiggyBankConfig";

export class PiggyBankModel extends AbstractModel {
    public readonly page = new BindableProperty<PiggyBankPageDto | null>(null);

    protected OnInit(): void {}
}
