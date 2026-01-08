'use client'

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import SingleSelect from "@/app/component/SingleSelect";
import DateSelector from "@/app/component/DateSelector";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { addCustomer, getFilteredCustomer } from "@/store/customer";
import { customerAllDataInterface } from "@/store/customer.interface";
import { getCampaign } from "@/store/masters/campaign/campaign";
import { getTypes, getTypesByCampaign } from "@/store/masters/types/types";
import { getCity } from "@/store/masters/city/city";
import { getLocation, getLocationByCity } from "@/store/masters/location/location";
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";
import { getSubtype, getSubtypeByCampaignAndType } from "@/store/masters/subtype/subtype";
import { getFacilities } from "@/store/masters/facilities/facilities";
import BackButton from "@/app/component/buttons/BackButton";
import SaveButton from "@/app/component/buttons/SaveButton";
import { handleFieldOptionsObject } from "@/app/utils/handleFieldOptionsObject";
import ObjectSelect from "@/app/component/ObjectSelect";
import CustomerSubtypeAdd from "@/app/masters/customer-subtype/add/page";
import InputField from "@/app/component/datafields/InputField";
import TextareaField from "@/app/component/datafields/TextareaField";
import { getFilteredContact } from "@/store/contact";
import { trimCountryCodeHelper } from "@/app/utils/trimCountryCodeHelper";
import { getsubLocationByCityLoc } from "@/store/masters/sublocation/sublocation";

interface ErrorInterface {
  [key: string]: string;
}

export default function CustomerAdd() {
  const [customerData, setCustomerData] = useState<customerAllDataInterface>({
    Campaign: { id: "", name: "" },
    CustomerType: { id: "", name: "" },
    customerName: "",
    CustomerSubtype: { id: "", name: "" },
    ContactNumber: "",
    City: { id: "", name: "" },
    Location: { id: "", name: "" },
    SubLocation: { id: "", name: "" },
    Area: "",
    Address: "",
    Email: "",
    Facilities: "",
    ReferenceId: "",
    CustomerId: "",
    CustomerDate: "",
    CustomerYear: "",
    Other: "",
    Description: "",
    Video: "",
    GoogleMap: "",
    Verified: "",
    CustomerImage: [],
    SitePlan: {} as File
  });
  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [sitePlanPreview, setSitePlanPreview] = useState<string>("");
  const [errors, setErrors] = useState<ErrorInterface>({});
  const router = useRouter();


const handleContactExist = async (contactNo: string) => { 
  const duplicate = await isContactNoExist(contactNo);
    if (duplicate) return;
}

  // 🟩 Handle Input
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      if(name==="ContactNumber"){
        handleContactExist(value);
      }
      setCustomerData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    []
  );

  const handleSelectChange = useCallback(
    (label: string, selected: string) => {
      setCustomerData((prev) => ({ ...prev, [label]: selected }));
      setErrors((prev) => ({ ...prev, [label]: "" }));
    },
    []
  );

  // 🟩 Handle File Input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const files = e.target.files;
    if (!files) return;

    if (field === "CustomerImage") {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setCustomerData((prev) => ({ ...prev, CustomerImage: [...prev.CustomerImage, ...newFiles] }));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    } else if (field === "SitePlan") {
      const file = files[0];
      setCustomerData((prev) => ({ ...prev, SitePlan: file }));
      setSitePlanPreview(URL.createObjectURL(file));
    }
  };

  // 🟩 Remove image
  const handleRemoveImage = (index: number) => {
    setCustomerData((prev) => ({
      ...prev,
      CustomerImage: prev.CustomerImage.filter((_, i) => i !== index)
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // 🟩 Remove site plan
  const handleRemoveSitePlan = () => {
    setCustomerData((prev) => ({ ...prev, SitePlan: {} as File }));
    setSitePlanPreview("");
  };

  // 🟩 Validate Form
  const validateForm = () => {
    const newErrors: ErrorInterface = {};
    if (!customerData.Campaign?.name.trim())
      newErrors.Campaign = "Campaign is required";
    if (!customerData.customerName.trim())
      newErrors.customerName = "Customer Name is required";
    if (customerData.Email.trim() && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(customerData.Email))
      newErrors.Email = "Invalid email format";
    if (!customerData.ContactNumber.trim())
      newErrors.ContactNumber = "Contact No is required";
    if (customerData.ContactNumber && customerData.ContactNumber.trim().length < 10)
      newErrors.ContactNumber = "Contact No should atlest be 10 digit";
    return newErrors;
  };

  const trimCountryCode = (num: string) => {
  if (!num) return "";
  return num.startsWith("+91") ? num.slice(3) : num;
};

    const isContactNoExist = async (contactNo: string) => {
      if (contactNo.trim().length > 0 && contactNo.trim().length < 10) {
        setErrors((prev) => ({
          ...prev,
          ContactNumber: "Contact No should at least 10 digits",
        }));
        return true;
      }
      if(contactNo.trim().length === 0){
        return false;
      }
      
      const res = await getFilteredCustomer(`Keyword=${contactNo}`);
      const isExist = res.length;
  
      if (isExist && isExist > 0) {
        setErrors((prev) => ({
          ...prev,
          ContactNumber: "Contact No already exists",
        }));
        return true;
      }
  
      return false;
    };

  // 🟩 Submit Form
  const handleSubmit = async () => {
     const duplicate = await isContactNoExist(customerData.ContactNumber);
    if (duplicate) return;


    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
      const formData = new FormData();

      // Append fields

      if (customerData.Campaign) formData.append("Campaign", customerData.Campaign.name);
      if (customerData.CustomerType) formData.append("CustomerType", customerData.CustomerType.name);
      if (customerData.customerName) formData.append("customerName", customerData.customerName);
      if (customerData.CustomerSubtype) formData.append("CustomerSubType", customerData.CustomerSubtype?.name);
      if (customerData.ContactNumber) formData.append("ContactNumber", trimCountryCodeHelper(customerData.ContactNumber));
      if (customerData.City) formData.append("City", customerData.City.name);
      if (customerData.Location) formData.append("Location", customerData.Location?.name);
      if (customerData.SubLocation) formData.append("SubLocation", customerData.SubLocation?.name);
      if (customerData.Area) formData.append("Area", customerData.Area);
      if (customerData.Address) formData.append("Adderess", customerData.Address);
      if (customerData.Email) formData.append("Email", customerData.Email);
      if (customerData.Facilities) formData.append("Facillities", customerData.Facilities);
      if (customerData.ReferenceId) formData.append("ReferenceId", customerData.ReferenceId);
      if (customerData.CustomerId) formData.append("CustomerId", customerData.CustomerId);
      if (customerData.CustomerDate) formData.append("CustomerDate", customerData.CustomerDate);
      if (customerData.CustomerYear) formData.append("CustomerYear", customerData.CustomerYear);
      if (customerData.Other) formData.append("Other", customerData.Other);
      if (customerData.Description) formData.append("Description", customerData.Description);
      if (customerData.Video) formData.append("Video", customerData.Video);
      if (customerData.GoogleMap) formData.append("GoogleMap", customerData.GoogleMap);
      if (customerData.Verified) formData.append("Verified", customerData.Verified);

      // Append files correctly
      if (Array.isArray(customerData.CustomerImage)) {
        customerData.CustomerImage.forEach((file) => formData.append("CustomerImage", file));
      }

      if (customerData.SitePlan && (customerData.SitePlan as any).name) {
        formData.append("SitePlan", customerData.SitePlan);
      }
      //console.log(customerData)
      const result = await addCustomer(formData);

      if (result) {
        toast.success("Customer added successfully!");
        router.push("/customer");
      } else {
        //toast.error(result??"Failed to add customer");
      }
    
  };

  const dropdownOptions = ["Option1", "Option2", "Option3"];

  // Object-based fields (for ObjectSelect)
  const objectFields = [
    { key: "Campaign", fetchFn: getCampaign },
    { key: "CustomerType", staticData: [] },
    { key: "CustomerSubtype", staticData: [] },
    { key: "City", fetchFn: getCity },
    { key: "Location", staticData: [] }, // dependent
    { key: "SubLocation", staticData: [] }, // dependent

  ];

  // Simple array fields (for normal Select)
  const arrayFields = [
    { key: "Verified", staticData: ["yes", "no"] },
    { key: "Gender", staticData: ["male", "female", "other"] },
    { key: "Facilities", fetchFn: getFacilities },
    /*     { key: "Location", fetchFn: getLocation }, */
  ];


  useEffect(() => {
    const loadFieldOptions = async () => {
      await handleFieldOptionsObject(objectFields, setFieldOptions);
      await handleFieldOptions(arrayFields, setFieldOptions);
    };
    loadFieldOptions();
  }, []);


  useEffect(() => {
    if (customerData.Campaign.id) {
      fetchCustomerType(customerData.Campaign.id);
    } else {
      setFieldOptions((prev) => ({ ...prev, CustomerType: [] }));
    }

    if (customerData.Campaign.id && customerData.CustomerType.id) {
      fetchCustomerSubType(customerData.Campaign.id, customerData.CustomerType.id);
    } else {
      setFieldOptions((prev) => ({ ...prev, CustomerSubtype: [] }));
    }

    if (customerData.City.id) {
      fetchLocation(customerData.City.id);
    } else {
      setFieldOptions((prev) => ({ ...prev, Location: [] }));
    }
    if (customerData.City.id && customerData.Location.id) {
      fetchSubLocation(customerData.City.id, customerData.Location.id);
    } else {
      setFieldOptions((prev) => ({ ...prev, SubLocation: [] }));
    }
  }, [customerData.Campaign.id, customerData.CustomerType.id,customerData.City.id, customerData.Location.id]);

  const fetchCustomerType = async (campaignId: string) => {
    try {
      const res = await getTypesByCampaign(campaignId);
      setFieldOptions((prev) => ({ ...prev, CustomerType: res || [] }));
    } catch (error) {
      console.error("Error fetching types:", error);
      setFieldOptions((prev) => ({ ...prev, CustomerType: [] }));
    }
  };

  const fetchLocation = async (cityId: string) => {
    try {
      
      const res = await getLocationByCity(cityId);
      setFieldOptions((prev) => ({ ...prev, Location: res || [] }));
    } catch (error) {
      console.error("Error fetching location:", error);
      setFieldOptions((prev) => ({ ...prev, Location: [] }));
    }
  };

  const fetchSubLocation = async (cityId: string,locationId: string) => {
    try {
      const res = await getsubLocationByCityLoc(cityId,locationId);
      setFieldOptions((prev) => ({ ...prev, SubLocation: res || [] }));
    } catch (error) {
      console.error("Error fetching sublocation:", error);
      setFieldOptions((prev) => ({ ...prev, SubLocation: [] }));
    }
  };


  const fetchCustomerSubType = async (campaignId: string, customertypeId: string) => {
    try {
      const res = await getSubtypeByCampaignAndType(campaignId, customertypeId);
      setFieldOptions((prev) => ({ ...prev, CustomerSubtype: res || [] }));
    } catch (error) {
      console.error("Error fetching types:", error);
      setFieldOptions((prev) => ({ ...prev, CustomerSubtype: [] }));
    }
  };




  return (
    <div className=" min-h-screen flex justify-center">
      <Toaster position="top-right" />
      <div className="w-full">
        <div className="flex justify-end mb-4">
          <BackButton
            url="/customer"
            text="Back"
            icon={<ArrowLeft size={18} />}
          />
        </div>

        <div className="bg-white backdrop-blur-lg p-10 max-sm:px-5 w-full rounded-3xl shadow-2xl h-auto">
          <form onSubmit={(e) => e.preventDefault()} className="w-full">
            <div className="mb-8 text-left border-b pb-4 border-gray-200">
              <h1 className="text-3xl max-sm:text-2xl font-extrabold text-[var(--color-secondary-darker)] leading-tight tracking-tight">
                Add <span className="text-[var(--color-primary)]">Customer Information</span>
              </h1>
            </div>

            <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1">
              {/* <SingleSelect options={Array.isArray(fieldOptions?.Campaign)?fieldOptions.Campaign:[]} label="Campaign" value={customerData.Campaign} onChange={(v) => handleSelectChange("Campaign", v)} error={errors.Campaign} />
              <SingleSelect options={Array.isArray(fieldOptions?.CustomerType)?fieldOptions.CustomerType:[]} label="Customer Type" value={customerData.CustomerType} onChange={(v) => handleSelectChange("CustomerType", v)} /> */}
              <ObjectSelect
                options={Array.isArray(fieldOptions?.Campaign) ? fieldOptions.Campaign : []}
                label="Campaign"
                value={customerData.Campaign.id}
                getLabel={(item) => item?.Name || ""}
                getId={(item) => item?._id || ""}
                onChange={(selectedId) => {
                  const selectedObj = fieldOptions.Campaign.find((i) => i._id === selectedId);
                  if (selectedObj) {
                    setCustomerData((prev) => ({
                      ...prev,
                      Campaign: { id: selectedObj._id, name: selectedObj.Name },
                      CustomerType: { id: "", name: "" }, // reset on change
                    }));
                  }
                }}
                error={errors.Campaign}
              />

              <ObjectSelect
                options={Array.isArray(fieldOptions?.CustomerType) ? fieldOptions.CustomerType : []}
                label="Customer Type"
                value={customerData.CustomerType.id}
                getLabel={(item) => item?.Name || ""}
                getId={(item) => item?._id || ""}
                onChange={(selectedId) => {
                  const selectedObj = fieldOptions.CustomerType.find((i) => i._id === selectedId);
                  if (selectedObj) {
                    setCustomerData((prev) => ({
                      ...prev,
                      CustomerType: { id: selectedObj._id, name: selectedObj.Name },
                      CustomerSubtype: { id: "", name: "" } // reset on change
                    }));
                  }
                }}
                error={errors.CustomerType}
              />

              <ObjectSelect
                options={Array.isArray(fieldOptions?.CustomerSubtype) ? fieldOptions.CustomerSubtype : []}
                label="Customer Subtype"
                value={customerData.CustomerSubtype.id}
                getLabel={(item) => item?.Name || ""}
                getId={(item) => item?._id || ""}
                onChange={(selectedId) => {
                  const selectedObj = fieldOptions.CustomerSubtype.find((i) => i._id === selectedId);
                  if (selectedObj) {
                    setCustomerData((prev) => ({
                      ...prev,
                      CustomerSubtype: { id: selectedObj._id, name: selectedObj.Name },
                    }));
                  }
                }}
                error={errors.CustomerSubtype}
              />


              <InputField label="Customer Name" name="customerName" value={customerData.customerName} onChange={handleInputChange} error={errors.customerName} />
              <InputField label="Contact No" name="ContactNumber" value={customerData.ContactNumber} onChange={handleInputChange} error={errors.ContactNumber} />
              <ObjectSelect
                options={Array.isArray(fieldOptions?.City) ? fieldOptions.City : []}
                label="City"
                value={customerData.City.id}
                getLabel={(item) => item?.Name || ""}
                getId={(item) => item?._id || ""}
                onChange={(selectedId) => {
                  const selectedObj = fieldOptions.City.find((i) => i._id === selectedId);
                  if (selectedObj) {
                    setCustomerData((prev) => ({
                      ...prev,
                      City: { id: selectedObj._id, name: selectedObj.Name },
                      Location: { id: "", name: "" }, // reset on change
                      SubLocation: { id: "", name: "" } // reset on change
                    }));
                  }
                }}
                error={errors.City}
              />
              <ObjectSelect
                options={Array.isArray(fieldOptions?.Location) ? fieldOptions.Location : []}
                label="Location"
                value={customerData.Location.id}
                getLabel={(item) => item?.Name || ""}
                getId={(item) => item?._id || ""}
                onChange={(selectedId) => {
                  const selectedObj = fieldOptions.Location.find((i) => i._id === selectedId);
                  if (selectedObj) {
                    setCustomerData((prev) => ({
                      ...prev,
                      Location: { id: selectedObj._id, name: selectedObj.Name },
                      SubLocation: { id: "", name: "" } // reset on change
                    }));
                  }
                }}
                error={errors.Location}
              />
              <ObjectSelect
                options={Array.isArray(fieldOptions?.SubLocation) ? fieldOptions.SubLocation : []}
                label="SubLocation"
                value={customerData.SubLocation.id}
                getLabel={(item) => item?.Name || ""}
                getId={(item) => item?._id || ""}
                onChange={(selectedId) => {
                  const selectedObj = fieldOptions.SubLocation.find((i) => i._id === selectedId);
                  if (selectedObj) {
                    setCustomerData((prev) => ({
                      ...prev,
                      SubLocation: { id: selectedObj._id, name: selectedObj.Name },
                    }));
                  }
                }}
                error={errors.SubLocation}
              />
              <InputField className=" max-sm:hidden" label="Area" name="Area" value={customerData.Area} onChange={handleInputChange} />
              <InputField className=" max-sm:hidden" label="Address" name="Address" value={customerData.Address} onChange={handleInputChange} />
              <InputField className=" max-sm:hidden" label="Email" name="Email" value={customerData.Email} onChange={handleInputChange} error={errors.Email} />
              <SingleSelect className=" max-sm:hidden" options={Array.isArray(fieldOptions?.Facilities) ? fieldOptions.Facilities : []} label="Facilities" value={customerData.Facilities} onChange={(v) => handleSelectChange("Facilities", v)} />
              <InputField className=" max-sm:hidden" label="Reference ID" name="ReferenceId" value={customerData.ReferenceId} onChange={handleInputChange} />
              <InputField className=" max-sm:hidden" label="Customer ID" name="CustomerId" value={customerData.CustomerId} onChange={handleInputChange} />
              <div className=" max-sm:hidden">
                <DateSelector label="Customer Date" value={customerData.CustomerDate} onChange={(val) => handleSelectChange("CustomerDate", val)} />
              </div>
              <InputField className=" max-sm:hidden" label="Customer Year" name="CustomerYear" value={customerData.CustomerYear} onChange={handleInputChange} />
              <InputField className=" max-sm:hidden" label="Others" name="Others" value={customerData.Other} onChange={handleInputChange} />
              <TextareaField label="Description" name="Description" value={customerData.Description} onChange={handleInputChange} />
              <InputField className=" max-sm:hidden" label="Video" name="Video" value={customerData.Video} onChange={handleInputChange} />
              <InputField className=" max-sm:hidden" label="Google Map" name="GoogleMap" value={customerData.GoogleMap} onChange={handleInputChange} />
              <SingleSelect className=" max-sm:hidden" options={Array.isArray(fieldOptions?.Verified) ? fieldOptions.Verified : []} label="Verified" value={customerData.Verified} onChange={(v) => handleSelectChange("Verified", v)} />


            </div>
            <div className=" sm:flex flex-wrap my-5 gap-5">
              <FileUpload label="Customer Images" multiple previews={imagePreviews} onChange={(e) => handleFileChange(e, "CustomerImage")} onRemove={handleRemoveImage} />
              <FileUpload label="Site Plan" previews={sitePlanPreview ? [sitePlanPreview] : []} onChange={(e) => handleFileChange(e, "SitePlan")} onRemove={handleRemoveSitePlan} />
            </div>

            <div className="flex justify-end mt-4">

              <SaveButton text="Save" onClick={handleSubmit} />

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}






// File upload with preview and remove
const FileUpload: React.FC<{
  label: string;
  multiple?: boolean;
  previews?: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove?: (index: number) => void;
}> = ({ label, multiple, previews = [], onChange, onRemove }) => (
  <div className="flex flex-col">
    <label className="font-semibold text-gray-700 mb-2">{label}</label>
    <input
      type="file"
      multiple={multiple}
      onChange={onChange}
      className="border border-gray-300 rounded-md p-2"
    />
    {previews.length > 0 && (
      <div className="flex flex-wrap gap-3 mt-3">
        {previews.map((src, index) => (
          <div key={index} className="relative">
            <img
              src={src}
              alt={`preview-${index}`}
              className="w-24 h-24 object-cover rounded-md border"
            />
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-[-8px] right-[-8px] bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);