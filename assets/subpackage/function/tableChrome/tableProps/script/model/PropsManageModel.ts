import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import type { PropsEquippedProfileDto, PropsPageDto } from "../config/PropsProtocol";

export type PropsDraftStyles = {
    tableId: number;
    faceId: number;
    backId: number;
};

export type PropsDraftProfile = {
    name: string;
    avatarId: number;
};

export class PropsManageModel extends AbstractModel {
    public readonly page = new BindableProperty<PropsPageDto | null>(null);
    public readonly tableRedDot = new BindableProperty(0);

    public draftStyles: PropsDraftStyles = { tableId: 1, faceId: 1, backId: 3 };
    public draftProfile: PropsDraftProfile = { name: "", avatarId: 1 };

    protected OnInit(): void {}

    public applyPage(dto: PropsPageDto): void {
        this.page.value = dto;
        if (dto.table_red_dot !== undefined) {
            this.tableRedDot.value = dto.table_red_dot;
        }
        const eq = dto.equipped;
        if (eq) {
            this.draftStyles = {
                tableId: eq.table_id ?? this.draftStyles.tableId,
                faceId: eq.table_face_id ?? this.draftStyles.faceId,
                backId: eq.table_back_id ?? this.draftStyles.backId,
            };
        }
        const prof = dto.equipped_profile;
        if (prof) {
            this.draftProfile = {
                name: prof.name ?? this.draftProfile.name,
                avatarId: prof.avatar_id ?? this.draftProfile.avatarId,
            };
        }
    }

    public mergeEquippedProfile(prof?: PropsEquippedProfileDto): void {
        if (!prof) {
            return;
        }
        const cur = this.page.value ?? {};
        this.page.value = {
            ...cur,
            equipped_profile: { ...cur.equipped_profile, ...prof },
        };
        this.draftProfile = {
            name: prof.name ?? this.draftProfile.name,
            avatarId: prof.avatar_id ?? this.draftProfile.avatarId,
        };
    }
}
