import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import type { RegularTabId } from "../config/RegularConfig";
import type { HallRegularOpenData } from "../config/RegularProtocol";

export class RegularUiModel extends AbstractModel {
    public readonly lastTab = new BindableProperty<RegularTabId>("point");
    public readonly hallOpen = new BindableProperty<HallRegularOpenData | null>(null);

    protected OnInit(): void {}
}
