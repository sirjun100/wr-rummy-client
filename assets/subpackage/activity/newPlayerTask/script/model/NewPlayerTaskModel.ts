import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import { NewPlayerTaskPageDto } from "../config/NewPlayerTaskConfig";

export class NewPlayerTaskModel extends AbstractModel {
    public readonly page = new BindableProperty<NewPlayerTaskPageDto | null>(null);

    protected OnInit(): void {}
}
