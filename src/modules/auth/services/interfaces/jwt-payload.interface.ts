export interface JwtPayload {
  userId: string
  companyId: string
  refreshToken?: string
}
