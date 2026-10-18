import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";

export class PurseUiModel extends AbstractModel {
    public readonly selectedSkuId = new BindableProperty<number>(0);
    public readonly selectedChannelId = new BindableProperty<number>(1);
    public readonly selectedCouponId = new BindableProperty<number>(0);
    public readonly withdrawTab = new BindableProperty<number>(0);

    protected OnInit(): void {}
}
