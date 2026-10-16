/** 常用音效逻辑名 → sound bundle 内 clip 名（无扩展名） */
export const AudioFxId = {
    Click: "click",
    SelectTime: "select_time",
    ActPopShow: "act_popshow",
} as const;

/** 逻辑名别名（旧工程 click 等资源未迁入时用替代 clip） */
export const AUDIO_FX_ALIASES: Record<string, string> = {
    [AudioFxId.Click]: AudioFxId.SelectTime,
};
