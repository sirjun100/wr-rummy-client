import { GameApp } from "../../../../script/game/GameApp";
import { BundleSystem } from "../../../../script/game/system/BundleSystem";
import type { CommonAlertUiData, BuddyJoinUiData, GameSettingUiData, HelpAlertUiData, MatchAlertUiData, MatchPrizesRankUiData, MatchRankUiData, RewardTipsUiData, SupportChannelsDto } from "./config/PublicProtocol";
import { PublicModel } from "./model/PublicModel";
import { OpenCommonDialogCommand } from "./command/OpenCommonDialogCommand";
import { OpenHelpAlertCommand } from "./command/OpenHelpAlertCommand";
import { OpenFaqCommand } from "./command/OpenFaqCommand";
import { OpenContactUsCommand } from "./command/OpenContactUsCommand";
import { OpenFeedbackDialogCommand } from "./command/OpenFeedbackDialogCommand";
import { OpenGameSettingCommand } from "./command/OpenGameSettingCommand";
import { ShowRewardTipsCommand } from "./command/ShowRewardTipsCommand";
import { OpenMatchAlertCommand } from "./command/OpenMatchAlertCommand";
import { OpenMatchRankCommand } from "./command/OpenMatchRankCommand";
import { OpenMatchPrizesRankCommand } from "./command/OpenMatchPrizesRankCommand";
import { OpenBuddyJoinDialogCommand } from "./command/OpenBuddyJoinDialogCommand";

let registered = false;

export function ensurePublicRegistered(): void {
    if (registered) {
        return;
    }
    registered = true;
    GameApp.Interface.RegisterModel(new PublicModel());
}

export function applySupportChannels(ch: SupportChannelsDto | undefined | null): void {
    ensurePublicRegistered();
    GameApp.Interface.GetModel(PublicModel).applySupport(ch);
}

export async function preloadPublic(): Promise<void> {
    ensurePublicRegistered();
    await GameApp.Interface.GetSystem(BundleSystem).loadBundle("commonUi");
}

export function showAlert(data: CommonAlertUiData): void {
    ensurePublicRegistered();
    GameApp.Interface.SendCommand(new OpenCommonDialogCommand(data));
}

export function showHelp(tips: string): void {
    ensurePublicRegistered();
    GameApp.Interface.SendCommand(new OpenHelpAlertCommand({ tips }));
}

export async function openFaq(): Promise<void> {
    ensurePublicRegistered();
    GameApp.Interface.SendCommand(new OpenFaqCommand());
}

export async function openContactUs(): Promise<void> {
    ensurePublicRegistered();
    GameApp.Interface.SendCommand(new OpenContactUsCommand());
}

export function openFeedback(scene = "feedback"): void {
    ensurePublicRegistered();
    GameApp.Interface.SendCommand(new OpenFeedbackDialogCommand({ scene }));
}

export function openGameSetting(opts: GameSettingUiData = {}): void {
    ensurePublicRegistered();
    GameApp.Interface.SendCommand(new OpenGameSettingCommand(opts));
}

export function showRewardTips(data: RewardTipsUiData): void {
    ensurePublicRegistered();
    GameApp.Interface.SendCommand(new ShowRewardTipsCommand(data));
}

export function openMatchAlert(data: MatchAlertUiData): void {
    ensurePublicRegistered();
    GameApp.Interface.SendCommand(new OpenMatchAlertCommand(data));
}

export function openMatchRank(data: MatchRankUiData): void {
    ensurePublicRegistered();
    GameApp.Interface.SendCommand(new OpenMatchRankCommand(data));
}

export function openMatchPrizesRank(data: MatchPrizesRankUiData): void {
    ensurePublicRegistered();
    GameApp.Interface.SendCommand(new OpenMatchPrizesRankCommand(data));
}

export function openBuddyJoin(data: BuddyJoinUiData = {}): void {
    ensurePublicRegistered();
    GameApp.Interface.SendCommand(new OpenBuddyJoinDialogCommand(data));
}

function installApi(): void {
    const g = globalThis as { wrPublic?: Record<string, unknown> };
    const api = {
        ensureRegistered: ensurePublicRegistered,
        preload: preloadPublic,
        applySupportChannels,
        showAlert,
        showHelp,
        openFaq,
        openContactUs,
        openFeedback,
        openGameSetting,
        showRewardTips,
        openMatchAlert,
        openMatchRank,
        openMatchPrizesRank,
        openBuddyJoin,
    };
    g.wrPublic = api;
    (globalThis as { wrCommonUi?: Record<string, unknown> }).wrCommonUi = api;
}

installApi();
