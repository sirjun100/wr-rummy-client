import { Label, Node } from "cc";
import type { ProfileDto } from "../../../../../script/game/commerce/config/PaymentProtocol";
import { setLabel } from "../utility/PurseNodeUtil";

function genderText(g?: number): string {
    if (g === 1) {
        return "Male";
    }
    if (g === 2) {
        return "Female";
    }
    if (g && g > 0) {
        return "Other";
    }
    return "Not added";
}

export function bindPurseProfile(root: Node, profile: ProfileDto): void {
    const tel = (profile.tel_no ?? "").trim();
    const email = (profile.email ?? "").trim();
    const birth = (profile.birth ?? "").trim();
    setLabel(root, "tel_desc", tel || "Not added");
    setLabel(root, "email_desc", email || "Not added");
    setLabel(root, "sex_desc", genderText(profile.gender));
    setLabel(root, "birth_desc", birth || "Not added");
    const cnt = root.getChildByName("cntNode");
    if (cnt) {
        cnt.getChildByName("tel_desc")?.getComponent(Label)?.string = tel || "Not added";
        cnt.getChildByName("email_desc")?.getComponent(Label)?.string = email || "Not added";
        cnt.getChildByName("sex_desc")?.getComponent(Label)?.string = genderText(profile.gender);
        cnt.getChildByName("birth_desc")?.getComponent(Label)?.string = birth || "Not added";
    }
}
