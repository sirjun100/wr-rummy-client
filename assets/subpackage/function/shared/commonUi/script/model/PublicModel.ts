import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import type { FaqCategoryDto, SupportChannelsDto } from "../config/PublicProtocol";

export class PublicModel extends AbstractModel {
    public readonly faq = new BindableProperty<FaqCategoryDto[]>([]);
    public readonly supportChannels = new BindableProperty<SupportChannelsDto>({});

    protected OnInit(): void {}

    public applySupport(ch: SupportChannelsDto | undefined | null): void {
        if (!ch) {
            return;
        }
        this.supportChannels.Value = { ...this.supportChannels.Value, ...ch };
    }
}
