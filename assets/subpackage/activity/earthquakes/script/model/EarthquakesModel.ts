import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import { EarthquakesPageDto, EarthquakesRankDto, EarthquakesTaskDto } from "../config/EarthquakesConfig";

export class EarthquakesModel extends AbstractModel {
    public readonly mainPage = new BindableProperty<EarthquakesPageDto | null>(null);
    public readonly task = new BindableProperty<EarthquakesTaskDto | null>(null);
    public readonly rank = new BindableProperty<EarthquakesRankDto | null>(null);

    protected OnInit(): void {}
}
