export enum TransitionMode {
    ToSubGame = 1,
    ToLobby = 2,
    ToLogin = 3,
}

export const TransitionI18n = {
    loadGameFailed: "utlis.text74",
    loadHallFailed: "utlis.text75",
} as const;

export const TransitionLoadingTimeoutSec = {
    toSubGame: 10,
    toLobby: 15,
    toLogin: 10,
} as const;

export type TransitionRuntimeConfig = {
    enabled: boolean;
    min_hold_ms: number;
    min_exit_game_ms: number;
    skip_in_editor: boolean;
};

export const DefaultTransitionRuntimeConfig: TransitionRuntimeConfig = {
    enabled: true,
    min_hold_ms: 50,
    min_exit_game_ms: 1000,
    skip_in_editor: false,
};
