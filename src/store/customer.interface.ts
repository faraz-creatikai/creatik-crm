export interface customerAllDataInterface {
  Campaign: { id: string; name: string };
  CustomerType: { id: string; name: string };
  customerName: string;
  CustomerSubtype: { id: string; name: string };
  ContactNumber: string;
  City: {id:string; name:string};
  Location:{id:string; name:string};
  SubLocation:{id:string; name:string};
  Area: string;
  Address: string;
  Email: string;
  Facilities: string;
  ReferenceId: string;
  CustomerId: string;
  CustomerDate: string;
  CustomerYear: string;
  Other: string;
  Description: string;
  Video: string;
  GoogleMap: string;
  isFavourite?: boolean;
  Verified: string;
  CustomerImage: File[];
  SitePlan: File
}

export interface customerImportDataInterface {
  Campaign: { id: string; name: string };
  CustomerType: { id: string; name: string };
  customerName: string;
  CustomerSubtype: { id: string; name: string };
  ContactNumber: string;
  City: string;
  Location: string;
  SubLocation: string;
  Area: string;
  Address: string;
  Email: string;
  Facilities: string;
  ReferenceId: string;
  CustomerId: string;
  CustomerDate: string;
  CustomerYear: string;
  Other: string;
  Description: string;
  Video: string;
  GoogleMap: string;
  isFavourite?: boolean;
  Verified: string;
}

export interface customerGetDataInterface {
  _id: string;
  Campaign: string;
  Type: string;
  SubType: string;
  Name: string;
  Description?:string;
  Email: string;
  City: string;
  Location: string;
  isFavourite?: boolean;
  ContactNumber: string;
  AssignTo: string;
  Date: string;
  SitePlan?: string;
}


export interface CustomerAdvInterface {
  _id: string[];
  StatusAssign: string[];
  Campaign: string[];
  CustomerType: string[];
  CustomerSubtype: string[];
  City: string[];
  Location: string[];
  User: string[];
  StartDate: string;
  EndDate: string;
  Limit: string[];
}

export interface customerAssignInterface {
  customerIds: string[];
  assignToId: string;
}

export interface contactAssignInterface {
  contactIds: string[];
  assignToId: string;
}

export interface customerDeletePayloadInterface {
  customerIds: string[];
}

export interface DeleteDialogDataInterface {
  id: string;
  customerName: string;
  ContactNumber: string;
  isFavourite?: boolean;
}