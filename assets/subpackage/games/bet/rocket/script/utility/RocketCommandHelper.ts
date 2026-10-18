import { LogKit } from "../../../../../../script/framework/toolkits/coreKit/logKit/LogKit";

export function logRocketCommandError(name: string, err: unknown): void {
    const msg = err instanceof Error ? err.message : String(err);
    LogKit.W("[Rocket] command {0} failed: {1}", name, msg);
}
