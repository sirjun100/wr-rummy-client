/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * LocaleKit for Cocos Creator (TypeScript)
 ****************************************************************************/


import * as cc from 'cc';
import { EasyEvent } from "../../../QFramework";

// #region Language

/** Values aligned with Unity SystemLanguage / QFramework.Language */
export enum Language {
    Afrikaans = 0,
    Arabic = 1,
    Basque = 2,
    Belarusian = 3,
    Bulgarian = 4,
    Catalan = 5,
    Chinese = 6,
    Czech = 7,
    Danish = 8,
    Dutch = 9,
    English = 10,
    Estonian = 11,
    Faroese = 12,
    Finnish = 13,
    French = 14,
    German = 15,
    Greek = 16,
    Hebrew = 17,
    Hungarian = 18,
    Icelandic = 19,
    Indonesian = 20,
    Italian = 21,
    Japanese = 22,
    Korean = 23,
    Latvian = 24,
    Lithuanian = 25,
    Norwegian = 26,
    Polish = 27,
    Portuguese = 28,
    Romanian = 29,
    Russian = 30,
    SerboCroatian = 31,
    Slovak = 32,
    Slovenian = 33,
    Spanish = 34,
    Swedish = 35,
    Thai = 36,
    Turkish = 37,
    Ukrainian = 38,
    Vietnamese = 39,
    ChineseSimplified = 40,
    ChineseTraditional = 41,
    Unknown = 42,
}

// #endregion

// #region Data

export class LanguageDefine {
    public Language: Language = Language.English;

    public constructor(language: Language = Language.English) {
        this.Language = language;
    }
}

export class LanguageDefineConfig {

    public LanguageDefines: LanguageDefine[] = [
        new LanguageDefine(Language.English),
        new LanguageDefine(Language.ChineseSimplified),
    ];

    public static FromJson(json: string | object): LanguageDefineConfig {
        const config = new LanguageDefineConfig();
        let data: any = json;
        if (typeof json === "string") {
            try {
                data = JSON.parse(json);
            } catch (e) {
                return config;
            }
        }
        if (data && data.LanguageDefines && data.LanguageDefines.length > 0) {
            config.LanguageDefines = [];
            for (let i = 0; i < data.LanguageDefines.length; i++) {
                const item = data.LanguageDefines[i];
                const lang = typeof item.Language === "number"
                    ? item.Language
                    : Language[item.Language as string];
                config.LanguageDefines.push(new LanguageDefine(
                    typeof lang === "number" ? lang : Language.English
                ));
            }
        }
        return config;
    }

    public ToJson(): string {
        return JSON.stringify({
            LanguageDefines: this.LanguageDefines.map((d) => ({ Language: d.Language })),
        });
    }
}

export class LanguageText {
    public LanguageIndex: number = 0;
    public Language: Language = Language.English;
    public Text: string = "";

    public constructor(language: Language = Language.English, text: string = "") {
        this.Language = language;
        this.Text = text;
        this.LanguageIndex = language as number;
    }
}

export class LanguageEvent {
    public LanguageIndex: number = 0;
    public Language: Language = Language.English;
    public OnLocale: () => void = null;

    public constructor(language: Language = Language.English, onLocale: () => void = null) {
        this.Language = language;
        this.OnLocale = onLocale;
        this.LanguageIndex = language as number;
    }
}

// #endregion

// #region LocaleKit

export class LocaleKit {

    private static mInited: boolean = false;
    private static mCurrentLanguage: Language = Language.English;
    private static mConfig: LanguageDefineConfig = null;

    public static readonly OnLanguageChanged: EasyEvent = new EasyEvent();

    public static SaveCommand: (key: string, languageIndex: number) => void =
        (key, languageIndex) => {
            cc.sys.localStorage.setItem(key, String(languageIndex));
        };

    public static LoadCommand: (key: string, defaultLanguageIndex: number) => number =
        (key, defaultLanguageIndex) => {
            const stored = cc.sys.localStorage.getItem(key);
            if (stored == null || stored === "") {
                return defaultLanguageIndex;
            }
            const n = Number(stored);
            return isNaN(n) ? defaultLanguageIndex : n;
        };

    public static get Config(): LanguageDefineConfig {
        if (!LocaleKit.mConfig) {
            LocaleKit.mConfig = new LanguageDefineConfig();
        }
        return LocaleKit.mConfig;
    }

    public static set Config(value: LanguageDefineConfig) {
        LocaleKit.mConfig = value;
        if (LocaleKit.mInited) {
            LocaleKit.ReloadFromStorage();
        }
    }

    public static get CurrentLanguage(): Language {
        LocaleKit.EnsureInit();
        return LocaleKit.mCurrentLanguage;
    }

    public static EnsureInit(): void {
        if (LocaleKit.mInited) {
            return;
        }
        LocaleKit.mInited = true;
        LocaleKit.ReloadFromStorage();
    }

    private static ReloadFromStorage(): void {
        let languageIndex = LocaleKit.LoadCommand("CURRENT_LANGUAGE_INDEX", 0);
        const defines = LocaleKit.Config.LanguageDefines;
        if (languageIndex >= defines.length) {
            languageIndex = 0;
        }
        LocaleKit.mCurrentLanguage = defines[languageIndex]
            ? defines[languageIndex].Language
            : Language.English;
    }

    /** Load config from JSON string or object (Cocos replaces ScriptableObject) */
    public static InitWithConfig(jsonOrConfig: string | object | LanguageDefineConfig): void {
        if (jsonOrConfig instanceof LanguageDefineConfig) {
            LocaleKit.mConfig = jsonOrConfig;
        } else {
            LocaleKit.mConfig = LanguageDefineConfig.FromJson(jsonOrConfig);
        }
        LocaleKit.mInited = false;
        LocaleKit.EnsureInit();
    }

    public static GetNextLanguage(): Language {
        LocaleKit.EnsureInit();
        const defines = LocaleKit.Config.LanguageDefines;
        let languageIndex = -1;
        for (let i = 0; i < defines.length; i++) {
            if (defines[i].Language === LocaleKit.mCurrentLanguage) {
                languageIndex = i;
                break;
            }
        }
        languageIndex++;
        if (languageIndex >= defines.length) {
            languageIndex = 0;
        }
        return defines[languageIndex].Language;
    }

    public static ChangeLanguage(language: Language): void {
        LocaleKit.EnsureInit();
        LocaleKit.mCurrentLanguage = language;
        LocaleKit.OnLanguageChanged.Trigger();
        let index = 0;
        const defines = LocaleKit.Config.LanguageDefines;
        for (let i = 0; i < defines.length; i++) {
            if (defines[i].Language === language) {
                index = i;
                break;
            }
        }
        LocaleKit.SaveCommand("CURRENT_LANGUAGE_INDEX", index);
    }
}

// #endregion

// Do not barrel-re-export LocaleText / LocaleUnityEvent / LocaleKitChangeLanguageAction here:
// those Components import Language from this file; re-exporting them creates a circular module
// that Creator warns about when evaluating @property defaults (Language.English).
