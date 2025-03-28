export interface IPaginatedUsers {
  message: string;
  data: any[];
  total: number;
  skip: number;
  take: number;
}

export interface IUser {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  username: string;
  phoneNumber?: string;
  profileImage?: string;
  verified: boolean;
  kycVerified: boolean;
  roleId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
