import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import type { MailItemDto } from "../config/LobbyTopViewProtocol";

export class LobbyTopViewModel extends AbstractModel {
    readonly inboxList = new BindableProperty<MailItemDto[]>([]);
    readonly inboxCursor = new BindableProperty<string>("");
    readonly unreadCount = new BindableProperty<number>(0);
    readonly promotionsRed = new BindableProperty<number>(0);

    protected OnInit(): void {}
}
