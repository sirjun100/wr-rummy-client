// @ts-nocheck
import { _decorator, Component, Font, resources, sys } from "cc";
import { GameApp } from "../../../GameApp";
import { I18NSystem } from "../../../system/I18NSystem";
const { ccclass, property, executeInEditMode } = _decorator;

function i18n(): I18NSystem {
    return GameApp.Interface.GetSystem(I18NSystem);
}

@ccclass("LocalizedLabel")
@executeInEditMode
export class LocalizedLabel extends Component {
    public label: any = null;
    @property({ visible: false })
    public key: string = "";
    @property({ visible: true })
    public bIsBold: boolean = false;
    public _font: Map = new Map;
    @property({ displayName: "Key", visible: true })
    get _key() {
        return this.key;
    }
    set _key(t) {
        this.updateLabel();
        this.key = t;
    }
    onLoad() {
        const run = () => this.fetchRender();
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
        if (this._font && this._font.has(this.key)) {
            let t = this._font.get(this.key);
            sys.isObjectValid(t) && t.isValid && t.decRef();
            this._font.delete(this.key);
        }
    }
    fetchRender() {
        let t = this.getComponent("cc.Label");
        if (t) {
            return this.label = t, void this.updateLabel();
        }
        let e = this.getComponent("cc.RichText");
        return e ? (this.label = e, void this.updateLabel()) : undefined;
    }
    updateLabel() {
        sys.isObjectValid(this.label) && (this.label.string = i18n().t(this.key), this.setLabelFont(this.label));
    }
    setLabelFont(t) {
        let e = null;
        const lang = i18n().languageCode;
        if (this.bIsBold ? "en" == lang ? e = "config/cuti" : "hi" == lang ? e = "config/mangal" : "ta" == lang ? e = "config/NotoSansTamil_VariableFont_wdth_wght" : "ur" == lang && (e = "config/AdobeArabic-Bold") : "en" == lang ? e = "config/xiti" : "hi" == lang ? e = "config/mangal" : "ta" == lang ? e = "config/NotoSansTamil_VariableFont_wdth_wght" : "ur" == lang && (e = "config/AdobeArabic-Regular"), null != e) {
            if (this._font && this._font.has(e)) {
                let i = this._font.get(e);
                t.font = i;
            }
            else {
                resources.load(e, Font, ((i, o) => {
                    null == i && sys.isObjectValid(o) && (sys.isObjectValid(this._font) || (this._font = new Map), o.addRef(), this._font.set(e, o), sys.isObjectValid(t) && t.isValid && (t.font = o));
                }));
            }
        }
    }
}
