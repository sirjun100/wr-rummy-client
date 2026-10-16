// @ts-nocheck
/** PlatformSystem 迁移期静态状态，替代旧 ToolUtils 在平台层的用法。 */
import { director, Node, sys } from "cc";
import { JsonUtil } from "./JsonUtil";
import { PlatformUtil } from "./PlatformUtil";

let persistGlobalNode: Node | null = null;

export class ToolUtils {
    static _orientation_landscape = false;
    static switchSceneTye = -1;
    static bSwitchToGame = false;
    static permission_forbid = false;
    static _fireBaseToken = "";
    static _bNeedReportToken = false;
    static location_forbid = false;
    static hasGetLocation = false;
    static latitude = "";
    static longitude = "";
    static ad_bg_enable = true;
    static report_link_id = 0;
    static ad_complete = 0;
    static report_scene = "";

    static isSafeString(v: unknown): string {
        if (v == null || v === undefined) {
            return "";
        }
        return String(v);
    }

    static isSafeNumber(v: unknown): number {
        const n = Number(v);
        return isNaN(n) ? 0 : n;
    }

    static saveData(key: string, value: string): void {
        try {
            sys.localStorage.setItem(key, value);
        } catch {
            /* ignore */
        }
    }

    static getPrintJsonStr(obj: unknown): string {
        return JsonUtil.ToJsonString(obj);
    }

    static toJsonString(data: unknown): string {
        return JsonUtil.ToJsonString(data);
    }

    static parseJson<T = Record<string, unknown>>(text: string): T {
        return JsonUtil.ParseJson<T>(text);
    }

    static isJsonString(text: string): boolean {
        return JsonUtil.IsJsonString(text);
    }

    static isPadPlatform(): boolean {
        return PlatformUtil.IsPadPlatform();
    }

    static getIsNormalDirection(): boolean {
        return !ToolUtils._orientation_landscape;
    }

    static getPersistGlobalNode(): Node {
        if (persistGlobalNode && persistGlobalNode.isValid) {
            return persistGlobalNode;
        }
        persistGlobalNode = new Node("LegacyPersistGlobal");
        director.addPersistRootNode(persistGlobalNode);
        return persistGlobalNode;
    }

    static gm_xorfunc(data: string, _key: number): string {
        return data;
    }
}
