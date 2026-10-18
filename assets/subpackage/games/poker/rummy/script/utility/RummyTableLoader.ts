import { find, instantiate, Node, Prefab } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BundleKey, getManifestEntry } from "../../../../../script/game/config/BundleManifest";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { bootstrapRummyScene, RummySceneRefs } from "./RummySceneBootstrap";

let mainInstance: Node | null = null;
let refs: RummySceneRefs | null = null;

export function getRummyTableRefs(): RummySceneRefs | null {
    return refs;
}

export async function loadRummyMainTable(sceneRoot?: Node): Promise<RummySceneRefs | null> {
    if (refs && mainInstance?.isValid) {
        return refs;
    }
    const entry = getManifestEntry(BundleKey.Rummy);
    const bundleSys = GameApp.Interface.GetSystem(BundleSystem);
    const bundle = await bundleSys.loadBundle(entry.bundleName);
    const prefab = await new Promise<Prefab | null>((resolve) => {
        bundle.load("prefab/RummyMain", Prefab, (err, asset) => {
            resolve(err ? null : asset);
        });
    });
    if (!prefab) {
        return null;
    }
    const root =
        sceneRoot ??
        find("Canvas/rootNode/content") ??
        find("Canvas/content") ??
        find("Canvas");
    if (!root) {
        return null;
    }
    if (mainInstance?.isValid) {
        mainInstance.destroy();
    }
    mainInstance = instantiate(prefab);
    mainInstance.name = "RummyMain";
    root.addChild(mainInstance);
    refs = bootstrapRummyScene(mainInstance);
    return refs;
}

export function unloadRummyMainTable(): void {
    if (mainInstance?.isValid) {
        mainInstance.destroy();
    }
    mainInstance = null;
    refs = null;
}
