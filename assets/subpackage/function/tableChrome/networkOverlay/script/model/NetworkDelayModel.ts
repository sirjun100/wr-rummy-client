import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import type { NetworkDelayConfigDto } from "../config/NetworkDelayProtocol";
import { NetworkDelayDefaults } from "../config/NetworkDelayConfig";

export class NetworkDelayModel extends AbstractModel {
    public readonly config = new BindableProperty<NetworkDelayConfigDto>({
        heart_open: NetworkDelayDefaults.heartOpen,
        heart_time_warn: NetworkDelayDefaults.heartTimeWarn,
        heart_time_disconnect: NetworkDelayDefaults.heartTimeDisconnect,
        games_delay_open: NetworkDelayDefaults.gamesDelayOpen,
        signal_delay_show: NetworkDelayDefaults.signalDelayShow,
    });
    public readonly silentSec = new BindableProperty<number>(0);
    public readonly overlayVisible = new BindableProperty<boolean>(false);
    public readonly lastPingMs = new BindableProperty<number>(0);
    public activeDisconnect = false;
    public hasReconnectIntent = false;
    public alertShown = false;

    protected OnInit(): void {}

    public applyConfig(dto: NetworkDelayConfigDto): void {
        this.config.value = { ...this.config.value, ...dto };
    }

    public isHeartOpen(): boolean {
        return (this.config.value.heart_open ?? 0) === 1;
    }

    public warnThreshold(): number {
        return this.config.value.heart_time_warn ?? NetworkDelayDefaults.heartTimeWarn;
    }

    public disconnectThreshold(): number {
        return this.config.value.heart_time_disconnect ?? NetworkDelayDefaults.heartTimeDisconnect;
    }
}
