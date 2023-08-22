import { IGender, IMaritalStatus } from "../enums/IGenderType";
import { IRoles } from "../enums/IRoles";

export interface IEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  officialEmail: string;
  mobileNumber: string;
  alternateMobileNumber: string;
  dateOfBirth: string | Date;
  address: "";
  gender: IGender;
  maritalStatus: IMaritalStatus;
  imageUrl: string;
  currentAddress: IAddress;
  permanentAddress: IAddress;
  linkedinUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  role: IRoles;
}

export interface IAddress {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
}
