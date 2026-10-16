// @ts-nocheck
/** 音效占位，待 AudioKit / SoundManager 迁入。 */
export default class SoundManager {
    private static _inst: SoundManager;
    bg_enabled = true;

    static shared(): SoundManager {
        if (!SoundManager._inst) {
            SoundManager._inst = new SoundManager();
        }
        return SoundManager._inst;
    }

    setEnabled(_enabled: boolean): void {}
}
