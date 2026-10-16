// @ts-nocheck
import { _decorator, Component, assetManager, ImageAsset, SpriteFrame, sys } from "cc";
import { GameApp } from "../../../GameApp";
import { I18NSystem } from "../../../system/I18NSystem";
const { ccclass, property, executeInEditMode } = _decorator;

function i18n(): I18NSystem {
    return GameApp.Interface.GetSystem(I18NSystem);
}
@ccclass("LocalizedSpriteItem")
class LocalizedSpriteItem {
    @property
    public language: string = "en";
    @property({ type: SpriteFrame })
    public spriteFrame: SpriteFrame = null;
}
@ccclass("LocalizedSprite")
@executeInEditMode
export class LocalizedSprite extends Component {
    public sprite: any = null;
    @property({ visible: true })
    public key: string = "";
    @property({ type: SpriteFrame })
    public spriteFrame: SpriteFrame = null;
    public _spriteFrame: Map = new Map;
    public _tamilSpFrame: Map = new Map;
    public _urduSpFrame: Map = new Map;
    public _remoteImgUrl: string = "";
    public _remoteTamilUrl: string = "";
    public _remoteUrduUrl: string = "";
    onLoad() {
        const run = () => {
            this.fetchRender();
            this._spriteFrame = new Map;
            this._tamilSpFrame = new Map;
            this._urduSpFrame = new Map;
            this._remoteImgUrl = sys.localStorage.getItem("remoteImgUrl");
            this._remoteTamilUrl = sys.localStorage.getItem("remoteTamilUrl");
            this._remoteUrduUrl = sys.localStorage.getItem("remoteUrduUrl");
        };
        const system = GameApp.Interface?.GetSystem?.(I18NSystem);
        if (system?.ready) {
            run();
        } else if (system) {
            system.ensureReady().then(run);
        } else {
            run();
        }
    }
    onDestroy() {
        if (this._spriteFrame && this._spriteFrame.has(this.key)) {
            let e = this._spriteFrame.get(this.key);
            sys.isObjectValid(e) && e.isValid && e.decRef();
            this._spriteFrame.delete(this.key);
        }
        if (this._tamilSpFrame && this._tamilSpFrame.has(this.key)) {
            let e = this._tamilSpFrame.get(this.key);
            sys.isObjectValid(e) && e.isValid && e.decRef();
            this._tamilSpFrame.delete(this.key);
        }
        if (this._urduSpFrame && this._urduSpFrame.has(this.key)) {
            let e = this._urduSpFrame.get(this.key);
            sys.isObjectValid(e) && e.isValid && e.decRef();
            this._urduSpFrame.delete(this.key);
        }
    }
    fetchRender() {
        let e = this.getComponent("cc.Sprite");
        if (e) {
            return this.sprite = e, void this.updateSprite();
        }
    }
    updateSprite() {
        sys.isObjectValid(this.sprite) && this.sprite.isValid && ("en" == i18n().languageCode ? this.spriteFrame && (this.sprite.spriteFrame = this.spriteFrame) : this.setSpriteFrame());
    }
    setSpriteFrame() {
        let e, t = null, i = "";
        const lang = i18n().languageCode;
        if ("hi" == lang ? (t = "translateHindi", i = this._remoteImgUrl, e = this._spriteFrame) : "ta" == lang ? (t = "translateTamil", i = this._remoteTamilUrl, e = this._tamilSpFrame) : "ur" == lang && (t = "translateUrdu", i = this._remoteUrduUrl, e = this._urduSpFrame), t) {
            if (e && e.has(this.key)) {
                let t = e.get(this.key);
                this.sprite.spriteFrame = t;
            }
            else {
                let r = i18n().t(this.key), a = sys.isObjectValid(i) && i.length > 0 ? i : "";
                this.loadBundle(t, a, ((t, i) => {
                    t.load(r, ImageAsset, ((t, l) => {
                        if (sys.isObjectValid(this.sprite) && this.sprite.isValid) {
                            if (null != t) {
                                return console.log("----------- load sprite err:", t), sys.isObjectValid(this.spriteFrame) && this.spriteFrame.isValid && (this.sprite.spriteFrame = this.spriteFrame), void (0 == i && this.loadRemoteBundle(a, ((t, i) => {
                                    t.load(r, ImageAsset, ((t, i) => {
                                        if (sys.isObjectValid(this.sprite) && this.sprite.isValid) {
                                            if (null != t) {
                                                return void console.log("----------- loadRemoteBundle bundle err1:", t);
                                            }
                                            if (r == i18n().t(this.key)) {
                                                let sf = SpriteFrame.createWithImage(i);
                                                sys.isObjectValid(sf) && sf.isValid && (this.sprite.spriteFrame = sf, sys.isObjectValid(e) && (sf.addRef(), e.set(this.key, sf)));
                                            }
                                        }
                                    }));
                                })));
                            }
                            if (r == i18n().t(this.key)) {
                                let sf = SpriteFrame.createWithImage(l);
                                sys.isObjectValid(sf) && sf.isValid && (this.sprite.spriteFrame = sf, sys.isObjectValid(e) && (sf.addRef(), e.set(this.key, sf)));
                            }
                        }
                    }));
                }));
            }
        }
    }
    loadBundle(e, t, i) {
        try {
            let r = assetManager.getBundle(e);
            r ? i && i(r, 0) : assetManager.loadBundle(e, null, ((e, r) => {
                if (null != e) {
                    return console.log("----------- loadBundle  err1:", e), void this.loadRemoteBundle(t, i);
                }
                i && i(r, 0);
            }));
        }
        catch (e) {
            console.error("----------- loadBundle  err3:", e);
        }
    }
    loadRemoteBundle(e, t) {
        try {
            if (e.startsWith("http://") || e.startsWith("https://")) {
                let i = assetManager.getBundle(e);
                i ? t && t(i) : assetManager.loadBundle(e, null, ((e, i) => {
                    null == e ? t && t(i, 1) : console.error("----------- loadRemoteBundle bundle err2:", e);
                }));
            }
        }
        catch (e) {
            console.error("----------- loadRemoteBundle bundle err3:", e);
        }
    }
}
