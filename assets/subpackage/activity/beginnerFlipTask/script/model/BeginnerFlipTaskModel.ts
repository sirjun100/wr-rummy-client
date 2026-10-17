import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import {
    BeginnerFlipPageDto,
    BeginnerFlipRecordItemDto,
} from "../config/BeginnerFlipTaskConfig";

export class BeginnerFlipTaskModel extends AbstractModel {
    public readonly page = new BindableProperty<BeginnerFlipPageDto | null>(null);
    public readonly records = new BindableProperty<BeginnerFlipRecordItemDto[]>([]);

    protected OnInit(): void {}
}
