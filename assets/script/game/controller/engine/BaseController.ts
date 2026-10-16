import { AbstractController, IArchitecture } from "../../../framework/QFramework";
import { GameApp } from "../../GameApp";

/** Scene / 子包根节点 Controller 基类：统一架构入口。 */
export abstract class BaseController extends AbstractController {
    public GetArchitecture(): IArchitecture {
        return GameApp.Interface;
    }
}
