import { AbstractUtility } from "../../../../../../script/framework/QFramework";

export class CricketUiUtility extends AbstractUtility {
    public formatStartTime(unixSec: number): string {
        if (!unixSec) {
            return "";
        }
        const d = new Date(unixSec * 1000);
        return d.toLocaleString();
    }
}
