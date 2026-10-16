/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * AudioKit for Cocos Creator (TypeScript)
 * API aligned with Unity QFramework AudioKit
 ****************************************************************************/


import * as cc from 'cc';
import { PlayerPrefsBooleanProperty, PlayerPrefsFloatProperty } from "../coreKit/bindablePropertyKit/BindablePropertyKit";
import { BindableProperty } from "../../qframework/QFramework";
import { LogKit } from "../coreKit/logKit/LogKit";
import { IPoolable, IPoolType, SafeObjectPool } from "../coreKit/poolKit/PoolKit";
import { MonoSingleton } from "../coreKit/singletonKit/SingletonKit";
import { IResLoader, ResLoader, ResLoaderAdd2Load, ResLoaderLoadSync, ResSearchKeys } from "../resKit/ResKit";

// #region AudioKitSettings

export class AudioKitSettings {

    private static readonly KEY_SOUND_ON = "KEY_AUDIO_MANAGER_SOUND_ON";
    private static readonly KEY_MUSIC_ON = "KEY_AUDIO_MANAGER_MUSIC_ON";
    private static readonly KEY_VOICE_ON = "KEY_AUDIO_MANAGER_VOICE_ON";
    private static readonly KEY_VOICE_VOLUME = "KEY_AUDIO_MANAGER_VOICE_VOLUME";
    private static readonly KEY_SOUND_VOLUME = "KEY_AUDIO_MANAGER_SOUND_VOLUME";
    private static readonly KEY_MUSIC_VOLUME = "KEY_AUDIO_MANAGER_MUSIC_VOLUME";

    public readonly IsSoundOn: PlayerPrefsBooleanProperty;
    public readonly IsMusicOn: PlayerPrefsBooleanProperty;
    public readonly IsVoiceOn: PlayerPrefsBooleanProperty;
    public readonly SoundVolume: PlayerPrefsFloatProperty;
    public readonly MusicVolume: PlayerPrefsFloatProperty;
    public readonly VoiceVolume: PlayerPrefsFloatProperty;
    public readonly IsOn: BindableProperty<boolean>;

    public constructor() {
        this.IsSoundOn = new PlayerPrefsBooleanProperty(AudioKitSettings.KEY_SOUND_ON, true);
        this.IsMusicOn = new PlayerPrefsBooleanProperty(AudioKitSettings.KEY_MUSIC_ON, true);
        this.IsVoiceOn = new PlayerPrefsBooleanProperty(AudioKitSettings.KEY_VOICE_ON, true);
        this.SoundVolume = new PlayerPrefsFloatProperty(AudioKitSettings.KEY_SOUND_VOLUME, 1.0);
        this.MusicVolume = new PlayerPrefsFloatProperty(AudioKitSettings.KEY_MUSIC_VOLUME, 1.0);
        this.VoiceVolume = new PlayerPrefsFloatProperty(AudioKitSettings.KEY_VOICE_VOLUME, 1.0);
        this.IsOn = new BindableProperty<boolean>(
            this.IsSoundOn.Value && this.IsMusicOn.Value && this.IsVoiceOn.Value
        );
        this.IsOn.Register(() => {
            this.IsOn.Value = this.IsSoundOn.Value && this.IsMusicOn.Value && this.IsVoiceOn.Value;
        });
    }
}

// #endregion

// #region AudioSearchKeys & Loader

export class AudioSearchKeys implements IPoolType, IPoolable {

    public AssetBundleName: string = null;
    public AssetName: string = null;
    public IsRecycled: boolean = false;

    public static Allocate(): AudioSearchKeys {
        return SafeObjectPool.Instance(AudioSearchKeys).Allocate();
    }

    public Recycle2Cache(): void {
        SafeObjectPool.Instance(AudioSearchKeys).Recycle(this);
    }

    public OnRecycled(): void {
        this.AssetBundleName = null;
        this.AssetName = null;
    }
}

export interface IAudioLoader {
    Clip: cc.AudioClip;
    LoadClip(audioSearchKeys: AudioSearchKeys): cc.AudioClip;
    LoadClipAsync(audioSearchKeys: AudioSearchKeys, onLoad: (result: boolean, clip: cc.AudioClip) => void): void;
    Unload(): void;
}

export interface IAudioLoaderPool {
    AllocateLoader(): IAudioLoader;
    RecycleLoader(loader: IAudioLoader): void;
}

export abstract class AbstractAudioLoaderPool implements IAudioLoaderPool {

    private readonly mPool: IAudioLoader[] = [];

    public AllocateLoader(): IAudioLoader {
        return this.mPool.length > 0 ? this.mPool.pop() : this.CreateLoader();
    }

    protected abstract CreateLoader(): IAudioLoader;

    public RecycleLoader(loader: IAudioLoader): void {
        this.mPool.push(loader);
    }
}

export class DefaultAudioLoader implements IAudioLoader {

    private mClip: cc.AudioClip = null;

    public get Clip(): cc.AudioClip {
        return this.mClip;
    }

    private ResolvePath(assetName: string): string {
        if (assetName.indexOf("resources://") === 0) {
            return assetName.substring("resources://".length);
        }
        return assetName;
    }

    public LoadClip(audioSearchKeys: AudioSearchKeys): cc.AudioClip {
        const path = this.ResolvePath(audioSearchKeys.AssetName);
        const clip = cc.resources.get(path, cc.AudioClip);
        if (clip && !(clip instanceof cc.AudioClip)) {
            LogKit.E(`[Audio] resources.get not AudioClip: ${path} type=${(clip as any).constructor && (clip as any).constructor.name}`);
            this.mClip = null;
            return null;
        }
        this.mClip = clip;
        return this.mClip;
    }

    public LoadClipAsync(audioSearchKeys: AudioSearchKeys, onLoad: (result: boolean, clip: cc.AudioClip) => void): void {
        const path = this.ResolvePath(audioSearchKeys.AssetName);
        cc.resources.load(path, cc.AudioClip, (err, clip) => {
            if (err || !clip) {
                LogKit.E(`[Audio] load failed: ${path} err=${err}`);
                onLoad(false, null);
                return;
            }
            if (!(clip instanceof cc.AudioClip)) {
                LogKit.E(`[Audio] load result not AudioClip: ${path} type=${(clip as any).constructor && (clip as any).constructor.name}`);
                onLoad(false, null);
                return;
            }
            this.mClip = clip as cc.AudioClip;
            onLoad(true, this.mClip);
        });
    }

    public Unload(): void {
        if (this.mClip) {
            cc.assetManager.releaseAsset(this.mClip);
            this.mClip = null;
        }
    }
}

export class DefaultAudioLoaderPool extends AbstractAudioLoaderPool {

    protected CreateLoader(): IAudioLoader {
        return new DefaultAudioLoader();
    }
}

export class ResKitAudioLoader implements IAudioLoader {

    private mResLoader: ResLoader = null;
    private mClip: cc.AudioClip = null;

    public get Clip(): cc.AudioClip {
        return this.mClip;
    }

    public LoadClip(audioSearchKeys: AudioSearchKeys): cc.AudioClip {
        if (!this.mResLoader) {
            this.mResLoader = ResLoader.Allocate();
        }
        this.mClip = ResLoaderLoadSync<cc.AudioClip>(this.mResLoader, audioSearchKeys.AssetName, cc.AudioClip);
        return this.mClip;
    }

    public LoadClipAsync(audioSearchKeys: AudioSearchKeys, onLoad: (result: boolean, clip: cc.AudioClip) => void): void {
        if (!this.mResLoader) {
            this.mResLoader = ResLoader.Allocate();
        }
        ResLoaderAdd2Load(this.mResLoader, audioSearchKeys.AssetName, (ok, res) => {
            const clip = res ? (res.Asset as cc.AudioClip) : null;
            if (!ok || !clip || !(clip instanceof cc.AudioClip)) {
                LogKit.E(`[Audio] ResKit load not AudioClip: ${audioSearchKeys.AssetName}`);
                this.mClip = null;
                onLoad(false, null);
                return;
            }
            this.mClip = clip;
            onLoad(true, this.mClip);
        }, true, cc.AudioClip);
        this.mResLoader.LoadAsync();
    }

    public Unload(): void {
        this.mClip = null;
        if (this.mResLoader) {
            this.mResLoader.Recycle2Cache();
            this.mResLoader = null;
        }
    }
}

export class ResKitAudioLoaderPool extends AbstractAudioLoaderPool {

    protected CreateLoader(): IAudioLoader {
        return new ResKitAudioLoader();
    }
}

export class AudioKitConfig {
    public AudioLoaderPool: IAudioLoaderPool = new DefaultAudioLoaderPool();
}

// #endregion

// #region AudioPlayer

export class AudioPlayer implements IPoolable, IPoolType {

    private mLoader: IAudioLoader = null;
    private mAudioSource: cc.AudioSource = null;
    private mName: string = null;
    private mIsLoop: boolean = false;
    private mAudioClip: cc.AudioClip = null;
    private mUsedCache: boolean = true;
    private mIsCache: boolean = false;
    private mOnStartListener: (player: AudioPlayer) => void = null;
    private mOnFinishListener: (player: AudioPlayer) => void = null;
    private mIsPause: boolean = false;
    private mFinishScheduled: boolean = false;
    private mHostNode: cc.Node = null;

    public IsRecycled: boolean = false;

    public get Name(): string {
        return this.mName;
    }

    public get AudioSource(): cc.AudioSource {
        return this.mAudioSource;
    }

    public customEventID: number = -1;

    public get usedCache(): boolean {
        return this.mUsedCache;
    }

    public set usedCache(value: boolean) {
        this.mUsedCache = value;
    }

    public static Allocate(): AudioPlayer {
        return SafeObjectPool.Instance(AudioPlayer).Allocate();
    }

    public SetOnStartListener(listener: (player: AudioPlayer) => void): void {
        this.mOnStartListener = listener;
    }

    public SetOnFinishListener(listener: (player: AudioPlayer) => void): void {
        this.mOnFinishListener = listener;
    }

    public SetAudioExt(root: cc.Node, clip: cc.AudioClip, name: string, loop: boolean): void {
        if (!clip || !(clip instanceof cc.AudioClip) || this.mName === name) {
            if (clip && !(clip instanceof cc.AudioClip)) {
                LogKit.E(`[Audio] SetAudioExt rejected non-AudioClip: ${name}`);
            }
            return;
        }
        this.EnsureAudioSource(root);
        this.CleanResources();
        this.mIsLoop = loop;
        this.mName = name;
        this.mAudioClip = clip;
        this.PlayAudioClip();
    }

    public SetAudio(root: cc.Node, name: string, loop: boolean): void {
        if (!name || this.mName === name) {
            return;
        }
        this.EnsureAudioSource(root);
        const preLoader = this.mLoader;
        this.mLoader = null;
        this.CleanResources();
        this.mLoader = AudioKit.Config.AudioLoaderPool.AllocateLoader();
        this.mIsLoop = loop;
        this.mName = name;
        const keys = AudioSearchKeys.Allocate();
        keys.AssetName = name;
        this.mLoader.LoadClipAsync(keys, (result, clip) => this.OnResLoadFinish(result, clip));
        keys.Recycle2Cache();
        if (preLoader) {
            preLoader.Unload();
            AudioKit.Config.AudioLoaderPool.RecycleLoader(preLoader);
        }
    }

    public Stop(): void {
        this.Release();
    }

    public Pause(): void {
        if (this.mIsPause) {
            return;
        }
        this.mIsPause = true;
        if (this.mAudioSource) {
            this.mAudioSource.pause();
        }
        this.CancelFinishSchedule();
    }

    public Resume(): void {
        if (!this.mIsPause) {
            return;
        }
        this.mIsPause = false;
        if (this.mAudioSource) {
            // Creator 3.x: AudioSource.resume removed — play() continues from currentTime after pause.
            this.mAudioSource.play();
        }
        this.ScheduleFinishIfNeeded();
    }

    public SetVolume(volume: number): void {
        if (this.mAudioSource) {
            this.mAudioSource.volume = volume;
        }
    }

    private EnsureAudioSource(root: cc.Node): void {
        this.mHostNode = root;
        // Dedicated AudioSource per player. Sharing one via getComponent caused
        // CleanResources to clear another player's clip and triggered
        // "Wrong type of AudioClip" under concurrent SFX.
        if (!this.mAudioSource || !cc.isValid(this.mAudioSource)) {
            this.mAudioSource = root.addComponent(cc.AudioSource);
        }
    }

    private OnResLoadFinish(result: boolean, clip: cc.AudioClip): void {
        if (!result) {
            LogKit.E(`[Audio] load failed: ${this.mName}`);
            this.Release();
            return;
        }
        if (!clip || !(clip instanceof cc.AudioClip)) {
            LogKit.E(`[Audio] invalid AudioClip: ${this.mName}`);
            this.Release();
            return;
        }
        this.mAudioClip = clip;
        this.PlayAudioClip();
    }

    private PlayAudioClip(): void {
        if (!this.mAudioSource || !cc.isValid(this.mAudioSource) || !this.mAudioClip) {
            this.Release();
            return;
        }
        if (!(this.mAudioClip instanceof cc.AudioClip)) {
            LogKit.E(`[Audio] skip play, not AudioClip: ${this.mName}`);
            this.Release();
            return;
        }
        this.mAudioSource.clip = this.mAudioClip;
        this.mAudioSource.loop = this.mIsLoop;
        this.mAudioSource.volume = 1.0;
        if (this.mOnStartListener) {
            this.mOnStartListener(this);
        }
        this.mAudioSource.play();
        this.ScheduleFinishIfNeeded();
    }

    private ScheduleFinishIfNeeded(): void {
        if (this.mIsLoop || !this.mAudioClip || !this.mHostNode) {
            return;
        }
        this.CancelFinishSchedule();
        this.mFinishScheduled = true;
        const duration = this.mAudioClip.getDuration();
        cc.director.getScheduler().schedule(this.OnSoundPlayFinish, this.mHostNode, 0, 0, duration, false);
    }

    private readonly OnSoundPlayFinish = (): void => {
        this.mFinishScheduled = false;
        if (this.mOnFinishListener) {
            this.mOnFinishListener(this);
        }
        if (!this.mIsLoop) {
            this.Release();
        }
    };

    private CancelFinishSchedule(): void {
        if (this.mFinishScheduled && this.mHostNode && cc.isValid(this.mHostNode)) {
            cc.director.getScheduler().unschedule(this.OnSoundPlayFinish, this.mHostNode);
            this.mFinishScheduled = false;
        }
    }

    private Release(): void {
        this.CleanResources();
        if (this.mUsedCache) {
            this.Recycle2Cache();
        }
    }

    private CleanResources(): void {
        this.mName = null;
        this.mIsPause = false;
        this.mOnFinishListener = null;
        this.customEventID = -1;
        this.CancelFinishSchedule();
        // Cocos 2.x AudioSource.clip setter rejects null ("Wrong type of AudioClip").
        // Just stop; next Play overwrites clip.
        if (this.mAudioSource) {
            this.mAudioSource.stop();
        }
        this.mAudioClip = null;
        if (this.mLoader) {
            this.mLoader.Unload();
            AudioKit.Config.AudioLoaderPool.RecycleLoader(this.mLoader);
            this.mLoader = null;
        }
    }

    public OnRecycled(): void {
        this.CleanResources();
    }

    public Recycle2Cache(): void {
        if (!SafeObjectPool.Instance(AudioPlayer).Recycle(this)) {
            if (this.mAudioSource && cc.isValid(this.mAudioSource.node)) {
                this.mAudioSource.destroy();
                this.mAudioSource = null;
            }
        }
    }
}

// #endregion

// #region AudioManager

const { ccclass } = cc._decorator;

@ccclass
export class AudioManager extends MonoSingleton {

    public MusicPlayer: AudioPlayer = null;
    public VoicePlayer: AudioPlayer = null;
    public CurrentMusicName: string = "";
    public CurrentVoiceName: string = "";

    private readonly mSoundPlayerInPlaying: Map<string, AudioPlayer[]> = new Map();

    public static get Instance(): AudioManager {
        return MonoSingleton.GetInstance(AudioManager);
    }

    public OnSingletonInit(): void {
        SafeObjectPool.Instance(AudioPlayer).Init(10, 1);
        SafeObjectPool.Instance(AudioSearchKeys).Init(10, 1);
        this.MusicPlayer = AudioPlayer.Allocate();
        this.MusicPlayer.usedCache = false;
        this.VoicePlayer = AudioPlayer.Allocate();
        this.VoicePlayer.usedCache = false;
        this.BindSettings();
    }

    private BindSettings(): void {
        const node = this.node;
        AudioKit.Settings.MusicVolume.Register((volume) => {
            this.MusicPlayer.SetVolume(volume);
        }).UnRegisterWhenGameObjectDestroyed(node);
        AudioKit.Settings.VoiceVolume.Register((volume) => {
            this.VoicePlayer.SetVolume(volume);
        }).UnRegisterWhenGameObjectDestroyed(node);
        AudioKit.Settings.IsMusicOn.Register((musicOn) => {
            if (musicOn) {
                if (this.CurrentMusicName) {
                    AudioKit.PlayMusic(this.CurrentMusicName);
                }
            } else {
                this.MusicPlayer.Stop();
            }
        }).UnRegisterWhenGameObjectDestroyed(node);
        AudioKit.Settings.IsVoiceOn.Register((voiceOn) => {
            if (voiceOn) {
                if (this.CurrentVoiceName) {
                    AudioKit.PlayVoice(this.CurrentVoiceName);
                }
            } else {
                this.VoicePlayer.Stop();
            }
        }).UnRegisterWhenGameObjectDestroyed(node);
        AudioKit.Settings.IsSoundOn.Register((soundOn) => {
            if (!soundOn) {
                this.ForEachAllSound((player) => player.Stop());
            }
        }).UnRegisterWhenGameObjectDestroyed(node);
        AudioKit.Settings.SoundVolume.Register((soundVolume) => {
            this.ForEachAllSound((player) => player.SetVolume(soundVolume));
        }).UnRegisterWhenGameObjectDestroyed(node);
    }

    public CheckAudioListener(): void {
        // Cocos handles audio listener globally; no-op for API parity
    }

    public ForEachAllSound(operation: (player: AudioPlayer) => void): void {
        this.mSoundPlayerInPlaying.forEach((list) => {
            for (let i = 0; i < list.length; i++) {
                operation(list[i]);
            }
        });
    }

    public AddSoundPlayer2Pool(audioPlayer: AudioPlayer): void {
        const list = this.mSoundPlayerInPlaying.get(audioPlayer.Name);
        if (list) {
            list.push(audioPlayer);
        } else {
            this.mSoundPlayerInPlaying.set(audioPlayer.Name, [audioPlayer]);
        }
    }

    public RemoveSoundPlayerFromPool(audioPlayer: AudioPlayer): void {
        const list = this.mSoundPlayerInPlaying.get(audioPlayer.Name);
        if (list) {
            const idx = list.indexOf(audioPlayer);
            if (idx >= 0) {
                list.splice(idx, 1);
            }
        }
    }

    public ClearAllPlayingSound(): void {
        this.mSoundPlayerInPlaying.clear();
    }

    protected update(): void {
        AudioKit.TickFrame();
    }
}

// #endregion

// #region AudioKit

export enum PlaySoundModes {
    EveryOne,
    IgnoreSameSoundInGlobalFrames,
    IgnoreSameSoundInSoundFrames,
}

export class AudioKit {

    public static readonly Config: AudioKitConfig = new AudioKitConfig();
    public static readonly Settings: AudioKitSettings = new AudioKitSettings();

    public static PlaySoundMode: PlaySoundModes = PlaySoundModes.EveryOne;
    public static SoundFrameCountForIgnoreSameSound: number = 10;
    public static GlobalFrameCountForIgnoreSameSound: number = 10;

    private static mSoundFrameCountForName: Map<string, number> = new Map();
    private static mGlobalFrameCount: number = 0;
    private static mFrameCount: number = 0;

    public static TickFrame(): void {
        AudioKit.mFrameCount++;
    }

    /** 使用 ResKit 加载音频（替代 Unity SupportOldQF 自动初始化） */
    public static UseResKitLoader(): void {
        AudioKit.Config.AudioLoaderPool = new ResKitAudioLoaderPool();
    }

    public static get MusicPlayer(): AudioPlayer {
        return AudioManager.Instance.MusicPlayer;
    }

    public static get VoicePlayer(): AudioPlayer {
        return AudioManager.Instance.VoicePlayer;
    }

    private static CanPlaySound(soundName: string): boolean {
        if (AudioKit.PlaySoundMode === PlaySoundModes.EveryOne) {
            return true;
        }
        if (AudioKit.PlaySoundMode === PlaySoundModes.IgnoreSameSoundInGlobalFrames) {
            if (AudioKit.mFrameCount - AudioKit.mGlobalFrameCount <= AudioKit.GlobalFrameCountForIgnoreSameSound) {
                if (AudioKit.mSoundFrameCountForName.has(soundName)) {
                    return false;
                }
                AudioKit.mSoundFrameCountForName.set(soundName, 0);
            } else {
                AudioKit.mGlobalFrameCount = AudioKit.mFrameCount;
                AudioKit.mSoundFrameCountForName.clear();
                AudioKit.mSoundFrameCountForName.set(soundName, 0);
            }
            return true;
        }
        if (AudioKit.PlaySoundMode === PlaySoundModes.IgnoreSameSoundInSoundFrames) {
            const frames = AudioKit.mSoundFrameCountForName.get(soundName);
            if (frames !== undefined) {
                if (AudioKit.mFrameCount - frames <= AudioKit.SoundFrameCountForIgnoreSameSound) {
                    return false;
                }
                AudioKit.mSoundFrameCountForName.set(soundName, AudioKit.mFrameCount);
            } else {
                AudioKit.mSoundFrameCountForName.set(soundName, AudioKit.mFrameCount);
            }
        }
        return true;
    }

    private static SoundFinish(soundName: string): void {
        if (AudioKit.PlaySoundMode === PlaySoundModes.IgnoreSameSoundInSoundFrames) {
            AudioKit.mSoundFrameCountForName.delete(soundName);
        }
    }

    public static PlayMusic(
        musicName: string,
        loop: boolean = true,
        onBeganCallback: () => void = null,
        onEndCallback: () => void = null,
        allowMusicOff: boolean = true,
        volume: number = -1
    ): void {
        AudioManager.Instance.CheckAudioListener();
        AudioManager.Instance.CurrentMusicName = musicName;
        if (!AudioKit.Settings.IsMusicOn.Value && allowMusicOff) {
            if (onBeganCallback) {
                onBeganCallback();
            }
            if (onEndCallback) {
                onEndCallback();
            }
            return;
        }
        AudioKit.MusicPlayer.SetOnStartListener(() => {
            if (onBeganCallback) {
                onBeganCallback();
            }
            if (volume < 0) {
                AudioKit.MusicPlayer.SetVolume(AudioKit.Settings.MusicVolume.Value);
            } else {
                AudioKit.MusicPlayer.SetVolume(volume);
            }
            AudioKit.MusicPlayer.SetOnStartListener(null);
        });
        AudioKit.MusicPlayer.SetAudio(AudioManager.Instance.node, musicName, loop);
        AudioKit.MusicPlayer.SetOnFinishListener((player) => {
            if (onEndCallback) {
                onEndCallback();
            }
            player.SetOnFinishListener(null);
        });
    }

    public static PlayMusicWithClip(
        clip: cc.AudioClip,
        loop: boolean = true,
        onBeganCallback: () => void = null,
        onEndCallback: () => void = null,
        allowMusicOff: boolean = true,
        volume: number = -1
    ): void {
        AudioManager.Instance.CheckAudioListener();
        AudioManager.Instance.CurrentMusicName = "music" + clip["_uuid"];
        if (!AudioKit.Settings.IsMusicOn.Value && allowMusicOff) {
            if (onBeganCallback) {
                onBeganCallback();
            }
            if (onEndCallback) {
                onEndCallback();
            }
            return;
        }
        AudioKit.MusicPlayer.SetOnStartListener(() => {
            if (onBeganCallback) {
                onBeganCallback();
            }
            AudioKit.MusicPlayer.SetVolume(volume < 0 ? AudioKit.Settings.MusicVolume.Value : volume);
            AudioKit.MusicPlayer.SetOnStartListener(null);
        });
        AudioKit.MusicPlayer.SetAudioExt(AudioManager.Instance.node, clip, AudioManager.Instance.CurrentMusicName, loop);
        AudioKit.MusicPlayer.SetOnFinishListener((player) => {
            if (onEndCallback) {
                onEndCallback();
            }
            player.SetOnFinishListener(null);
        });
    }

    public static StopMusic(): void {
        AudioKit.MusicPlayer.Stop();
    }

    public static PauseMusic(): void {
        AudioKit.MusicPlayer.Pause();
    }

    public static ResumeMusic(): void {
        AudioKit.MusicPlayer.Resume();
    }

    public static PlayVoice(
        voiceName: string,
        loop: boolean = false,
        onBeganCallback: () => void = null,
        onEndedCallback: () => void = null
    ): void {
        AudioManager.Instance.CheckAudioListener();
        AudioManager.Instance.CurrentVoiceName = voiceName;
        if (!AudioKit.Settings.IsVoiceOn.Value) {
            return;
        }
        AudioKit.VoicePlayer.SetOnStartListener(() => {
            if (onBeganCallback) {
                onBeganCallback();
            }
            AudioKit.VoicePlayer.SetVolume(AudioKit.Settings.VoiceVolume.Value);
            AudioKit.VoicePlayer.SetOnStartListener(null);
        });
        AudioKit.VoicePlayer.SetAudio(AudioManager.Instance.node, voiceName, loop);
        AudioKit.VoicePlayer.SetOnFinishListener((player) => {
            if (onEndedCallback) {
                onEndedCallback();
            }
            player.SetOnFinishListener(null);
        });
    }

    public static PauseVoice(): void {
        AudioKit.VoicePlayer.Pause();
    }

    public static ResumeVoice(): void {
        AudioKit.VoicePlayer.Resume();
    }

    public static StopVoice(): void {
        AudioKit.VoicePlayer.Stop();
    }

    public static PlaySound(
        soundName: string,
        loop: boolean = false,
        callBack: (player: AudioPlayer) => void = null,
        customEventId: number = -1,
        volumeScale: number = 1.0
    ): AudioPlayer {
        AudioManager.Instance.CheckAudioListener();
        if (!AudioKit.Settings.IsSoundOn.Value) {
            return null;
        }
        if (!AudioKit.CanPlaySound(soundName)) {
            return null;
        }
        const soundPlayer = AudioPlayer.Allocate();
        soundPlayer.SetOnStartListener((player) => {
            player.SetVolume(AudioKit.Settings.SoundVolume.Value * volumeScale);
            soundPlayer.SetOnStartListener(null);
        });
        soundPlayer.SetAudio(AudioManager.Instance.node, soundName, loop);
        soundPlayer.SetOnFinishListener((unit) => {
            if (callBack) {
                callBack(unit);
            }
            AudioManager.Instance.RemoveSoundPlayerFromPool(soundPlayer);
            AudioKit.SoundFinish(soundName);
        });
        soundPlayer.customEventID = customEventId;
        AudioManager.Instance.AddSoundPlayer2Pool(soundPlayer);
        return soundPlayer;
    }

    public static PlaySoundWithClip(
        clip: cc.AudioClip,
        loop: boolean = false,
        callBack: (player: AudioPlayer) => void = null,
        customEventId: number = -1
    ): AudioPlayer {
        AudioManager.Instance.CheckAudioListener();
        if (!AudioKit.Settings.IsSoundOn.Value) {
            return null;
        }
        const soundName = clip ? clip.name : "";
        if (!AudioKit.CanPlaySound(soundName)) {
            return null;
        }
        const soundPlayer = AudioPlayer.Allocate();
        const cacheName = "sound" + (clip ? clip["_uuid"] : "");
        soundPlayer.SetAudioExt(AudioManager.Instance.node, clip, cacheName, loop);
        soundPlayer.SetVolume(AudioKit.Settings.SoundVolume.Value);
        soundPlayer.SetOnFinishListener((unit) => {
            if (callBack) {
                callBack(unit);
            }
            AudioManager.Instance.RemoveSoundPlayerFromPool(soundPlayer);
        });
        soundPlayer.customEventID = customEventId;
        AudioManager.Instance.AddSoundPlayer2Pool(soundPlayer);
        return soundPlayer;
    }

    public static StopAllSound(): void {
        AudioManager.Instance.ForEachAllSound((player) => player.Stop());
        AudioManager.Instance.ClearAllPlayingSound();
    }
}

// #endregion
