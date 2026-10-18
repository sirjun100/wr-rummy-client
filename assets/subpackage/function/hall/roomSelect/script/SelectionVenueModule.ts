import { Node } from "cc";
import { GameApp } from "../../../../script/game/GameApp";
import { BundleSystem } from "../../../../script/game/system/BundleSystem";
import { FetchHallRoomCatalogCommand } from "./command/FetchHallRoomCatalogCommand";
import { OpenRummySelectionCommand } from "./command/OpenRummySelectionCommand";
import type { SelectionVenueOpenData } from "./config/SelectionVenueProtocol";
import { SelectionVenueModel } from "./model/SelectionVenueModel";

let registered = false;

export function ensureSelectionVenueRegistered(): void {
    if (registered) {
        return;
    }
    registered = true;
    GameApp.Interface.RegisterModel(new SelectionVenueModel());
}

export function openRummySelection(data?: SelectionVenueOpenData): void {
    ensureSelectionVenueRegistered();
    GameApp.Interface.SendCommand(new OpenRummySelectionCommand(data ?? {}));
}

export function prefetchRoomCatalog(): void {
    ensureSelectionVenueRegistered();
    GameApp.Interface.SendCommand(new FetchHallRoomCatalogCommand());
}

export async function preloadSelectionVenueBundle(): Promise<void> {
    await GameApp.Interface.GetSystem(BundleSystem).loadBundle("selectionVenue");
}

/** @deprecated Use wrSelectionVenue.open */
export async function openRummySelectionDialog(): Promise<void> {
    openRummySelection();
}

/** @deprecated */
export async function attachSelectionVenue(_parent: Node): Promise<Node | null> {
    openRummySelection();
    return null;
}

if (typeof globalThis !== "undefined") {
    (globalThis as {
        wrSelectionVenue?: {
            open: typeof openRummySelection;
            prefetchCatalog: typeof prefetchRoomCatalog;
            preload: typeof preloadSelectionVenueBundle;
            ensureRegistered: typeof ensureSelectionVenueRegistered;
        };
    }).wrSelectionVenue = {
        open: openRummySelection,
        prefetchCatalog: prefetchRoomCatalog,
        preload: preloadSelectionVenueBundle,
        ensureRegistered: ensureSelectionVenueRegistered,
    };

    (globalThis as Record<string, unknown>).wrRoomSelect = (globalThis as Record<string, unknown>).wrSelectionVenue;
}
