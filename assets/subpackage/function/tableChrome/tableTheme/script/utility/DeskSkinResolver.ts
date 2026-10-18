import { SubGameId } from "../../../../../script/game/config/BundleManifest";
import { DeskAssetPath, type DeskRoomContext } from "../config/DeskConfig";

export type DeskSkinPlan = {
    roomEmbeddedIndex?: number;
    deskEmbeddedIndex?: number;
    deskEmbeddedFallbackIndex?: number;
    roomRemoteName?: string;
    deskRemoteName?: string;
    hideDesk?: boolean;
    useFourDeskEmbedded?: boolean;
    otherGameIndex?: number;
    deskPositionY?: number;
};

export function mapTableStyleToRoomBgIndex(tableStyle: number): number {
    if (tableStyle === 4) {
        return 1;
    }
    if (tableStyle === 5) {
        return 2;
    }
    if (tableStyle === 6) {
        return 3;
    }
    if (tableStyle === 7) {
        return 4;
    }
    return 0;
}

export function resolveDeskSkinPlan(tableStyle: number, context: DeskRoomContext): DeskSkinPlan {
    const other = resolveOtherGamePlan(context.gameType);
    if (other) {
        return other;
    }

    if (context.scene === "hall") {
        return resolveHallSimple(tableStyle);
    }

    return resolveRummyRoom(tableStyle, context);
}

function resolveOtherGamePlan(gameType?: number): DeskSkinPlan | null {
    if (gameType === undefined || gameType === SubGameId.None || gameType === SubGameId.Rummy) {
        return null;
    }
    if (gameType === SubGameId.Sixpoint) {
        return { otherGameIndex: 0, deskPositionY: -11.418 };
    }
    if (gameType === SubGameId.Fruit) {
        return { otherGameIndex: 1 };
    }
    if (gameType === SubGameId.Rocket) {
        return { otherGameIndex: 2, hideDesk: true };
    }
    if (gameType === SubGameId.Cricket) {
        return { otherGameIndex: 3 };
    }
    return null;
}

function resolveHallSimple(tableStyle: number): DeskSkinPlan {
    return {
        roomEmbeddedIndex: mapTableStyleToRoomBgIndex(tableStyle),
        deskEmbeddedIndex: Math.max(0, tableStyle - 1),
    };
}

function resolveRummyRoom(tableStyle: number, context: DeskRoomContext): DeskSkinPlan {
    const roomIdx = mapTableStyleToRoomBgIndex(tableStyle);
    const deskIdx = Math.max(0, tableStyle - 1);

    if (context.isMatchRoom) {
        return {
            roomRemoteName: DeskAssetPath.MatchRoom,
            deskRemoteName: DeskAssetPath.MatchDesk,
        };
    }

    if (context.specialMode) {
        if (deskIdx === 0) {
            return {
                roomEmbeddedIndex: roomIdx,
                useFourDeskEmbedded: true,
                deskEmbeddedIndex: 0,
            };
        }
        return {
            roomEmbeddedIndex: roomIdx,
            deskRemoteName: `rummy_big_four_table_${deskIdx + 1}`,
            deskEmbeddedFallbackIndex: 0,
        };
    }

    const plan: DeskSkinPlan = {
        deskEmbeddedIndex: deskIdx === 0 ? 0 : undefined,
        deskRemoteName: deskIdx === 0 ? undefined : `rummy_card_table_bg_0${deskIdx}`,
        deskEmbeddedFallbackIndex: deskIdx === 0 ? undefined : 0,
    };

    if (roomIdx === 0) {
        plan.roomEmbeddedIndex = 0;
    } else {
        plan.roomRemoteName = `rummy_game_bg_${roomIdx + 1}`;
    }

    return plan;
}

export function resolveMatchPreviewPlan(): DeskSkinPlan {
    return {
        deskRemoteName: DeskAssetPath.MatchDesk,
        roomRemoteName: DeskAssetPath.MatchRoom,
    };
}
