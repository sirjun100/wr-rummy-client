import { GameApp } from "../../../../../script/game/GameApp";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { SixpointPushPayload } from "../config/SixpointProtocol";
import { SixpointCardPlayerPanel } from "../ui/SixpointCardPlayerPanel";
import { SixpointTablePanel } from "../ui/SixpointTablePanel";
import { SixpointTipPanel } from "../ui/SixpointTipPanel";
import { SixpointModel } from "../model/SixpointModel";

/** Mirrors SixPointMain handler_server_game_end delay chain (seconds). */
export function runSixpointRollSequence(
    payload: SixpointPushPayload,
    tip: SixpointTipPanel | null,
    table: SixpointTablePanel | null,
    card: SixpointCardPlayerPanel | null,
    hostNode: { scheduleOnce: (fn: () => void, delay: number) => void },
): void {
    tip?.playRollResult(payload);
    const model = GameApp.Interface.GetModel(SixpointModel);
    hostNode.scheduleOnce(() => {
        tip?.playWinAnim(payload.win_multiple ?? []);
        tip?.changeWinKuangStatus(payload.win_op ?? []);
    }, 6);
    hostNode.scheduleOnce(() => {
        tip?.flyGoldToZhuangJia(payload.win_op ?? []);
    }, 7);
    hostNode.scheduleOnce(() => {
        tip?.flyGoldToRewardAreas(payload.betAreaInfo ?? []);
    }, 9);
    hostNode.scheduleOnce(() => {
        const win = payload.winscore ?? 0;
        if (win > 0) {
            card?.showFloatWord(6, win);
            if (payload.money != null) {
                card?.updateSelfCoin(payload.money);
            }
            GameApp.Interface.GetSystem(AudioSystem).playFx("win_me");
        }
        if (payload.pointinfo) {
            table?.refreshSeziHistoryRecode(true, model.historyRecord);
        }
    }, 10);
}
