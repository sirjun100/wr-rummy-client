import { isValid, Node, sys } from "cc";

/** Cocos 节点 / 对象有效性（迁移自 ToolUtils.isObjValid）。 */
export class NodeUtil {
    public static IsValid(target: unknown): boolean {
        return sys.isObjectValid(target) && isValid(target as Node, true);
    }

    /** 与旧工程命名一致，便于迁移面板脚本。 */
    public static isObjValid(target: unknown): boolean {
        return NodeUtil.IsValid(target);
    }

    public static IsValidStrict(target: unknown): boolean {
        return NodeUtil.IsValid(target);
    }
}
