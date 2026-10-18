import { AbstractCommand } from "../../../../../script/framework/QFramework";
import type { NetworkDelayConfigDto } from "../config/NetworkDelayProtocol";
import { NetworkDelayModel } from "../model/NetworkDelayModel";

export class ApplyNetworkDelayConfigCommand extends AbstractCommand {
    private readonly dto: NetworkDelayConfigDto;

    public constructor(dto: NetworkDelayConfigDto) {
        super();
        this.dto = dto;
    }

    protected OnExecute(): void {
        this.GetModel(NetworkDelayModel).applyConfig(this.dto);
    }
}
