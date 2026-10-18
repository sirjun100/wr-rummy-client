import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { NetworkDelayI18n } from "../config/NetworkDelayConfig";
import { NetworkReconnectCommand } from "./NetworkReconnectCommand";
import { ShowNetworkDelayOverlayCommand } from "./ShowNetworkDelayOverlayCommand";

export class OpenNetworkDisconnectAlertCommand extends AbstractCommand {
    protected OnExecute(): void {
        void import("../../../shared/commonUi/script/PublicModule").then((m) => {
            m.ensurePublicRegistered();
            void import("../../../shared/commonUi/script/command/OpenCommonDialogCommand").then(({ OpenCommonDialogCommand }) => {
                this.SendCommand(
                    new OpenCommonDialogCommand({
                        title: NetworkDelayI18n.disconnectTitle,
                        content: NetworkDelayI18n.disconnectContent,
                        withCancel: false,
                        onOk: () => {
                            this.SendCommand(new NetworkReconnectCommand());
                            this.SendCommand(new ShowNetworkDelayOverlayCommand(false));
                        },
                    }),
                );
            });
        });
    }
}
