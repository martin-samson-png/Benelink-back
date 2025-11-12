export interface AcceptInvitationDTO {
  token: string;
  associationId: string;
  userId: string;
  roleId?: number;
  option?: { shouldAddRole: boolean };
}
