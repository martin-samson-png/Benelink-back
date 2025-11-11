export interface Invitations {
  id: number;
  token: string;
  associationId: string;
  createdBy: string;
  usedBy: string;
  email: string;
  status: "pending" | "accepted" | "expired";
  expiresAt: string;
  createdAt: string;
}
