import { IGender, IMaritalStatus } from "../enums/IGenderType";
import { IRoles } from "../enums/IRoles";

export interface IEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  officialEmail: string;
  bloodGroup: string;
  mobileNumber: string;
  alternateMobileNumber: string;
  dateOfBirth: string | Date;
  gender: IGender;
  maritalStatus: IMaritalStatus;
  imageUrl: string;
  currentAddress: IAddress;
  permanentAddress: IAddress;
  linkedinUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  role: IRoles;
  jobTitle: string;
  employeeType: string,
  status: string,
  joiningDate: string | Date,
  resignationDate: string | Date,
  workLocation: string,
  designation: string,
  department: string,
  subDepartment: string
  accountInfo: IAccountInfo,
}

export interface IAddress {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface IAccountInfo {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
}
