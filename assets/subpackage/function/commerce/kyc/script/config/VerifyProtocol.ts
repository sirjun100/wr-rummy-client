import type { KycPageDto, ProfileDto } from "../../../../../script/game/commerce/config/PaymentProtocol";

export type PersonBindType = "tel" | "email";

export type PersonBindOpenData = PersonBindType;

export type KycDialogOpenData = Record<string, never>;

export type { KycPageDto, ProfileDto };
