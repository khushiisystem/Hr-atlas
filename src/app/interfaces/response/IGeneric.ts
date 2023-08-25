export interface IGeneric {
  guid: string;
  isDeleted: boolean;
  created_user: string;
  created_date: string | Date;
  modified_user?: string;
  modified_date?: string | Date;
}
