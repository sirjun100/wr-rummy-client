export type SupportChannelsDto = {
    email?: string;
    whatsapp?: string;
    telegram?: string;
    feedback_url?: string;
    support_enabled?: number;
};

export type FaqItemDto = { q?: string; a?: string };

export type FaqCategoryDto = {
    id?: string;
    title?: string;
    items?: FaqItemDto[];
};

export type FaqPageRes = {
    code?: number;
    categories?: FaqCategoryDto[];
};

export type FeedbackSubmitReq = {
    scene?: string;
    content?: string;
    contact?: string;
};

export type CodeRes = { code?: number };

export type CommonAlertUiData = {
    title?: string;
    content?: string;
    onOk?: () => void;
    onCancel?: () => void;
    withCancel?: boolean;
    landscape?: boolean;
};

export type HelpAlertUiData = { tips?: string };

export type GameSettingUiData = { landscape?: boolean };

export type RewardTipsUiData = {
    tips?: string;
    rewards?: { name?: string; amount?: string }[];
    onConfirm?: () => void;
    onCancel?: () => void;
};

export type MatchAlertUiData = {
    title?: string;
    tips?: string;
    onEnter?: () => void;
    onCancel?: () => void;
};

export type MatchRankUiData = {
    title?: string;
    rows?: { rank?: number; name?: string; score?: string }[];
};

export type MatchPrizesRankUiData = MatchRankUiData & { prizeLabel?: string };

export type BuddyJoinUiData = {
    onSubmit?: (roomCode: string) => void;
};
