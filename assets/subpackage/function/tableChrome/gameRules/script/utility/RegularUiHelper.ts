import {
    assetManager,
    ImageAsset,
    Node,
    size,
    Sprite,
    SpriteFrame,
    Texture2D,
    UITransform,
    v3,
    Vec3,
    view,
    Widget,
} from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { RegularBundleName } from "../config/RegularConfig";
import { SubGameId } from "../../../../../script/game/config/BundleManifest";

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

export async function loadSpriteFromBundle(bundlePath: string): Promise<SpriteFrame | null> {
    try {
        const bundle = await GameApp.Interface.GetSystem(BundleSystem).loadBundle(RegularBundleName);
        return await new Promise((resolve) => {
            bundle.load(bundlePath, ImageAsset, (err, image) => {
                if (err || !image) {
                    LogKit.W("[RegularUiHelper] load {0} {1}", bundlePath, err?.message ?? "missing");
                    resolve(null);
                    return;
                }
                const texture = new Texture2D();
                texture.image = image;
                const frame = new SpriteFrame();
                frame.texture = texture;
                resolve(frame);
            });
        });
    } catch (err) {
        LogKit.W("[RegularUiHelper] bundle load {0}", err instanceof Error ? err.message : String(err));
        return null;
    }
}

export async function loadSpriteFromUrl(url: string): Promise<SpriteFrame | null> {
    if (!url) {
        return null;
    }
    return await new Promise((resolve) => {
        assetManager.loadRemote<ImageAsset>(url, (err, image) => {
            if (err || !image) {
                LogKit.W("[RegularUiHelper] remote {0}", err?.message ?? "missing");
                resolve(null);
                return;
            }
            const texture = new Texture2D();
            texture.image = image;
            const frame = new SpriteFrame();
            frame.texture = texture;
            resolve(frame);
        });
    });
}

export function applyHallLandscapeLayout(dialogRoot: Node, gameType?: SubGameId): void {
    const orientation = view.getVisibleSize().width > view.getVisibleSize().height;
    if (!orientation) {
        dialogRoot.setRotationFromEuler(v3(0, 0, -90));
    }
    const bgColor = findDeep(dialogRoot, "bg_color");
    if (bgColor) {
        const widget = bgColor.getComponent(Widget);
        widget?.updateAlignment();
        const ui = bgColor.getComponent(UITransform);
        if (ui) {
            const vs = view.getVisibleSize();
            ui.setContentSize(vs.width, vs.height);
        }
    }
    const bg = findDeep(dialogRoot, "bg");
    if (!bg) {
        return;
    }
    const innerBg = findDeep(bg, "bg");
    if (innerBg) {
        const t = innerBg.getComponent(UITransform);
        if (t) {
            t.setContentSize(size(t.contentSize.width, 609));
        }
        innerBg.setPosition(v3(0, 35));
    }
    const top = findDeep(bg, "top");
    if (top) {
        const p = new Vec3();
        top.getPosition(p);
        top.setPosition(v3(p.x, gameType === SubGameId.Rummy ? -148 : -187, p.z));
    }
    const scroll = findDeep(bg, "scrollview") ?? findDeep(bg, "pageView");
    if (scroll) {
        if (orientation) {
            scroll.setPosition(v3(0, gameType === SubGameId.Rummy ? 250.784 : 213.784));
            const st = scroll.getComponent(UITransform);
            if (st) {
                st.setContentSize(size(st.contentSize.width, 510));
            }
            findDeep(scroll, "view")?.getComponent(Widget)?.updateAlignment();
        } else {
            scroll.setPosition(v3(0, 403.393));
            const st = scroll.getComponent(UITransform);
            if (st) {
                st.setContentSize(size(st.contentSize.width, 890));
            }
            findDeep(scroll, "view")?.getComponent(Widget)?.updateAlignment();
        }
    }
}

export function setSpriteFrame(target: Node | null, frame: SpriteFrame | null): void {
    const sp = target?.getComponent(Sprite);
    if (sp && frame) {
        sp.spriteFrame = frame;
    }
}
