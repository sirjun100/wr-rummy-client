import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { HALL_ACT_BUTTON_NODES } from "../config/LobbyConfig";
import type { HallHomeDto } from "../config/LobbyProtocol";
import { LobbyModel } from "../model/LobbyModel";

export function computeVisibleHallActIds(home: HallHomeDto): number[] {
    const open = home.act_list_open ?? {};
    const isOpen = (actId: number): boolean => {
        const key = `act_${actId}`;
        const v = open[key];
        return v === undefined || v === 1;
    };

    const ids: number[] = [];
    if (home.show_sgame === 1) {
        const list = home.play_collect_open?.list ?? [];
        const sorted = [...list].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
        for (const item of sorted) {
            if (isOpen(item.act_id)) {
                ids.push(item.act_id);
            }
        }
    }
    for (const item of home.act_collect_open?.list ?? []) {
        if (isOpen(item.act_id) && !ids.includes(item.act_id)) {
            ids.push(item.act_id);
        }
    }
    return ids;
}

export class ApplyHallActVisibilityCommand extends AbstractCommand {
    protected OnExecute(): void {
        const home = this.GetModel(LobbyModel).home.value;
        const actIds = computeVisibleHallActIds(home);
        this.GetModel(LobbyModel).gameEntryActIds.value = actIds;
        const wr = globalThis.wrLobby;
        wr?.refreshHallActButtons?.(actIds);
        this.applyNamedButtons(actIds);
    }

    private applyNamedButtons(actIds: number[]): void {
        const has = (id: number) => actIds.includes(id);
        for (const [actId, nodeName] of Object.entries(HALL_ACT_BUTTON_NODES)) {
            const id = Number(actId);
            const wr = globalThis.wrLobby;
            wr?.setHallActButtonVisible?.(nodeName, has(id));
        }
    }
}
