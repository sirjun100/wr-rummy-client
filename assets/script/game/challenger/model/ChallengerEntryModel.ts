import { AbstractModel, BindableProperty } from "../../../framework/QFramework";

export class ChallengerEntryModel extends AbstractModel {
    public readonly entryStatus = new BindableProperty(0);
    public readonly autoEntry = new BindableProperty(0);

    protected OnInit(): void {}
}
