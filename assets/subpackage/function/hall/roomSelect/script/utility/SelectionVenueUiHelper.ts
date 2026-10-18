import { Node, sys } from "cc";
import { CatalogStorageKey } from "../config/SelectionVenueConfig";
import type { RoomCatalogDto } from "../config/SelectionVenueProtocol";

export function findDeep(root: Node | null, name: string): Node | null {
    if (!root) {
        return null;
    }
    const stack: Node[] = [root];
    while (stack.length) {
        const n = stack.pop()!;
        if (n.name === name) {
            return n;
        }
        for (const c of n.children) {
            stack.push(c);
        }
    }
    return null;
}

export function loadCatalogFromStorage(): RoomCatalogDto | null {
    try {
        const raw = sys.localStorage.getItem(CatalogStorageKey);
        if (!raw) {
            return null;
        }
        return JSON.parse(raw) as RoomCatalogDto;
    } catch {
        return null;
    }
}

export function saveCatalogToStorage(catalog: RoomCatalogDto): void {
    try {
        sys.localStorage.setItem(CatalogStorageKey, JSON.stringify(catalog));
    } catch {
        /* ignore quota */
    }
}
