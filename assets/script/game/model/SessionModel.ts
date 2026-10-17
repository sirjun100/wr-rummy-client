import { AbstractModel } from "../../framework/QFramework";

import { LoginType } from "../config/StartConfig";

export class SessionModel extends AbstractModel {
    public uid: number = 0;
    public account: string = "";
    public loginType: LoginType | string = "";

    protected OnInit(): void {}

    public clear(): void {
        this.uid = 0;
        this.account = "";
        this.loginType = "";
    }
}
