import { AbstractModel } from "../../framework/QFramework";

export class StartFlowModel extends AbstractModel {
    public stepIndex = 0;
    public progress = 0;
    public loginPanelVisible = false;
    public otpCountdownSec = 0;
    public pendingPhone = "";

    protected OnInit(): void {}

    public setProgress(stepIndex: number, progress: number): void {
        this.stepIndex = stepIndex;
        this.progress = progress;
    }
}
