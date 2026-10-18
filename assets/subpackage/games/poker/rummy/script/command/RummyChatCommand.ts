import { AbstractCommand } from "../../../../../../script/framework/QFramework";

/** Placeholder until chat route is wired to prefab buttons. */
export class RummyChatCommand extends AbstractCommand {
    public constructor(private readonly text: string) {
        super();
    }

    protected OnExecute(): void {
        globalThis.wrUi?.showToast?.(this.text || "Chat");
    }
}
