// @ts-nocheck
import { director, Font, isValid, JsonAsset, resources, Sprite, sys } from "cc";
import { AbstractSystem } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";

// --- LanguageConfig ---
export const LanguageConfig = {
    Game_no_open: "utlis.text50",
    Input_name: "utlis.text51",
    Input_phone: "utlis.text52",
    Input_email: "utlis.text53",
    Input_UTR: "utlis.text54",
    Upload_Screenshot: "utlis.text55",
    Withdraw_min_tip: "utlis.text56",
    Withdraw_max_tip: "utlis.text57",
    Withdraw_succeed: "utlis.text58",
    Verification_send: "utlis.text59",
    Email_binding: "utlis.text60",
    Phone_binding: "utlis.text61",
    Enter_correct_phone: "utlis.text62",
    Enter_verify_code: "utlis.text63",
    Enter_correct_email: "utlis.text64",
    Enter_correct_code: "utlis.text65",
};
export default LanguageConfig;

export type LocaleCode = "en" | "hi" | "ta" | "ur";

export class I18NSystem extends AbstractSystem {
    readonly allLanguages: LocaleCode[] = ["en", "hi", "ta", "ur"];
    language: number = 0;
    currentLocale: LocaleCode = "en";
    ready = false;

    private _loaded: Map<LocaleCode, any> = new Map();
    private _font: Map<string, Font> = new Map();
    private _readyPromise: Promise<void> | null = null;

    protected OnInit(): void {
        const stored = sys.localStorage.getItem("language");
        if (stored != null && stored !== "") {
            this.language = Number(stored);
        }
        if (!this.allLanguages[this.language]) {
            this.language = 0;
        }
        this.currentLocale = this.allLanguages[this.language];
        this._readyPromise = this.bootstrapLocales();
    }

    private async bootstrapLocales(): Promise<void> {
        try {
            await this.loadLocale("en");
            if (this.currentLocale !== "en") {
                await this.loadLocale(this.currentLocale);
            }
            this.ready = true;
            this.syncWindowLanguages();
        } catch (err) {
            LogKit.E("I18NSystem bootstrap failed", err);
            this.ready = true;
        }
    }

    ensureReady(): Promise<void> {
        return this._readyPromise || Promise.resolve();
    }

    private syncWindowLanguages(): void {
        const w = window as any;
        w.languages = w.languages || {};
        for (const [code, data] of this._loaded.entries()) {
            w.languages[code] = data;
        }
    }

    loadLocale(code: LocaleCode): Promise<void> {
        if (this._loaded.has(code)) {
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            resources.load(`config/i18n/${code}`, JsonAsset, (err, asset) => {
                if (err || !asset?.json) {
                    LogKit.E(`I18NSystem loadLocale ${code} failed`, err);
                    if (code !== "en") {
                        this.loadLocale("en").then(resolve);
                        return;
                    }
                    this._loaded.set(code, {});
                    resolve();
                    return;
                }
                this._loaded.set(code, asset.json);
                this.syncWindowLanguages();
                resolve();
            });
        });
    }

    async setActiveLocale(code: LocaleCode): Promise<void> {
        await this.loadLocale(code);
        this.currentLocale = code;
        this.syncWindowLanguages();
    }

    t(key: string): string {
        const parts = key.split(".");
        let node = this._loaded.get(this.currentLocale);
        for (let i = 0; i < parts.length; i++) {
            node = node?.[parts[i]];
            if (node === undefined || node === null) {
                node = "";
                break;
            }
        }
        if (node === "") {
            LogKit.I("no i18 key:", key);
            let fallback = this._loaded.get("en");
            for (let i = 0; i < parts.length; i++) {
                fallback = fallback?.[parts[i]];
                if (!fallback) {
                    return "";
                }
            }
            return fallback || "";
        }
        return typeof node === "string" ? node : "";
    }

    getValueByKey(key: string): string {
        return this.t(key);
    }

    async initLanguage(): Promise<void> {
        await this.ensureReady();
        const stored = sys.localStorage.getItem("language");
        if (stored != null && stored !== "") {
            this.language = Number(stored);
        }
        const code = this.allLanguages[this.language];
        if (code) {
            await this.setActiveLocale(code);
            this.updateSceneRenderers();
        }
    }

    async changeLanguage(index: number): Promise<void> {
        if (index === this.language || !this.allLanguages[index]) {
            return;
        }
        await this.setActiveLocale(this.allLanguages[index]);
        this.updateSceneRenderers();
        this.language = index;
        sys.localStorage.setItem("language", String(index));
    }

    changLanguage(index: number): void {
        void this.changeLanguage(index);
    }

    changeLabelLanguage(label, key, bold = false, ...args) {
        if (label && isValid(label, true)) {
            let text = this.getValueByKey(key);
            if (text && text !== "") {
                if (text.indexOf("${0}") === -1) {
                    if (this.language === 3) {
                        for (let i = 0; i < args.length; i++) {
                            text = text.replace("$", args[i]);
                        }
                    }
                } else {
                    for (let i = 0; i < args.length; i++) {
                        text = text.replace("${" + i + "}", args[i]);
                    }
                }
                label.string = text;
            }
            this.changeLabelFont(label, bold);
            if (sys.isObjectValid(label.node) && sys.isObjectValid(label.node.getComponent("LocalizedLabel"))) {
                this.changeLocalizedLabelKey(label.node, key);
            }
        }
    }

    changeLocalizedLabelKey(node, key) {
        if (sys.isObjectValid(node)) {
            const comp = node.getComponent("LocalizedLabel");
            if (sys.isObjectValid(comp) && comp.key !== key) {
                comp.key = key;
                comp.updateLabel();
            }
        }
    }

    changeLabelFontSize(label, size) {
        label && isValid(label, true) && (label.fontSize = size);
    }

    changeLabelFontBold(label, bold = false) {
        if (sys.isObjectValid(label.node) && sys.isObjectValid(label.node.getComponent("LocalizedLabel"))) {
            const loc = label.node.getComponent("LocalizedLabel");
            loc.bIsBold = bold;
            loc.updateLabel();
        }
    }

    changeLabelFont(label, bold = false) {
        let path = bold ? "config/font_Bold" : "config/font_Regular";
        if (path == null) {
            return;
        }
        if (this._font && this._font.has(path)) {
            label.font = this._font.get(path);
            if (sys.isObjectValid(label.node) && sys.isObjectValid(label.node.getComponent("LocalizedLabel"))) {
                label.node.getComponent("LocalizedLabel").bIsBold = bold;
            }
        } else {
            resources.load(path, Font, (err, font) => {
                if (err == null && sys.isObjectValid(font)) {
                    if (!sys.isObjectValid(this._font)) {
                        this._font = new Map();
                    }
                    this._font.set(path, font);
                    if (sys.isObjectValid(label) && isValid(label, true)) {
                        label.font = font;
                        if (sys.isObjectValid(label.node) && sys.isObjectValid(label.node.getComponent("LocalizedLabel"))) {
                            label.node.getComponent("LocalizedLabel").bIsBold = bold;
                        }
                    }
                }
            });
        }
    }

    changeLabelFont2(label, bold = false, useBahnschrift = false) {
        let path = bold ? "config/font_Bold" : "config/font_Regular";
        if (useBahnschrift) {
            path = "config/Bahnschrift_cuti";
        }
        if (path == null) {
            return;
        }
        if (this._font && this._font.has(path)) {
            label.font = this._font.get(path);
            if (sys.isObjectValid(label.node) && sys.isObjectValid(label.node.getComponent("LocalizedLabel"))) {
                label.node.getComponent("LocalizedLabel").bIsBold = bold;
            }
        } else {
            resources.load(path, Font, (err, font) => {
                if (err == null && sys.isObjectValid(font)) {
                    if (!sys.isObjectValid(this._font)) {
                        this._font = new Map();
                    }
                    this._font.set(path, font);
                    if (sys.isObjectValid(label) && isValid(label, true)) {
                        label.font = font;
                        if (sys.isObjectValid(label.node) && sys.isObjectValid(label.node.getComponent("LocalizedLabel"))) {
                            label.node.getComponent("LocalizedLabel").bIsBold = bold;
                        }
                    }
                }
            });
        }
    }

    changeSpriteLanguage(spriteNode, key, frame) {
        const loc = spriteNode.getComponent("LocalizedSprite");
        if (sys.isObjectValid(loc) && (loc.key !== key || loc.spriteFrame !== frame)) {
            spriteNode.getComponent(Sprite).spriteFrame = frame;
            loc.key = key;
            loc.spriteFrame = frame;
            loc.updateSprite();
        }
    }

    updateSceneRenderers(): void {
        const scene = director.getScene();
        if (!scene) {
            return;
        }
        const roots = scene.children;
        const labels = [];
        for (let i = 0; i < roots.length; ++i) {
            Array.prototype.push.apply(labels, roots[i].getComponentsInChildren("LocalizedLabel"));
        }
        for (let i = 0; i < labels.length; ++i) {
            labels[i].updateLabel();
        }
        const sprites = [];
        for (let i = 0; i < roots.length; ++i) {
            Array.prototype.push.apply(sprites, roots[i].getComponentsInChildren("LocalizedSprite"));
        }
        for (let i = 0; i < sprites.length; ++i) {
            sprites[i].updateSprite();
        }
    }

    get languageCode(): LocaleCode {
        return this.currentLocale;
    }
}
