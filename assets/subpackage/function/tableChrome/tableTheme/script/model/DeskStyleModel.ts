import { SpriteFrame, sys } from "cc";
import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import {
    DefaultDisplayStyles,
    DeskStorageKey,
    type DisplayStylesTuple,
} from "../config/DeskConfig";

export class DeskStyleModel extends AbstractModel {
    public readonly styles = new BindableProperty<DisplayStylesTuple>([...DefaultDisplayStyles]);

    /** Base CDN URL without web/native/desk suffix (from HTTP bootstrap). */
    public remoteDeskBaseUrl = "";

    private readonly remoteSpriteCache = new Map<string, SpriteFrame>();

    protected OnInit(): void {}

    public loadLocal(): void {
        const raw = sys.localStorage.getItem(DeskStorageKey.DisplayStyles);
        if (!raw) {
            this.styles.value = [...DefaultDisplayStyles];
            return;
        }
        try {
            const parsed = JSON.parse(raw) as number[];
            if (Array.isArray(parsed) && parsed.length >= 3) {
                this.styles.value = [
                    this.clampTable(parsed[0]),
                    this.clampFace(parsed[1]),
                    this.clampBack(parsed[2]),
                ];
                return;
            }
        } catch {
            /* use default */
        }
        this.styles.value = [...DefaultDisplayStyles];
    }

    public persistLocal(): void {
        sys.localStorage.setItem(DeskStorageKey.DisplayStyles, JSON.stringify(this.styles.value));
    }

    public applyServer(tableId?: number, faceId?: number, backId?: number): boolean {
        const cur = this.styles.value;
        let changed = false;
        const next: DisplayStylesTuple = [...cur];
        if (tableId !== undefined && tableId >= 1) {
            const t = this.clampTable(tableId);
            if (cur[0] !== t) {
                next[0] = t;
                changed = true;
            }
        }
        if (faceId !== undefined && faceId >= 1) {
            const f = this.clampFace(faceId);
            if (cur[1] !== f) {
                next[1] = f;
                changed = true;
            }
        }
        if (backId !== undefined && backId >= 1) {
            const b = this.clampBack(backId);
            if (cur[2] !== b) {
                next[2] = b;
                changed = true;
            }
        }
        if (changed) {
            this.styles.value = next;
        }
        return changed;
    }

    public getCachedSprite(assetName: string): SpriteFrame | null {
        const frame = this.remoteSpriteCache.get(assetName);
        return frame?.isValid ? frame : null;
    }

    public setCachedSprite(assetName: string, frame: SpriteFrame): void {
        if (frame?.isValid) {
            this.remoteSpriteCache.set(assetName, frame);
        }
    }

    private clampTable(n: number): number {
        return Math.min(7, Math.max(1, Math.floor(n)));
    }

    private clampFace(n: number): number {
        return Math.min(3, Math.max(1, Math.floor(n)));
    }

    private clampBack(n: number): number {
        return Math.min(5, Math.max(1, Math.floor(n)));
    }
}
