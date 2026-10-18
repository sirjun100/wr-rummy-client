import { AbstractSystem } from "../../../../../script/framework/QFramework";
import { NetworkInboundActivityEvent } from "../../../../../script/game/event/NetworkInboundActivityEvent";
import { NetworkDelayModel } from "../model/NetworkDelayModel";
import { ShowNetworkDelayOverlayCommand } from "../command/ShowNetworkDelayOverlayCommand";
import { SwitchGameGateCommand } from "../command/SwitchGameGateCommand";
import { OpenNetworkDisconnectAlertCommand } from "../command/OpenNetworkDisconnectAlertCommand";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";

export class NetworkDelaySystem extends AbstractSystem {
    private tickTimer: ReturnType<typeof setInterval> | null = null;
    private watching = false;

    protected OnInit(): void {
        this.RegisterEvent(NetworkInboundActivityEvent, () => this.onInbound(), this);
    }

    protected OnDeinit(): void {
        this.stopWatch();
    }

    public startWatch(): void {
        if (this.watching) {
            return;
        }
        const model = this.GetModel(NetworkDelayModel);
        if (!model.isHeartOpen()) {
            return;
        }
        this.watching = true;
        this.tickTimer = setInterval(() => this.onTick(), 1000);
    }

    public stopWatch(): void {
        this.watching = false;
        if (this.tickTimer) {
            clearInterval(this.tickTimer);
            this.tickTimer = null;
        }
    }

    private onInbound(): void {
        const model = this.GetModel(NetworkDelayModel);
        model.silentSec.value = 0;
        model.hasReconnectIntent = false;
        model.alertShown = false;
        if (model.overlayVisible.value) {
            this.SendCommand(new ShowNetworkDelayOverlayCommand(false));
        }
        const cfg = model.config.value;
        if ((cfg.games_delay_open ?? 0) === 1) {
            const last = this.GetSystem(NetworkSystem).getLastInboundAtMs();
            if (last > 0) {
                model.lastPingMs.value = Math.min(999, Date.now() - last);
            }
        }
    }

    private onTick(): void {
        const model = this.GetModel(NetworkDelayModel);
        if (model.activeDisconnect) {
            model.silentSec.value = 0;
            return;
        }
        const warn = model.warnThreshold();
        const max = model.disconnectThreshold();
        const next = model.silentSec.value + 1;
        model.silentSec.value = next;

        if ((model.config.value.games_delay_open ?? 0) === 1) {
            const last = this.GetSystem(NetworkSystem).getLastInboundAtMs();
            if (last > 0) {
                model.lastPingMs.value = Math.min(999, Date.now() - last);
            }
        }

        if (next > warn && next < max) {
            this.SendCommand(new ShowNetworkDelayOverlayCommand(true));
            if (next === warn + 1) {
                model.hasReconnectIntent = true;
            }
            const mid = warn + Math.floor((max - warn) / 2) + 1;
            if (next === mid) {
                this.SendCommand(new SwitchGameGateCommand());
            }
        } else if (next >= max && !model.alertShown) {
            model.alertShown = true;
            model.hasReconnectIntent = true;
            this.SendCommand(new OpenNetworkDisconnectAlertCommand());
        }
    }
}
