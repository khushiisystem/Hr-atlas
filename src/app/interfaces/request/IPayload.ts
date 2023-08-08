export interface IJWTPayload {
  uuid: string;
  email: string;
  gender?: string;
  role: string;
  isNew?: boolean;
  provider?: string;
}
