export interface Invitations {
  id: number;
  token: string;
  association_id: string;
  created_by: string;
  used_by: string;
  email: string;
  status: "pending" | "accepted" | "expired";
  expires_at: string;
  created_at: string;
}
