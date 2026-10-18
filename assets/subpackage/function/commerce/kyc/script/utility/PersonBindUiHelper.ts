import { Button, EditBox, Label, Node } from "cc";
import type { PersonBindType } from "../config/VerifyProtocol";

export function findDeep(root: Node, name: string): Node | null {
    if (!root?.isValid) {
        return null;
    }
    if (root.name === name) {
        return root;
    }
    for (const child of root.children) {
        const hit = findDeep(child, name);
        if (hit) {
            return hit;
        }
    }
    return null;
}

export function applyBindTab(root: Node, bindType: PersonBindType): void {
    const phone = findDeep(root, "bind_mobile") ?? findDeep(root, "bind_phone");
    const email = findDeep(root, "bind_email");
    const showPhone = bindType === "tel";
    if (phone) {
        phone.active = showPhone;
    }
    if (email) {
        email.active = !showPhone;
    }
}

export function getValueEdit(root: Node, bindType: PersonBindType): EditBox | null {
    const name = bindType === "tel" ? "edit_mobile" : "edit_email";
    const node = findDeep(root, name);
    return node?.getComponent(EditBox) ?? null;
}

export function getOtpEdit(root: Node, bindType: PersonBindType): EditBox | null {
    const otpRoot = findDeep(root, bindType === "tel" ? "mobile_otp" : "email_otp");
    if (!otpRoot) {
        return null;
    }
    const otpText = findDeep(otpRoot, "otp_text");
    return otpText?.getComponent(EditBox) ?? otpRoot.getComponentInChildren(EditBox);
}

export function setOtpCooldownUi(root: Node, bindType: PersonBindType, remainingSec: number): void {
    const resend = findDeep(root, "resend_btn");
    const resendBtn = resend?.getComponent(Button);
    const otpBtn = findDeep(root, bindType === "tel" ? "verify_btn" : "verify_btn");
    const timeLabel =
        findDeep(root, "otp_time_info")?.getComponent(Label) ??
        findDeep(root, "otp_tip_info")?.getComponent(Label);
    const cooling = remainingSec > 0;
    if (resendBtn) {
        resendBtn.interactable = !cooling;
    }
    if (otpBtn) {
        otpBtn.interactable = !cooling;
    }
    if (timeLabel) {
        timeLabel.string = cooling ? `${remainingSec}s` : "";
    }
}
