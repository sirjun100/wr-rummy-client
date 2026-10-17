import { sys } from "cc";
import { AbstractSystem } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { NativeAuthResultEvent } from "../event/StartEvents";

export type SocialProvider = "facebook" | "google" | "apple";

/**
 * 设备 / 原生 SDK 门面（单文件自包含，P0 Web stub）。
 */
export class PlatformSystem extends AbstractSystem {
    protected OnInit(): void {
        if (typeof globalThis !== "undefined") {
            (globalThis as { PlatformSystem?: PlatformSystem }).PlatformSystem = this;
        }
    }

    protected OnDeinit(): void {}

    public getDeviceId(): string {
        const key = "wr_device_id";
        let id = sys.localStorage.getItem(key);
        if (!id) {
            id = `web-${Date.now()}`;
            sys.localStorage.setItem(key, id);
        }
        return id;
    }

    /** P0：编辑器/Web 返回 stub token，原生后续接 JNI。 */
    public getStubSocialToken(provider: SocialProvider): string {
        LogKit.I("[PlatformSystem] getStubSocialToken provider={0}", provider);
        const token = `stub-${provider}-${Date.now()}`;
        this.SendEvent(new NativeAuthResultEvent(provider, token));
        return token;
    }

    public logLoginEvent(event: string, detail?: string): void {
        LogKit.I("[PlatformSystem] login_evt {0} {1}", event, detail ?? "");
    }

    /** Cmd_AdvancePack recharge analytics (P0 log stub; native SDK later). */
    public reportAdvancedPack(
        scene: number,
        step: number,
        linkId: number,
        extra?: { money?: number },
    ): void {
        LogKit.I(
            "[PlatformSystem] Cmd_AdvancePack scene={0} step={1} link={2} extra={3}",
            scene,
            step,
            linkId,
            extra ? JSON.stringify(extra) : "",
        );
    }

    /** P0: resolve immediately; P1 wires store / wallet callback. */
    public startAdvancedGiftPay(money: number, tierId: number): Promise<void> {
        LogKit.I("[PlatformSystem] startAdvancedGiftPay money={0} tierId={1}", money, tierId);
        return Promise.resolve();
    }

    /** P0: resolve immediately; P1 wires store / wallet callback (Act_125). */
    public startPayOneForThreePay(price: number, goodId: number): Promise<void> {
        LogKit.I("[PlatformSystem] startPayOneForThreePay price={0} goodId={1}", price, goodId);
        return Promise.resolve();
    }

    /** P0: resolve immediately; P1 wires store / wallet callback (Act_68 Gullak). */
    public startPiggyBankPay(money: number): Promise<void> {
        LogKit.I("[PlatformSystem] startPiggyBankPay money={0}", money);
        return Promise.resolve();
    }

    public startFirstRechargePay(price: number, tierIndex: number): Promise<void> {
        LogKit.I("[PlatformSystem] startFirstRechargePay price={0} tier={1}", price, tierIndex);
        return Promise.resolve();
    }

    public startRebateRechargePay(price: number, tierIndex: number): Promise<void> {
        LogKit.I("[PlatformSystem] startRebateRechargePay price={0} tier={1}", price, tierIndex);
        return Promise.resolve();
    }

    public startTwentyFourRechargePay(price: number): Promise<void> {
        LogKit.I("[PlatformSystem] startTwentyFourRechargePay price={0}", price);
        return Promise.resolve();
    }

    public startRestartGiftPay(price: number): Promise<void> {
        LogKit.I("[PlatformSystem] startRestartGiftPay price={0}", price);
        return Promise.resolve();
    }

    public startConsecutiveGiftPay(price: number, day: number): Promise<void> {
        LogKit.I("[PlatformSystem] startConsecutiveGiftPay price={0} day={1}", price, day);
        return Promise.resolve();
    }

    /** P0: resolve immediately; P1 wires store / wallet callback (Act_104). */
    public startWeeklyMonthCardPay(price: number, cardId: number, goodId: number): Promise<void> {
        LogKit.I("[PlatformSystem] startWeeklyMonthCardPay price={0} cardId={1} goodId={2}", price, cardId, goodId);
        return Promise.resolve();
    }
}
