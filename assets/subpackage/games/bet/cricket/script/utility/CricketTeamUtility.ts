import { AbstractUtility } from "../../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { CricketPlayerTpl } from "../config/CricketProtocol";

const SQUAD_SIZE = 11;

export class CricketTeamUtility extends AbstractUtility {
    public validateLocal(playerIds: number[], captainId: number, viceId: number): boolean {
        if (playerIds.length !== SQUAD_SIZE) {
            LogKit.W("[CricketTeamUtility] squad size {0}", playerIds.length);
            return false;
        }
        const set = new Set(playerIds);
        if (set.size !== SQUAD_SIZE) {
            return false;
        }
        if (!set.has(captainId) || !set.has(viceId) || captainId === viceId) {
            return false;
        }
        return true;
    }

    public sumCredits(pool: CricketPlayerTpl[], playerIds: number[]): number {
        const byId = new Map(pool.map((p) => [p.player_id, p.credit]));
        let sum = 0;
        for (const id of playerIds) {
            sum += byId.get(id) ?? 0;
        }
        return Math.round(sum * 10) / 10;
    }
}
