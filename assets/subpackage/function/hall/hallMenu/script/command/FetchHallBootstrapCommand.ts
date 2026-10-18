import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { SessionModel } from "../../../../../script/game/model/SessionModel";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { HallRoute, type HallBootstrapRes } from "../config/HallConfig";
import { HallConfigModel } from "../model/HallConfigModel";
import { HallPlayerModel } from "../model/HallPlayerModel";
import type { HallHomeReq } from "../../lobby/script/config/LobbyProtocol";

export type FetchHallBootstrapOptions = {
    chainHallHome?: HallHomeReq | boolean;
};

export class FetchHallBootstrapCommand extends AbstractCommand {
    constructor(private readonly options: FetchHallBootstrapOptions = {}) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<HallBootstrapRes>(HallRoute.HallBootstrap, {})
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    LogKit.W("[FetchHallBootstrapCommand] code={0}", res.code);
                    return;
                }
                const session = this.GetModel(SessionModel);
                const player = { ...res.player, uid: res.player?.uid ?? session.uid };
                this.GetModel(HallPlayerModel).apply(player);
                if (res.config) {
                    this.GetModel(HallConfigModel).applyConfig(res.config);
                }
                if (res.help) {
                    this.GetModel(HallConfigModel).applyHelp(res.help);
                }
                if (res.support) {
                    void import("../../../../shared/commonUi/script/PublicModule").then((m) => {
                        m.applySupportChannels(res.support);
                    });
                }
                void Promise.all([
                    import("../../../../tableChrome/tableTheme/script/DeskModule"),
                    import("../../../../tableChrome/tableTheme/script/command/SyncDeskStyleFromHallCommand"),
                    import("../../../../tableChrome/tableTheme/script/command/PreloadDeskTexturesCommand"),
                ]).then(([desk, syncMod, preloadMod]) => {
                    desk.ensureDeskRegistered();
                    this.SendCommand(new syncMod.SyncDeskStyleFromHallCommand(player));
                    this.SendCommand(new preloadMod.PreloadDeskTexturesCommand());
                });
                void import("../../../../social/inviteShare/script/CommShareModule").then((m) => m.syncShareFlagsFromHall());
                if (player.player_club) {
                    void import("../../../../commerce/vipClub/script/MembershipModule").then((m) => {
                        m.ensureMembershipRegistered();
                        void import("../../../../commerce/vipClub/script/command/ApplyMembershipPlayerClubCommand").then(
                            ({ ApplyMembershipPlayerClubCommand }) => {
                                this.SendCommand(new ApplyMembershipPlayerClubCommand(player.player_club!));
                            },
                        );
                    });
                }
                if (this.options.chainHallHome) {
                    const req =
                        this.options.chainHallHome === true
                            ? {}
                            : this.options.chainHallHome;
                    void import("../../lobby/script/command/FetchHallHomeCommand").then(({ FetchHallHomeCommand }) => {
                        this.SendCommand(new FetchHallHomeCommand(req));
                    });
                }
            })
            .catch((err) => {
                LogKit.W("[FetchHallBootstrapCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}
