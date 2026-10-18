export const PublicLobbyRoute = {
    FaqPage: 1009,
    FeedbackSubmit: 1010,
} as const;

export const FeedbackScenes = ["contact", "feedback", "login", "ingame"] as const;

export const PublicI18n = {
    feedbackEmpty: "Please enter your feedback",
    feedbackOk: "Submitted",
    feedbackFail: "Submit failed",
    faqLoadFail: "Failed to load FAQ",
} as const;

export const MaxFeedbackLength = 2000;
