import type { HallHomeDto } from "../config/LobbyProtocol";
import { enqueueLobbyActivity, runNextLobbyActivity } from "../../../../social/inviteShare/script/utility/LobbyActivityQueue";

/** P0: announce/update guide then advance lobby activity queue. */
export function onLobbyHomeReady(_home: HallHomeDto): void {
    enqueueLobbyActivity(() =>
        import("../../hallHeader/script/LobbyTopViewModule").then((m) => {
            m.enqueueAnnounceOnLobbyEnter();
        }),
    );
    runNextLobbyActivity();
}
