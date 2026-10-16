/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * LocaleText — one Component per file (Cocos 2.x restriction)
 ****************************************************************************/


import * as cc from 'cc';
import { Language, LanguageText, LocaleKit } from "./LocaleKit";

const { ccclass, property } = cc._decorator;

@ccclass
export class LocaleText extends cc.Component {

    @property
    public SetTextOnInit: boolean = true;

    public LanguageTexts: LanguageText[] = [];

    private mLabel: cc.Label = null;
    private mRichText: cc.RichText = null;

    protected start(): void {
        this.mLabel = this.getComponent(cc.Label);
        this.mRichText = this.getComponent(cc.RichText);

        LocaleKit.EnsureInit();
        LocaleKit.OnLanguageChanged.Register(() => {
            this.UpdateText(LocaleKit.CurrentLanguage);
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);

        if (this.SetTextOnInit) {
            this.UpdateText(LocaleKit.CurrentLanguage);
        }
    }

    public UpdateText(language: Language): void {
        const text = this.FindText(language);
        if (text == null) {
            return;
        }
        if (this.mLabel) {
            this.mLabel.string = text;
        }
        if (this.mRichText) {
            this.mRichText.string = text;
        }
        if (!this.mLabel && !this.mRichText) {
            const label = this.getComponent(cc.Label);
            if (label) {
                label.string = text;
            }
        }
    }

    private FindText(language: Language): string {
        if (!this.LanguageTexts) {
            return null;
        }
        for (let i = 0; i < this.LanguageTexts.length; i++) {
            if (this.LanguageTexts[i].Language === language) {
                return this.LanguageTexts[i].Text;
            }
        }
        return null;
    }
}
