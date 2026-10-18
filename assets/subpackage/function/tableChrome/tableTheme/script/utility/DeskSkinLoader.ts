import { assetManager, ImageAsset, Sprite, SpriteFrame, sys, Texture2D } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { AppBootstrapModel } from "../../../../../script/game/model/AppBootstrapModel";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { DeskAssetPath, DeskBundleName } from "../config/DeskConfig";
import { DeskStyleModel } from "../model/DeskStyleModel";

function deskBundleBaseUrl(model: DeskStyleModel): string {
    const base = model.remoteDeskBaseUrl || GameApp.Interface.GetModel(AppBootstrapModel).remoteDeskUrl;
    if (!base || (!base.startsWith("http://") && !base.startsWith("https://"))) {
        return "";
    }
    const slash = base.endsWith("/") ? "" : "/";
    const platform =
        sys.platform === sys.Platform.MOBILE_BROWSER || sys.platform === sys.Platform.DESKTOP_BROWSER
            ? "web"
            : "native";
    return `${base}${slash}${platform}/${DeskBundleName}/`;
}

export async function loadDeskSpriteFrame(assetName: string): Promise<SpriteFrame | null> {
    const model = GameApp.Interface.GetModel(DeskStyleModel);
    const cached = model.getCachedSprite(assetName);
    if (cached) {
        return cached;
    }

    const fromBundle = await loadFromDeskBundle(assetName);
    if (fromBundle) {
        model.setCachedSprite(assetName, fromBundle);
        return fromBundle;
    }

    const remote = await loadFromRemoteCdn(assetName, model);
    if (remote) {
        model.setCachedSprite(assetName, remote);
        return remote;
    }

    return null;
}

async function loadFromDeskBundle(assetName: string): Promise<SpriteFrame | null> {
    try {
        const bundles = GameApp.Interface.GetSystem(BundleSystem);
        const bundle = await bundles.loadBundle(DeskBundleName);
        const path = `${DeskAssetPath.BigPicPrefix}${assetName}`;
        return await new Promise((resolve) => {
            bundle.load(path, ImageAsset, (err, image) => {
                if (err || !image) {
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
        LogKit.W("[DeskSkinLoader] bundle load failed {0}", err instanceof Error ? err.message : String(err));
        return null;
    }
}

async function loadFromRemoteCdn(assetName: string, model: DeskStyleModel): Promise<SpriteFrame | null> {
    const root = deskBundleBaseUrl(model);
    if (!root) {
        return null;
    }
    const url = `${root}${DeskAssetPath.BigPicPrefix}${assetName}`;
    return await new Promise((resolve) => {
        assetManager.loadRemote<ImageAsset>(url, (err, image) => {
            if (err || !image) {
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

export async function applySpriteToNode(
    node: import("cc").Node | null,
    frame: SpriteFrame | null | undefined,
): Promise<void> {
    if (!node?.isValid || !frame?.isValid) {
        return;
    }
    const sprite = node.getComponent(Sprite);
    if (sprite) {
        sprite.spriteFrame = frame;
    }
}

export async function preloadDeskAssetNames(names: string[]): Promise<void> {
    for (const name of names) {
        await loadDeskSpriteFrame(name);
    }
}

export function pickEmbeddedFrame(
    frames: SpriteFrame[],
    index: number | undefined,
): SpriteFrame | null {
    if (index === undefined || !frames?.length) {
        return null;
    }
    const i = Math.min(Math.max(0, index), frames.length - 1);
    const frame = frames[i];
    return frame?.isValid ? frame : null;
}
