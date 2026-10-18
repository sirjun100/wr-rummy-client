import { _decorator, Component, find, Label, ProgressBar, tween } from "cc";
import { GameApp } from "../../../../../../script/game/GameApp";
import { AudioFxId } from "../../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../../script/game/system/AudioSystem";
import type { ProgressItemDto } from "../../../../function/tableChrome/roomLeaderboard/script/config/GameActLeaderboardProtocol";
import { RoomChallengerProgressEvent } from "../../../../function/tableChrome/roomLeaderboard/script/event/GameActLeaderboardEvents";

const { ccclass } = _decorator;

/** Progress bar on `leader_boards_btn` (legacy RummyActionRoot.refreshRankProgress). */
@ccclass("RummyChallengerProgressView")
export class RummyChallengerProgressView extends Component {
    private lastRate = 0;

    protected onLoad(): void {
        GameApp.Interface.RegisterEvent(RoomChallengerProgressEvent, (e) => this.onProgress(e.list), this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
    }

    public applyProgress(item: ProgressItemDto): void {
        const barNode = find("ProgressBar", this.node) ?? this.node.getChildByName("ProgressBar");
        const bar = barNode?.getComponent(ProgressBar);
        if (!bar) {
            return;
        }
        const target = Number(item.progress_rate ?? 0);
        const from = this.lastRate;
        const pointsLbl = find("points", this.node)?.getComponent(Label);
        if (pointsLbl && item.incr_points && item.incr_points > 0) {
            pointsLbl.node.active = true;
            pointsLbl.string = `+${item.incr_points}`;
        } else if (pointsLbl) {
            pointsLbl.node.active = false;
        }
        tween(barNode)
            .delay(0.2)
            .to(
                1,
                { position: barNode.position },
                {
                    onUpdate: (_t, ratio) => {
                        bar.progress = from + (target - from) * ratio;
                    },
                },
            )
            .call(() => {
                bar.progress = target;
                this.lastRate = target;
                if (Number(item.is_completed ?? 0) === 1) {
                    this.lastRate = 0;
                    GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
                }
            })
            .start();
    }

    private onProgress(list: ProgressItemDto[]): void {
        if (!list.length) {
            return;
        }
        this.applyProgress(list[0]);
    }

    public setLeaderBoardsVisible(show: boolean, prizeText: string): void {
        this.node.active = show;
        if (show && prizeText) {
            const wz = find("wz", this.node)?.getComponent(Label);
            if (wz) {
                wz.string = prizeText;
            }
        }
    }
}
