// 🧩 Core Admin Structure — aligned with Mongoose schema
export interface Admin {
  _id?: string;
  name: string;
  email: string;
  password?: string; // usually excluded in responses, but useful for create forms
  role: "administrator" | "city_admin" | "user";
  city?: string;
  phone?: string;
  status?: "active" | "inactive";
  AddressLine1?: string;
  AddressLine2?: string;
  createdBy?: string; // ObjectId reference to another Admin
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

// 🔑 Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// 🧾 Signup / Create Admin input
export interface CreateAdminData {
  name: string;
  email: string;
  password: string;
  role: string;
  city?: string;
  phone?: string;
  status?:String;
  AddressLine1?: string;
  AddressLine2?: string;
}

// ✏️ Update Admin details (excluding password)
export interface UpdateAdminDetailsData {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  status?: "Active" | "Inactive";
  role?: "administrator" | "city_admin" | "user";
  AddressLine1?: string;
  AddressLine2?: string;
}

// 🔒 Password update payload
export interface UpdatePasswordData {
  oldPassword?: string;
  newPassword: string;
}

// 🌐 Generic API Response
export interface AuthApiResponse {
  success: boolean;
  message: string;
  admin?: Admin;
  admins?: Admin[]; 
  adminData?: Admin; 
  token?: string;
}

export interface usersGetDataInterface{
  _id:string;
  name:string;
}


export interface userDeleteDialogueInterface{
  _id?:string;
  name:string;
}