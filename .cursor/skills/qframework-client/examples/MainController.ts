/**
 * Controller 模板 — 挂到场景节点上的 Component
 */
import { _decorator, Label } from "cc";
import { AbstractController, IArchitecture } from "../../framework/QFramework";
import { GameApp } from "../GameApp";

const { ccclass, property } = _decorator;

@ccclass("SampleController")
export class SampleController extends AbstractController {
    @property(Label)
    public txtHello: Label = null;

    public GetArchitecture(): IArchitecture {
        return GameApp.Interface;
    }

    protected onLoad(): void {
        // this.RegisterEvent(SomeEvent, this.onSome, this)
        //     .UnRegisterWhenGameObjectDestroyed(this.node);
    }
}
