import { AbstractModel } from "../../framework/QFramework";

export class SessionModel extends AbstractModel {
    public uid: number = 0;
    public account: string = "";

    protected OnInit(): void {}

    public clear(): void {
        this.uid = 0;
        this.account = "";
    }
}
