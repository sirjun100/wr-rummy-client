import { assetManager, AudioClip, AudioSource } from "cc";
import { AbstractSystem } from "../../framework/QFramework";
import { AudioKit } from "../../framework/toolkits/audioKit/AudioKit";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { AUDIO_FX_ALIASES } from "../config/AudioFxId";
import { BundleKey, getManifestEntry, SubGameId } from "../config/BundleManifest";

export enum BgmContext {
    Hall = 0,
    Room = 1,
}

const SOUND_BUNDLE_KEY = BundleKey.Sound;

const SUB_GAME_AUDIO_DIRS: Partial<Record<SubGameId, string[]>> = {
    [SubGameId.Rummy]: ["audio/rummy/main_sound", "audio/rummy/chat_sound"],
    [SubGameId.Fruit]: ["audio"],
    [SubGameId.Rocket]: ["audio"],
    [SubGameId.Sixpoint]: ["audio"],
};

/**
 * 业务音频入口：封装 AudioKit + sound 子包预加载。
 * 可选挂载 hall/room/sfx AudioSource（见 AudioBootstrap）。
 */
export class AudioSystem extends AbstractSystem {
    private readonly clipCache = new Map<string, AudioClip>();
    private hallSource: AudioSource | null = null;
    private roomSource: AudioSource | null = null;
    private sfxSource: AudioSource | null = null;
    private activeBgm: BgmContext = BgmContext.Hall;
    private overlaySuspended = false;

    protected OnInit(): void {
        this.migrateLegacySwitchKeys();
    }

    protected OnDeinit(): void {
        this.clipCache.clear();
    }

    public attachSources(hall: AudioSource, room: AudioSource, sfx: AudioSource): void {
        this.hallSource = hall;
        this.roomSource = room;
        this.sfxSource = sfx;
        LogKit.I("[AudioSystem] attachSources ok");
    }

    public async preloadCommon(): Promise<void> {
        await this.preloadBundleDirs(["audio/select"]);
    }

    public async preloadForSubGame(subGameId: SubGameId): Promise<void> {
        const dirs = SUB_GAME_AUDIO_DIRS[subGameId];
        if (!dirs?.length) {
            return;
        }
        await this.preloadBundleDirs(dirs);
    }

    public playFx(logicalName: string, volumeScale = 1): void {
        if (!AudioKit.Settings.IsSoundOn.Value) {
            return;
        }
        const resolved = AUDIO_FX_ALIASES[logicalName] ?? logicalName;
        const clip = this.clipCache.get(resolved);
        if (!clip) {
            LogKit.W("[AudioSystem] playFx missing clip name={0} resolved={1}", logicalName, resolved);
            return;
        }
        if (this.sfxSource?.isValid) {
            this.sfxSource.playOneShot(clip, volumeScale * AudioKit.Settings.SoundVolume.Value);
            return;
        }
        AudioKit.PlaySoundWithClip(clip, false, null, -1);
    }

    public switchBgm(ctx: BgmContext): void {
        this.activeBgm = ctx;
        if (!AudioKit.Settings.IsMusicOn.Value || this.overlaySuspended) {
            return;
        }
        const source = ctx === BgmContext.Hall ? this.hallSource : this.roomSource;
        if (source?.isValid) {
            const other = ctx === BgmContext.Hall ? this.roomSource : this.hallSource;
            other?.stop();
            if (!source.playing) {
                source.loop = true;
                source.play();
            }
            return;
        }
        LogKit.I("[AudioSystem] switchBgm ctx={0} (no dedicated source)", ctx);
    }

    public playMusic(loop = true): void {
        if (this.overlaySuspended) {
            return;
        }
        this.switchBgm(this.activeBgm);
        const source = this.activeBgm === BgmContext.Hall ? this.hallSource : this.roomSource;
        if (source?.isValid) {
            source.loop = loop;
            if (!source.playing) {
                source.play();
            }
        }
    }

    public pauseBgm(): void {
        this.hallSource?.pause();
        this.roomSource?.pause();
        AudioKit.PauseMusic();
    }

    public suspendForOverlay(): void {
        this.overlaySuspended = true;
        this.pauseBgm();
    }

    public resumeFromOverlay(): void {
        this.overlaySuspended = false;
        this.playMusic(true);
    }

    public setMusicEnabled(on: boolean): void {
        AudioKit.Settings.IsMusicOn.Value = on;
    }

    public setFxEnabled(on: boolean): void {
        AudioKit.Settings.IsSoundOn.Value = on;
    }

    private async preloadBundleDirs(dirs: string[]): Promise<void> {
        const entry = getManifestEntry(SOUND_BUNDLE_KEY);
        if (!entry) {
            LogKit.E("[AudioSystem] sound bundle missing in manifest");
            return;
        }
        const bundle = await this.loadSoundBundle(entry.bundleName);
        for (const dir of dirs) {
            await this.loadDirIntoCache(bundle, dir);
        }
    }

    private loadSoundBundle(bundleName: string): Promise<import("cc").AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            const cached = assetManager.getBundle(bundleName);
            if (cached) {
                resolve(cached);
                return;
            }
            assetManager.loadBundle(bundleName, (err, bundle) => {
                if (err || !bundle) {
                    reject(err ?? new Error(`loadBundle failed: ${bundleName}`));
                    return;
                }
                resolve(bundle);
            });
        });
    }

    private loadDirIntoCache(
        bundle: import("cc").AssetManager.Bundle,
        dir: string,
    ): Promise<void> {
        return new Promise((resolve) => {
            bundle.loadDir(dir, AudioClip, (err, clips) => {
                if (err) {
                    LogKit.W("[AudioSystem] loadDir failed dir={0} err={1}", dir, err.message);
                    resolve();
                    return;
                }
                for (const clip of clips ?? []) {
                    if (clip?.name) {
                        this.clipCache.set(clip.name, clip);
                    }
                }
                LogKit.I("[AudioSystem] loadDir ok dir={0} count={1}", dir, clips?.length ?? 0);
                resolve();
            });
        });
    }

    /** 兼容旧 localStorage bg_enabled / fx_enabled */
    private migrateLegacySwitchKeys(): void {
        try {
            const bg = localStorage.getItem("bg_enabled");
            if (bg != null) {
                AudioKit.Settings.IsMusicOn.Value = bg === "true";
            }
            const fx = localStorage.getItem("fx_enabled");
            if (fx != null) {
                AudioKit.Settings.IsSoundOn.Value = fx === "true";
            }
        } catch {
            /* ignore */
        }
    }
}
