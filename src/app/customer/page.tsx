'use client'
import { useEffect, useMemo, useRef, useState } from "react";
import { CiExport, CiSearch } from "react-icons/ci";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { MdEdit, MdDelete, MdAdd, MdFavorite, MdFavoriteBorder, MdEmail } from "react-icons/md";
import Button from '@mui/material/Button';
import SingleSelect from "@/app/component/SingleSelect";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronsLeft, ChevronsRight, PlusSquare } from "lucide-react";
import ProtectedRoute from "../component/ProtectedRoutes";
import toast, { Toaster } from "react-hot-toast";
import { getCustomer, deleteCustomer, getFilteredCustomer, updateCustomer, assignCustomer, deleteAllCustomer } from "@/store/customer";
import { CustomerAdvInterface, customerAssignInterface, customerGetDataInterface, DeleteDialogDataInterface } from "@/store/customer.interface";
import DeleteDialog from "../component/popups/DeleteDialog";
import { getCampaign } from "@/store/masters/campaign/campaign";
import { getTypes, getTypesByCampaign } from "@/store/masters/types/types";
import { getCity } from "@/store/masters/city/city";
import { getLocation, getLocationByCity } from "@/store/masters/location/location";
import { handleFieldOptions } from "../utils/handleFieldOptions";
import PopupMenu from "../component/popups/PopupMenu";
import { getAllAdmins } from "@/store/auth";
import { usersGetDataInterface } from "@/store/auth.interface";
import { getSubtype, getSubtypeByCampaignAndType } from "@/store/masters/subtype/subtype";
import { mailAllCustomerInterface, mailGetDataInterface } from "@/store/masters/mail/mail.interface";
import { whatsappAllCustomerInterface, whatsappGetDataInterface } from "@/store/masters/whatsapp/whatsapp.interface";
import { emailAllCustomer, getMail } from "@/store/masters/mail/mail";
import { getWhatsapp, whatsappAllCustomer } from "@/store/masters/whatsapp/whatsapp";
import FavouriteDialog from "../component/popups/FavouriteDialog";
import AddButton from "../component/buttons/AddButton";
import PageHeader from "../component/labels/PageHeader";
import ListPopup from "../component/popups/ListPopup";
import LoaderCircle from "../component/LoaderCircle";
import useHorizontalScroll from "@/hooks/useHorizontalScroll";
import { Description } from "@radix-ui/react-dialog";
import LeadsSection from "../phonescreens/DashboardScreens/LeadsSection";
import CustomerTable from "../phonescreens/DashboardScreens/tables/CustomerTable";
import DynamicAdvance from "../phonescreens/DashboardScreens/DynamicAdvance";
import { handleFieldOptionsObject } from "../utils/handleFieldOptionsObject";
import ObjectSelect from "../component/ObjectSelect";
import { FaPhone, FaWhatsapp } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { exportToExcel } from "../utils/exportToExcel";


interface DeleteAllDialogDataInterface { }

export default function Customer() {
  const router = useRouter();
  const hasInitialFetched = useRef(false);
  /* fetch */
  const FETCH_CHUNK = 100;

  const [fetchedCount, setFetchedCount] = useState(0);
  const [hasMoreCustomers, setHasMoreCustomers] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalCustomerPage, setTotalCustomerPage] = useState(1)
  const [isFilteredTrigger, setIsFilteredTrigger] = useState(false);
  const lastAppliedFiltersRef = useRef<typeof filters | null>(null);


  /*NEW STATE FOR SELECTED CUSTOMERS */
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedUser, setSelectUser] = useState<string>();
  const [selectedWhatsapptemplate, setSelectedWhatsapptemplate] = useState<string>();
  const [selectedMailtemplate, setSelectedMailtemplate] = useState<string>();
  const [users, setUsers] = useState<usersGetDataInterface[]>([])

  const [mailTemplates, setMailtemplates] = useState<mailGetDataInterface[]>([])
  const [whatsappTemplates, setWhatsappTemplates] = useState<whatsappGetDataInterface[]>([])


  /*REST OF YOUR STATES (UNCHANGED) */
  const [toggleSearchDropdown, setToggleSearchDropdown] = useState(false);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isMailAllOpen, setIsMailAllOpen] = useState(false);
  const [isWhatsappAllOpen, setIsWhatsappAllOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [isFavouriteDialogOpen, setIsFavouriteDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState<DeleteDialogDataInterface | null>(null);
  const [dialogType, setDialogType] = useState<"delete" | "favourite" | null>(null);
  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});
  const [isFavrouteCustomer, setIsFavrouteCustomer] = useState<boolean>(false);
  const [customerTableLoader, setCustomerTableLoader] = useState(true);
  const [deleteAllDialogData, setDeleteAllDialogData] =
    useState<DeleteAllDialogDataInterface | null>(null);
  const scrollRef = useHorizontalScroll();
  const searchParams = useSearchParams();
  const { admin } = useAuth();

  const [rowsPerTablePage, setRowsPerTablePage] = useState(10);
  const [filters, setFilters] = useState({
    StatusAssign: [] as string[],
    Campaign: [] as string[],
    CustomerType: [] as string[],
    CustomerSubType: [] as string[],
    City: [] as string[],
    Location: [] as string[],
    User: [] as string[],
    Keyword: "" as string,
    Limit: ["100"] as string[],
  });

  const [dependent, setDependent] = useState({
    Campaign: { id: "", name: "" },
    CustomerType: { id: "", name: "" },
    CustomerSubType: { id: "", name: "" },
    City: { id: "", name: "" },
    Location: { id: "", name: "" },
  });


  const [customerData, setCustomerData] = useState<customerGetDataInterface[]>([]);
  const [customerAdv, setCustomerAdv] = useState<CustomerAdvInterface[]>([]);
  const [exportingCustomerData, setExportingCustomerData] = useState<customerGetDataInterface[]>([]);



  useEffect(() => {
    const status = searchParams.get("Campaign");
    if (!fieldOptions?.Campaign?.length) return;

    if (status) {

      const campaignObj = fieldOptions?.Campaign?.find(
        (c) => c.Name === status
      );
      // Auto set filter
      setFilters((prev) => ({
        ...prev,
        StatusAssign: [status],
      }));
      setDependent((prev) => ({
        ...prev,
        Campaign: { id: campaignObj?._id, name: campaignObj?.Name }
      }))

      const updatedFilters = {
        ...filters,
        Campaign: [status],
      };

      setCustomerTableLoader(false);

      // Fetch filtered data
      handleSelectChange("Campaign", status, updatedFilters);
    }
    else {
      getCustomers();
      fetchFields();
    }
    getTotalCustomerPage();
  }, [searchParams, fieldOptions.Campaign]);


  useEffect(() => {
    const datatoExport = customerData.filter((customer) => selectedCustomers.includes(customer._id));
    setExportingCustomerData(datatoExport);
  }, [selectedCustomers]);

  const getTotalCustomerPage = async () => {
    const data = await getCustomer();
    const total = Math.ceil(data.length / Number(filters.Limit[0])) || 1
    setTotalCustomerPage(total);
    setTotalCustomers(data.length);
  }


  useEffect(() => {
    const total = Math.ceil(totalCustomers / Number(filters.Limit[0])) || 1
    setTotalCustomerPage(total);
  }, [filters, totalCustomers]);


  function getPlainTextFromHTML(htmlString: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    return doc.body.textContent || "";
  }

  const getCustomers = async () => {
    setCustomerTableLoader(true);
    setFetchedCount(0);
    setHasMoreCustomers(true);

    const queryParams = new URLSearchParams();
    queryParams.append("Limit", FETCH_CHUNK.toString());
    queryParams.append("Skip", "0");

    const data = await getFilteredCustomer(queryParams.toString());

    if (data) {
      const mapped = data.map(mapCustomer);
      setCustomerData(mapped);
      setFetchedCount(mapped.length);
      setHasMoreCustomers(mapped.length === FETCH_CHUNK);
    }

    setCustomerTableLoader(false);
  };


  const mapCustomer = (item: any) => {
    const date = new Date(item.createdAt);
    const formattedDate =
      date.getDate().toString().padStart(2, "0") + "-" +
      (date.getMonth() + 1).toString().padStart(2, "0") + "-" +
      date.getFullYear();

    return {
      _id: item._id,
      Campaign: item.Campaign,
      Type: item.CustomerType,
      SubType: item.CustomerSubType,
      Name: item.customerName,
      Description: item.Description,
      Email: item.Email,
      City: item.City,
      Location: item.Location,
      ContactNumber: item.ContactNumber?.slice(0, 10),
      AssignTo: item.AssignTo?.name,
      isFavourite: item.isFavourite,
      Date: item.date ?? formattedDate,
      SitePlan: item.SitePlan || "",
    };
  };


  const fetchMore = async () => {
    if (isFetchingMore || !hasMoreCustomers) return;

    setIsFetchingMore(true);
    setCustomerTableLoader(true);

    const queryParams = new URLSearchParams();
    queryParams.append("Limit", FETCH_CHUNK.toString());
    queryParams.append("Skip", customerData.length.toString());

    Object.entries(filters).forEach(([key, value]) => {
      if (key === "Limit") return;
      if (Array.isArray(value)) value.forEach(v => queryParams.append(key, v));
      if (typeof value === "string" && value) queryParams.append(key, value);
    });

    const data = await getFilteredCustomer(queryParams.toString());

    if (data) {
      const mapped = data.map(mapCustomer);
      setCustomerData(prev => [...prev, ...mapped]);
      setFetchedCount(prev => prev + mapped.length);
      setHasMoreCustomers(mapped.length === FETCH_CHUNK);
    }

    setCustomerTableLoader(false);
    setIsFetchingMore(false);
  };


  const handleLastPage = async () => {
    setCustomerTableLoader(true);

    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (key === "Limit") return;
      if (Array.isArray(value)) value.forEach(v => queryParams.append(key, v));
      if (typeof value === "string" && value) queryParams.append(key, value);
    });

    // Fetch all rows at once by not limiting
    queryParams.delete("Limit");
    queryParams.delete("Skip");

    const data = await getFilteredCustomer(queryParams.toString());
    if (data) {
      const mapped = data.map(mapCustomer);
      setCustomerData(mapped);
      setFetchedCount(mapped.length);
      setHasMoreCustomers(false); // all loaded
      setTotalCustomers(mapped.length);
      // calculate last page using the freshly fetched data
      const finalTotalPages = Math.ceil(mapped.length / rowsPerTablePage) || 1;
      setCurrentTablePage(finalTotalPages); // jump to last page
    }

    setCustomerTableLoader(false);
  };





  const handleDelete = async (data: DeleteDialogDataInterface | null) => {
    if (!data) return;
    const response = await deleteCustomer(data.id);
    if (response) {
      toast.success(`Customer deleted successfully`);
      setIsDeleteDialogOpen(false);
      setDialogData(null);
      if (isFilteredTrigger) {
        await refreshCustomersWithLastFilters();
        return;
      }
      await getCustomers();
    }
  };

  const handleFavourite = async (data: DeleteDialogDataInterface | null) => {
    if (!data) return;
    const formData = new FormData();
    const current = customerData.find(c => c._id === data.id);
    const newFav = !current?.isFavourite;
    formData.append("isFavourite", newFav.toString());

    const res = await updateCustomer(data.id, formData);
    if (res) {
      toast.success("Favourite updated successfully");
      setIsFavouriteDialogOpen(false);
      setDialogData(null);
      await getCustomers();
    } else {
      toast.error("Failed to update favourite");
    }
  };

  const handleFavouriteToggle = (id: string, name: string, number: string, isFavourite: boolean) => {
    setDialogType("favourite");
    setIsFavouriteDialogOpen(true);
    setDialogData({
      id,
      customerName: name,
      ContactNumber: number
    });
    setIsFavrouteCustomer(isFavourite);
  };

  const handleSelectChange = async (field: keyof typeof filters, selected: string | string[], filtersOverride?: typeof filters) => {
    setCustomerTableLoader(true);
    const updatedFilters = filtersOverride || {
      ...filters,
      [field]: Array.isArray(selected)
        ? selected
        : selected
          ? [selected]
          : [],
    };
    setFilters(updatedFilters);
    lastAppliedFiltersRef.current = updatedFilters;
    setIsFilteredTrigger(true);

    const queryParams = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (key === "Limit") return;
      if (Array.isArray(value) && value.length > 0) {
        value.forEach((v) => queryParams.append(key, v));
      } else if (typeof value === "string" && value) {
        queryParams.append(key, value);
      }
    });



    queryParams.append("Limit", FETCH_CHUNK.toString());
    queryParams.append("Skip", "0");

    const data = await getFilteredCustomer(queryParams.toString());
    const totalQueryParams = new URLSearchParams(queryParams);
    totalQueryParams.delete("Limit");
    totalQueryParams.delete("Skip");



    if (data) {
      const mapped = data.map(mapCustomer);
      setCustomerData(mapped);
      setFetchedCount(mapped.length);
      setHasMoreCustomers(mapped.length === FETCH_CHUNK);
      setCurrentTablePage(1);
    }

    const totalfilteredData = await getFilteredCustomer(
      totalQueryParams.toString()
    );

    if (totalfilteredData) {
      setTotalCustomers(totalfilteredData.length);
    }

    setCustomerTableLoader(false);

  };

  const clearFilter = async () => {
    setFilters({
      StatusAssign: [],
      Campaign: [],
      CustomerType: [],
      CustomerSubType: [],
      City: [],
      Location: [],
      User: [],
      Keyword: "",
      Limit: ["10"],
    });
    setDependent({
      Campaign: { id: "", name: "" },
      CustomerType: { id: "", name: "" },
      CustomerSubType: { id: "", name: "" },
      City: { id: "", name: "" },
      Location: { id: "", name: "" },
    })
    setIsFilteredTrigger(false);
    await getCustomers();
  };

  const refreshCustomersWithLastFilters = async () => {
    const appliedFilters = lastAppliedFiltersRef.current;

    if (!appliedFilters) return;

    setCustomerTableLoader(true);

    const queryParams = new URLSearchParams();
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (key === "Limit") return;
      if (Array.isArray(value) && value.length > 0) {
        value.forEach((v) => queryParams.append(key, v));
      } else if (typeof value === "string" && value) {
        queryParams.append(key, value);
      }
    });

    queryParams.append("Limit", FETCH_CHUNK.toString());
    queryParams.append("Skip", "0");

    const data = await getFilteredCustomer(queryParams.toString());

    if (data) {
      const mapped = data.map(mapCustomer);
      setCustomerData(mapped);
      setFetchedCount(mapped.length);
      setHasMoreCustomers(mapped.length === FETCH_CHUNK);
      setCurrentTablePage(1);
    }

    setCustomerTableLoader(false);
  };


  const totalTablePages = useMemo(() => {
    return Math.ceil(customerData.length / rowsPerTablePage) || 1;
  }, [customerData, rowsPerTablePage]);

  const startIndex = (currentTablePage - 1) * rowsPerTablePage;
  const currentRows = customerData.slice(startIndex, startIndex + rowsPerTablePage);


  useEffect(() => {
    const safeLimit = Number(filters.Limit?.[0]);
    setRowsPerTablePage(safeLimit);
    setCurrentTablePage(1);
  }, [filters.Limit]);


  const nexttablePage = () => {
    if (currentTablePage !== totalTablePages)
      setCurrentTablePage(currentTablePage + 1);
  };
  const prevtablePage = () => {
    if (currentTablePage !== 1) setCurrentTablePage(currentTablePage - 1);
  };

  const [filterOptions, setFilterOptions] = useState({
    StatusAssign: [] as string[],
    Campaign: [],
    CustomerType: [],
    CustomerSubtype: [],
    City: [],
    Location: [],
    User: [] as string[],
  });

  const fetchUsers = async () => {
    const response = await getAllAdmins();

    if (response) {
      console.log("response ", response);

      const admins = response?.admins?.filter((e) => e.role === "user" || e.role === "city_admin") ?? []; //ensure only user and city_admin roles are fetched

      setUsers(
        admins.map((item: any): usersGetDataInterface => ({
          _id: item?._id ?? "",
          name: item?.name ?? "",
        }))
      );

      return;
    }
  };

  const fetchEmailTemplates = async () => {
    const response = await getMail();

    if (response) {
      console.log("response ", response);

      const mailtemplates = response?.filter((e: any) => e.status === "Active") ?? []; //ensure only user roles are fetched
      console.log(" mail data ", response)
      setMailtemplates(
        mailtemplates.map((item: any): mailGetDataInterface => ({
          _id: item?._id ?? "",
          name: item?.name ?? "",
          body: getPlainTextFromHTML(item?.body) ?? ""
        }))
      );

      return;
    }
  };

  const fetchWhatsappTemplates = async () => {
    const response = await getWhatsapp();

    if (response) {
      console.log("response ", response);

      const whatsapptemplates = response?.filter((e: any) => e.status === "Active") ?? []; //ensure only active status are fetched
      console.log(" mail data ", response)
      setWhatsappTemplates(
        whatsapptemplates.map((item: any): whatsappGetDataInterface => ({
          _id: item?._id ?? "",
          name: item?.name ?? "",
          body: item?.body ?? ""
        }))
      );

      return;
    }
  };


  const handleDeleteAll = async () => {
    if (customerData.length === 0) return;
    const payload = {
      customerIds: [...selectedCustomers]
    }
    const response = await deleteAllCustomer(payload);
    if (response) {
      toast.success(`All contacts deleted`);
      setIsDeleteAllDialogOpen(false);
      setDeleteAllDialogData(null);
      setSelectedCustomers([]);
      if (isFilteredTrigger) {
        await refreshCustomersWithLastFilters();
        return;
      }
      getCustomers();


    }
  };


  //Fetch dropdown data
  const fetchFields = async () => {
    /*     await handleFieldOptions(
          [
            { key: "StatusAssign", staticData: ["Assigned", "Unassigned"] },
            { key: "Campaign", fetchFn: getCampaign },
            { key: "CustomerType", fetchFn: getTypes },
            { key: "CustomerSubtype", fetchFn: getSubtype },
            { key: "City", fetchFn: getCity },
            { key: "Location", fetchFn: getLocation },
            { key: "User", fetchFn: getAllAdmins },
          ],
          setFieldOptions
        ); */
  };

  // Object-based fields (for ObjectSelect)
  const objectFields = [
    { key: "Campaign", fetchFn: getCampaign },
    { key: "CustomerType", staticData: [] },
    { key: "CustomerSubtype", staticData: [] },
    { key: "City", fetchFn: getCity },
    { key: "Location", staticData: [] } // dependent

  ];

  // Simple array fields (for normal Select)
  const arrayFields = [
    { key: "StatusAssign", staticData: ["Assigned", "Unassigned"] },
    { key: "User", fetchFn: getAllAdmins },
  ];


  useEffect(() => {
    const loadFieldOptions = async () => {
      await handleFieldOptionsObject(objectFields, setFieldOptions);
      await handleFieldOptions(arrayFields, setFieldOptions);
    };
    loadFieldOptions();
  }, []);


  // Run this whenever parent filter changes
  useEffect(() => {
    const campaignId = dependent.Campaign.id;
    const customerTypeId = dependent.CustomerType.id;
    const cityId = dependent.City.id;

    if (campaignId) {
      fetchCustomerType(campaignId);
    } else {
      setFieldOptions(prev => ({ ...prev, CustomerType: [] }));
      setFilters(prev => ({ ...prev, CustomerType: [], CustomerSubType: [] }));
    }

    if (campaignId && customerTypeId) {
      fetchCustomerSubType(campaignId, customerTypeId);
    } else {
      setFieldOptions(prev => ({ ...prev, CustomerSubType: [] }));
      setFilters(prev => ({ ...prev, CustomerSubType: [] }));
    }

    if (cityId) {
      fetchLocation(cityId);
    } else {
      setFieldOptions(prev => ({ ...prev, Location: [] }));
      setFilters(prev => ({ ...prev, Location: [] }));
    }

  }, [dependent.Campaign.id, dependent.CustomerType.id, dependent.City.id]);


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


  const fetchCustomerSubType = async (campaignId: string, customertypeId: string) => {
    try {
      const res = await getSubtypeByCampaignAndType(campaignId, customertypeId);
      setFieldOptions((prev) => ({ ...prev, CustomerSubtype: res || [] }));
    } catch (error) {
      console.error("Error fetching types:", error);
      setFieldOptions((prev) => ({ ...prev, CustomerSubtype: [] }));
    }
  };



  /* SELECT ALL HANDLER */
  const handleSelectAll = () => {
    const allIds = currentRows.map((c) => c._id);
    setSelectedCustomers((prev) =>
      allIds.every((id) => prev.includes(id))
        ? prev.filter((id) => !allIds.includes(id)) // unselect all
        : [...new Set([...prev, ...allIds])] // select all visible rows
    );
  };

  /* ✅ SELECT SINGLE ROW HANDLER */
  const handleSelectRow = (id: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(id)
        ? prev.filter((cid) => cid !== id)
        : [...prev, id]
    );
  };

  const handleSelectUser = (id: string) => {
    setSelectUser(prev => (prev === id ? undefined : id)); //  only one user at a time
  };

  const handleSelectMailtemplate = (id: string) => {
    setSelectedMailtemplate(prev => (prev === id ? undefined : id)); //  only one user at a time
  };

  const handleSelectWhatsapptemplate = (id: string) => {
    setSelectedWhatsapptemplate(prev => (prev === id ? undefined : id)); // only one user at a time
  };


  const handleAssignto = async () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    const payload: customerAssignInterface = {
      customerIds: selectedCustomers,
      assignToId: selectedUser,
    };

    console.log(payload)

    const response = await assignCustomer(payload);
    if (response) {
      toast.success(" customers assigned succesfully")
      await getCustomers();
      setIsAssignOpen(false);
      return response
    }
    toast.error("failed to assign customers")
    setIsAssignOpen(false)
  };

  const handleMailAll = async () => {
    if (!selectedMailtemplate) {
      toast.error("Please select a template");
      return;
    }

    const payload: mailAllCustomerInterface = {
      customerIds: selectedCustomers,
      templateId: selectedMailtemplate,
    };

    console.log(payload)

    const response = await emailAllCustomer(payload);
    if (response) {
      toast.success("Email customers succesfully")
      setIsMailAllOpen(false);
      return response
    }
    toast.error("failed to email customers")
    setIsMailAllOpen(false);
  };

  const handleWhatsappAll = async () => {
    if (!selectedWhatsapptemplate) {
      toast.error("Please select a template");
      return;
    }

    const payload: whatsappAllCustomerInterface = {
      customerIds: selectedCustomers,
      templateId: selectedWhatsapptemplate,
    };

    console.log(payload)

    const response = await whatsappAllCustomer(payload);
    if (response) {
      toast.success("Whatsapp customers succesfully")
      setIsWhatsappAllOpen(false);
      return response
    }
    toast.error("failed to whatsapp customers")
    setIsWhatsappAllOpen(false);
  };


  const phonetableheader = [{
    key: "Campaign", label: "Campaign"
  },
  {
    key: "Name", label: "Name"
  },
  {
    key: "Location", label: "Location"
  },
  {
    key: "Description", label: "Description"
  },
  {
    key: "ContactNumber", label: "Ph. No."
  }]

  const phoneViewAllHaders = [
    {
      key: "Campaign", label: "Campaign"
    },
    {
      key: "Type", label: "Customer Type"
    },
    {
      key: "SubType", label: "Customer Subtype"
    },
    {
      key: "Name", label: "Name"
    },
    {
      key: "Location", label: "Location"
    },
    {
      key: "Description", label: "Description"
    },
    {
      key: "ContactNumber", label: "Contact No"
    },
    {
      key: "AssignTo", label: "Assign To"
    },
    {
      key: "Date", label: "Date"
    }
  ]

  const addFollowup = (id: string) => router.push(`/followups/customer/add/${id}`);

  return (
    <ProtectedRoute>
      {/* whatsapp all popup */}
      <Toaster position="top-right" />
      {isWhatsappAllOpen && selectedCustomers.length > 0 && (
        <ListPopup
          title="Whatsapp Customers"
          list={whatsappTemplates}
          selected={selectedWhatsapptemplate}
          onSelect={handleSelectWhatsapptemplate}
          onSubmit={handleWhatsappAll}
          submitLabel="Whatsapp"
          onClose={() => {
            setSelectedCustomers([]);
            setIsWhatsappAllOpen(false)
          }}
        />
      )}
      {/* mail all popup */}
      {isMailAllOpen && selectedCustomers.length > 0 && (
        <ListPopup
          title="Mail Customers"
          list={mailTemplates}
          selected={selectedMailtemplate}
          onSelect={handleSelectMailtemplate}
          onSubmit={handleMailAll}
          submitLabel="Mail"
          onClose={() => {
            setSelectedCustomers([]);
            setIsMailAllOpen(false)
          }}
        />
      )}

      {/* Favourite Dialog */}
      <FavouriteDialog<DeleteDialogDataInterface>
        isOpen={isFavouriteDialogOpen}
        title={`Are you sure you want to ${isFavrouteCustomer ? "unfavourite" : "favourite"} this customer?`}
        data={dialogData}
        onClose={() => {
          setIsFavouriteDialogOpen(false);
          setDialogData(null);
        }}
        onDelete={handleFavourite}
      />

      {/* Mobile Customer Page */}
      <div className=" sm:hidden min-h-[calc(100vh-56px)] overflow-auto max-sm:py-2">

        <div className=" flex justify-between items-center px-0">
          <h1 className=" text-[var(--color-primary)] font-extrabold text-2xl ">Leads</h1>

        </div>
        <div className=" w-full">
          <DynamicAdvance>
            <ObjectSelect
              options={Array.isArray(fieldOptions?.Campaign) ? fieldOptions.Campaign : []}
              label="Campaign"
              value={dependent.Campaign.id}
              getLabel={(item) => item?.Name || ""}
              getId={(item) => item?._id || ""}
              onChange={(selectedId) => {
                const selectedObj = fieldOptions.Campaign.find((i) => i._id === selectedId);
                if (selectedObj) {
                  const updatedFilters = {
                    ...filters,
                    Campaign: [selectedObj.Name],
                    CustomerType: [],   // reset
                    CustomerSubType: []
                  };
                  setFilters(updatedFilters);

                  setDependent(prev => ({
                    ...prev,
                    Campaign: { id: selectedObj._id, name: selectedObj.Name },
                    CustomerType: { id: "", name: "" },   // reset
                    CustomerSubType: { id: "", name: "" }
                  }));
                  handleSelectChange("Campaign", selectedObj.Name, updatedFilters)
                }
              }}
            />

            <ObjectSelect
              options={Array.isArray(fieldOptions?.CustomerType) ? fieldOptions.CustomerType : []}
              label="Customer Type"
              value={dependent.CustomerType.name}
              getLabel={(item) => item?.Name || ""}
              getId={(item) => item?._id || ""}
              onChange={(selectedId) => {
                const selectedObj = fieldOptions.CustomerType.find((i) => i._id === selectedId);
                if (selectedObj) {
                  const updatedFilters = {
                    ...filters,
                    CustomerType: [selectedObj.Name],   // reset
                    CustomerSubType: []
                  };
                  setFilters(updatedFilters);


                  setDependent(prev => ({
                    ...prev,
                    CustomerType: { id: selectedObj._id, name: selectedObj.Name },   // reset
                    CustomerSubType: { id: "", name: "" }
                  }));
                  handleSelectChange("CustomerType", selectedObj.Name, updatedFilters)
                }
              }}

            />

            <ObjectSelect
              options={Array.isArray(fieldOptions?.CustomerSubtype) ? fieldOptions.CustomerSubtype : []}
              label="Customer Subtype"
              value={dependent.CustomerSubType.name}
              getLabel={(item) => item?.Name || ""}
              getId={(item) => item?._id || ""}
              onChange={(selectedId) => {

                const selectedObj = fieldOptions.CustomerSubtype.find((i) => i._id === selectedId);
                if (selectedObj) {
                  const updatedFilters = {
                    ...filters,
                    CustomerSubType: [selectedObj.Name]
                  };
                  setFilters(updatedFilters);

                  setDependent(prev => ({
                    ...prev,
                    CustomerSubType: { id: selectedObj._id, name: selectedObj.Name }
                  }));
                  handleSelectChange("CustomerSubType", selectedObj.Name, updatedFilters)
                }
              }}
            />


            <ObjectSelect
              options={Array.isArray(fieldOptions?.City) ? fieldOptions.City : []}
              label="City"
              value={dependent.City.id}
              getLabel={(item) => item?.Name || ""}
              getId={(item) => item?._id || ""}
              onChange={(selectedId) => {
                const selectedObj = fieldOptions.City.find((i) => i._id === selectedId);
                if (selectedObj) {
                  const updatedFilters = {
                    ...filters,
                    City: [selectedObj.Name],
                    Location: []
                  };
                  setFilters(updatedFilters);

                  setDependent(prev => ({
                    ...prev,
                    City: { id: selectedObj._id, name: selectedObj.Name },
                    Location: { id: "", name: "" },
                  }));
                  handleSelectChange("City", selectedObj.Name, updatedFilters)
                }
              }}
            />
            <ObjectSelect
              options={Array.isArray(fieldOptions?.Location) ? fieldOptions.Location : []}
              label="Location"
              value={dependent.Location.id}
              getLabel={(item) => item?.Name || ""}
              getId={(item) => item?._id || ""}
              onChange={(selectedId) => {
                const selectedObj = fieldOptions.Location.find((i) => i._id === selectedId);
                if (selectedObj) {
                  const updatedFilters = {
                    ...filters,
                    Location: [selectedObj.Name]
                  };
                  setFilters(updatedFilters);

                  setDependent(prev => ({
                    ...prev,
                    Location: { id: selectedObj._id, name: selectedObj.Name },
                  }));
                  handleSelectChange("Location", selectedObj.Name, updatedFilters)
                }
              }}
            />


            <SingleSelect options={Array.isArray(fieldOptions?.User) ? fieldOptions.User : []} value={filters.User[0]} label="User" onChange={(v) => handleSelectChange("User", v)} isSearchable />
            <div className=" w-full flex justify-end">
              <button type="reset" onClick={clearFilter} className="text-red-500 cursor-pointer hover:underline text-sm px-5 py-2 rounded-md">
                Clear Search
              </button>
            </div>

          </DynamicAdvance>
        </div>
        <CustomerTable
          leads={customerData}
          labelLeads={phonetableheader}
          allLabelLeads={phoneViewAllHaders}
          onAdd={(id) => addFollowup(id)}
          onEdit={(id) => router.push(`/customer/edit/${id}`)}
          onWhatsappClick={(lead) => {
            setSelectedCustomers([lead._id]);
            setIsWhatsappAllOpen(true);
            fetchWhatsappTemplates();
          }}
          onMailClick={(lead) => {
            setSelectedCustomers([lead._id]);
            setIsMailAllOpen(true);
            fetchEmailTemplates();
          }}
          onFavourite={(lead) => {
            handleFavouriteToggle(lead._id, lead.Name, lead.ContactNumber, lead.isFavourite ?? false)
          }}
          loader={customerTableLoader}
          hasMoreCustomers={hasMoreCustomers}
          fetchMore={fetchMore}
        />

      </div>

      {/* Desktop Customer page */}
      <div className=" min-h-[calc(100vh-56px)] max-sm:hidden overflow-auto max-md:py-10">


        {/* Delete Dialog */}
        <DeleteDialog<DeleteDialogDataInterface>
          isOpen={isDeleteDialogOpen}
          title="Are you sure you want to delete this customer?"
          data={dialogData}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setDialogData(null);
          }}
          onDelete={handleDelete}
        />

        <DeleteDialog<DeleteAllDialogDataInterface>
          isOpen={isDeleteAllDialogOpen}
          title="Are you sure you want to delete ALL customers?"
          data={deleteAllDialogData}
          onClose={() => {
            setIsDeleteAllDialogOpen(false);
            setDeleteAllDialogData(null);
          }}
          onDelete={handleDeleteAll}
        />



        {/* Assign User Popup */}
        {isAssignOpen && selectedCustomers.length > 0 && (
          <ListPopup
            title="Assign Customers"
            list={users}
            selected={selectedUser}
            onSelect={handleSelectUser}
            onSubmit={handleAssignto}
            submitLabel="Assign"
            onClose={() => setIsAssignOpen(false)}
          />
        )}


        {/* ---------- TABLE START ---------- */}

        <div className="p-4 max-md:p-3 w-full rounded-md bg-white max-[450px]:hidden">
          <div className="flex justify-between items-center p-2">
            <PageHeader title="Dashboard" subtitles={["Customer"]} />
            <div className=" flex items-center gap-4">
              {
                admin?.role === "administrator" && <button className=" flex justify-center items-center gap-1 hover:bg-[var(--color-primary-light)] cursor-pointer text-[var(--color-primary)] text-sm bg-[var(--color-primary-lighter)] px-2 py-1 rounded-sm " onClick={() => {
                  if (selectedCustomers.length === 0) {
                    toast.error("Please select at least one customer to export")
                    return
                  }
                  exportToExcel(exportingCustomerData, "customer_list")
                }}>
                  <CiExport /> Export
                </button>
              }
              <AddButton
                url="/customer/add"
                text="Add"
                icon={<PlusSquare size={18} />}
              />
            </div>


          </div>


          {/* TABLE */}
          <section className="flex flex-col mt-6 p-2 rounded-md">
            <div className="m-5 relative ">

              <div className="flex justify-between cursor-pointer items-center py-1 px-2 border border-gray-800 rounded-md" onClick={() => setToggleSearchDropdown(!toggleSearchDropdown)}>
                <h3 className="flex items-center gap-1"><CiSearch />Advance Search</h3>
                <button
                  type="button"

                  className="p-2 hover:bg-gray-200 rounded-md cursor-pointer"
                >
                  {toggleSearchDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </button>
              </div>

              <div className={`overflow-hidden ${toggleSearchDropdown ? "overflow-visible max-h-[2000px]" : "overflow-hidden max-h-0"} transition-all duration-500 ease-in-out px-5`}>
                <div className="flex flex-col gap-5 my-5">
                  <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1 max-lg:grid-cols-2">
                    <ObjectSelect
                      options={Array.isArray(fieldOptions?.Campaign) ? fieldOptions.Campaign : []}
                      label="Campaign"
                      value={dependent.Campaign.id}
                      getLabel={(item) => item?.Name || ""}
                      getId={(item) => item?._id || ""}
                      onChange={(selectedId) => {
                        const selectedObj = fieldOptions.Campaign.find((i) => i._id === selectedId);
                        if (selectedObj) {
                          const updatedFilters = {
                            ...filters,
                            Campaign: [selectedObj.Name],
                            CustomerType: [],   // reset
                            CustomerSubType: []
                          };
                          setFilters(updatedFilters);

                          setDependent(prev => ({
                            ...prev,
                            Campaign: { id: selectedObj._id, name: selectedObj.Name },
                            CustomerType: { id: "", name: "" },   // reset
                            CustomerSubType: { id: "", name: "" }
                          }));
                          handleSelectChange("Campaign", selectedObj.Name, updatedFilters)
                        }
                      }}
                    />

                    <ObjectSelect
                      options={Array.isArray(fieldOptions?.CustomerType) ? fieldOptions.CustomerType : []}
                      label="Customer Type"
                      value={dependent.CustomerType.name}
                      getLabel={(item) => item?.Name || ""}
                      getId={(item) => item?._id || ""}
                      onChange={(selectedId) => {
                        const selectedObj = fieldOptions.CustomerType.find((i) => i._id === selectedId);
                        if (selectedObj) {
                          const updatedFilters = {
                            ...filters,
                            CustomerType: [selectedObj.Name],   // reset
                            CustomerSubType: []
                          };
                          setFilters(updatedFilters);


                          setDependent(prev => ({
                            ...prev,
                            CustomerType: { id: selectedObj._id, name: selectedObj.Name },   // reset
                            CustomerSubType: { id: "", name: "" }
                          }));
                          handleSelectChange("CustomerType", selectedObj.Name, updatedFilters)
                        }
                      }}

                    />

                    <ObjectSelect
                      options={Array.isArray(fieldOptions?.CustomerSubtype) ? fieldOptions.CustomerSubtype : []}
                      label="Customer Subtype"
                      value={dependent.CustomerSubType.name}
                      getLabel={(item) => item?.Name || ""}
                      getId={(item) => item?._id || ""}
                      onChange={(selectedId) => {

                        const selectedObj = fieldOptions.CustomerSubtype.find((i) => i._id === selectedId);
                        if (selectedObj) {
                          const updatedFilters = {
                            ...filters,
                            CustomerSubType: [selectedObj.Name]
                          };
                          setFilters(updatedFilters);

                          setDependent(prev => ({
                            ...prev,
                            CustomerSubType: { id: selectedObj._id, name: selectedObj.Name }
                          }));
                          handleSelectChange("CustomerSubType", selectedObj.Name, updatedFilters)
                        }
                      }}
                    />


                    <ObjectSelect
                      options={Array.isArray(fieldOptions?.City) ? fieldOptions.City : []}
                      label="City"
                      value={dependent.City.id}
                      getLabel={(item) => item?.Name || ""}
                      getId={(item) => item?._id || ""}
                      onChange={(selectedId) => {
                        const selectedObj = fieldOptions.City.find((i) => i._id === selectedId);
                        if (selectedObj) {
                          const updatedFilters = {
                            ...filters,
                            City: [selectedObj.Name],
                            Location: []
                          };
                          setFilters(updatedFilters);

                          setDependent(prev => ({
                            ...prev,
                            City: { id: selectedObj._id, name: selectedObj.Name },
                            Location: { id: "", name: "" },
                          }));
                          handleSelectChange("City", selectedObj.Name, updatedFilters)
                        }
                      }}
                    />
                    <ObjectSelect
                      options={Array.isArray(fieldOptions?.Location) ? fieldOptions.Location : []}
                      label="Location"
                      value={dependent.Location.id}
                      getLabel={(item) => item?.Name || ""}
                      getId={(item) => item?._id || ""}
                      onChange={(selectedId) => {
                        const selectedObj = fieldOptions.Location.find((i) => i._id === selectedId);
                        if (selectedObj) {
                          const updatedFilters = {
                            ...filters,
                            Location: [selectedObj.Name]
                          };
                          setFilters(updatedFilters);

                          setDependent(prev => ({
                            ...prev,
                            Location: { id: selectedObj._id, name: selectedObj.Name },
                          }));
                          handleSelectChange("Location", selectedObj.Name, updatedFilters)
                        }
                      }}
                      isSearchable
                    />

                    <SingleSelect options={Array.isArray(fieldOptions?.User) ? fieldOptions.User : []} value={filters.User[0]} label="User" onChange={(v) => handleSelectChange("User", v)} isSearchable />

                    <SingleSelect options={["10", "25", "50", "100"]} value={filters.Limit[0]} label="Limit" onChange={(v) => {

                      handleSelectChange("Limit", v)
                    }} />

                  </div>


                </div>

                {/* Keyword Search */}
                <form className="flex flex-wrap max-md:flex-col justify-between items-center mb-5">
                  <div className="min-w-[80%]">
                    <label className="block mb-2 text-sm font-medium text-[var(--color-secondary-darker)]">AI Genie</label>
                    <input
                      type="text"
                      placeholder="type text here.."
                      className="border border-gray-300 rounded-md px-3 py-2 outline-none w-full"
                      value={filters.Keyword}
                      onChange={(e) => handleSelectChange("Keyword", e.target.value)}
                    />
                  </div>

                  <div className="flex justify-center items-center">
                    <button type="submit" className="border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300 cursor-pointer px-3 py-2 mt-6 rounded-md">
                      Explore
                    </button>
                    <button type="reset" onClick={clearFilter} className="text-red-500 cursor-pointer hover:underline text-sm px-5 py-2 mt-6 rounded-md ml-3">
                      Clear Search
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div className=" overflow-auto relative" ref={scrollRef}>
              <div className=" flex justify-between items-center sticky top-0 left-0 w-full">
                <div className="flex gap-10 items-center px-3 py-4 min-w-max text-gray-700">

                  <label htmlFor="selectall" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer">
                    <div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
                    <span className="relative">Select All</span>
                  </label>
                  <button type="button" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer" onClick={() => {
                    if (selectedCustomers.length <= 0) toast.error("please select atleast 1 customer")
                    else {
                      setIsAssignOpen(true);
                      fetchUsers()
                    } 0
                  }}><div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
                    <span className="relative">Asign To</span></button>
                  <button type="button" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer" onClick={() => {
                    if (selectedCustomers.length <= 0) toast.error("please select atleast 1 customer")
                    else {
                      setIsMailAllOpen(true);
                      fetchEmailTemplates()
                    }
                  }}><div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
                    <span className="relative">Email All</span></button>
                  <button type="button" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer" onClick={() => {
                    if (selectedCustomers.length <= 0) toast.error("please select atleast 1 customer")
                    else {
                      setIsWhatsappAllOpen(true);
                      fetchWhatsappTemplates()
                    }
                  }}><div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
                    <span className="relative">SMS All</span></button>
                  {/*                 <button type="button" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer">
                  <div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
                  <span className="relative ">Mass Update</span>
                </button> */}
                  {
                    admin?.role !== "user" && <button type="button" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer" onClick={() => {
                      if (customerData.length > 0) {
                        if (selectedCustomers.length < 1) {
                          const firstPageIds = currentRows.map((c) => c._id);
                          setSelectedCustomers(firstPageIds);
                        }

                        setIsDeleteAllDialogOpen(true);
                        setDeleteAllDialogData({});
                      }
                    }}><div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
                      <span className="relative ">Delete All</span>
                    </button>
                  }

                </div>
                {selectedCustomers.length > 0 && <p className=" text-gray-400 font-extralight text-sm">selected {selectedCustomers.length}</p>}
              </div>
              <div className=" max-h-[600px] overflow-y-auto">
                <table className="table-auto relative w-full border-separate border-spacing-0 text-sm border border-gray-200">
                  <thead className="bg-[var(--color-primary)] text-white sticky top-0 left-0 z-[5]">
                    <tr>

                      {/* ✅ SELECT ALL CHECKBOX COLUMN */}
                      <th className="px-2 py-3 border border-[var(--color-secondary-dark)] text-left">

                        <input
                          id="selectall"
                          type="checkbox"
                          className=" hidden"
                          checked={
                            currentRows.length > 0 &&
                            currentRows.every((r) => selectedCustomers.includes(r._id))
                          }
                          onChange={handleSelectAll}
                        />
                      </th>

                      <th className="px-2 py-3 border border-[var(--color-secondary-dark)] text-left  max-w-[60px]">S.No.</th>
                      <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Campaign</th>
                      <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Customer Type</th>
                      <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Customer Subtype</th>
                      <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Name</th>
                      <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Description</th>
                      <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Location</th>
                      <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Contact No</th>
                      <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Assign To</th>
                      <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Date</th>
                      <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {customerTableLoader ?
                      <tr>
                        <td colSpan={12} className="text-center py-4 text-gray-500">
                          Loading customers...
                        </td>
                      </tr> : currentRows.length > 0 ? (
                        currentRows.map((item, index) => (
                          <tr key={item._id} className="border-t hover:bg-[#f7f6f3] transition-all duration-200">

                            {/* ✅ ROW CHECKBOX */}
                            <td className="px-2 py-3 border border-gray-200">
                              <input
                                type="checkbox"
                                checked={selectedCustomers.includes(item._id)}
                                onChange={() => handleSelectRow(item._id)}
                              />
                            </td>

                            <td className="px-2 py-3 border border-gray-200 break-all whitespace-normal max-w-[60px]">{(currentTablePage - 1) * rowsPerTablePage + (index + 1)}</td>
                            <td className="px-2 py-3 border border-gray-200">{item.Campaign}</td>
                            <td className="px-2 py-3 border border-gray-200 break-all whitespace-normal w-[130px]">{item.Type}</td>
                            <td className="px-2 py-3 border  border-gray-200 break-all whitespace-normal max-w-[120px] ">{item.SubType}</td>
                            <td className="px-2 py-3 border border-gray-200  ">{item.Name}</td>
                            <td
                              className={`px-2 py-3 border border-gray-200 break-all whitespace-normal max-w-[160px] ${item.Description ? "min-w-[160px]" : ""
                                }`}
                            >
                              {item.Description}
                            </td>
                            <td className="px-2 py-3 border border-gray-200">{item.Location}</td>
                            <td className="px-2 py-3 border border-gray-200 break-all text-center whitespace-normal max-w-[140px]">{(item.ContactNumber) && <>{item.ContactNumber}<span className=" flex"> <Button
                              component="a"
                              href={`tel:${item.ContactNumber}`}
                              sx={{
                                backgroundColor: "#E8F5E9",
                                color: "var(--color-primary)",
                                minWidth: "14px",
                                height: "24px",
                                borderRadius: "8px",
                                margin: "4px"
                              }} ><FaPhone size={12} /></Button>
                              <Button
                                sx={{
                                  backgroundColor: "#E8F5E9",
                                  color: "var(--color-primary)",
                                  minWidth: "14px",
                                  height: "24px",
                                  borderRadius: "8px",
                                  margin: "4px"
                                }}
                                onClick={() => {
                                  setSelectedCustomers([item._id])
                                  setSelectUser(item._id)
                                  setIsMailAllOpen(true);
                                  fetchEmailTemplates();
                                }}
                              ><MdEmail size={14} /></Button>
                              <Button
                                onClick={() => {
                                  setSelectedCustomers([item._id]);
                                  setSelectUser(item._id);
                                  setIsWhatsappAllOpen(true);
                                  fetchWhatsappTemplates()

                                }}
                                sx={{
                                  backgroundColor: "#E8F5E9",
                                  color: "var(--color-primary)",
                                  minWidth: "14px",
                                  height: "24px",
                                  borderRadius: "8px",
                                  margin: "4px"
                                }} ><FaWhatsapp size={14} /></Button></span></>
                            }
                            </td>
                            <td className="px-2 py-3 border border-gray-200">{item.AssignTo}</td>
                            <td className="px-2 py-3 border border-gray-200 min-w-[100px]">{item.Date}</td>

                            <td className="px-2 py-3 border border-gray-200 min-w-[90px] align-middle">
                              <div className="grid grid-cols-2 gap-3 items-center h-full">
                                <Button
                                  sx={{ backgroundColor: "#E8F5E9", color: "var(--color-primary)", minWidth: "32px", height: "32px", borderRadius: "8px", }}
                                  onClick={() => router.push(`/followups/customer/add/${item._id}`)}
                                >
                                  <MdAdd />
                                </Button>

                                <Button
                                  sx={{ backgroundColor: "#E8F5E9", color: "var(--color-primary)", minWidth: "32px", height: "32px", borderRadius: "8px", }}
                                  onClick={() => router.push(`/customer/edit/${item._id}`)}
                                >
                                  <MdEdit />
                                </Button>

                                <Button
                                  sx={{ backgroundColor: "#FDECEA", color: "#C62828", minWidth: "32px", height: "32px", borderRadius: "8px", }}
                                  onClick={() => {
                                    setIsDeleteDialogOpen(true);
                                    setDialogType("delete");
                                    setDialogData({
                                      id: item._id,
                                      customerName: item.Name,
                                      ContactNumber: item.ContactNumber,
                                    });
                                  }}
                                >
                                  <MdDelete />
                                </Button>

                                <Button
                                  sx={{
                                    backgroundColor: "#FFF0F5",
                                    color: item.isFavourite ? "#E91E63" : "#C62828",
                                    minWidth: "32px",
                                    height: "32px",
                                    borderRadius: "8px",

                                  }}
                                  onClick={() =>
                                    handleFavouriteToggle(item._id, item.Name, item.ContactNumber, item.isFavourite ?? false)
                                  }
                                >
                                  {item.isFavourite ? <MdFavorite /> : <MdFavoriteBorder />}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} className="text-center py-4 text-gray-500">
                            No data available.
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Pagination */}
            <div className="flex justify-between items-center mt-3 py-3 px-5">
              <p className="text-sm">
                Page {currentTablePage} of {totalCustomerPage}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentTablePage(1)}
                  disabled={currentTablePage === 1}
                  className="p-2 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                  title="First page"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  onClick={() =>
                    setCurrentTablePage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentTablePage === 1}
                  className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={async () => {
                    // normal pagination
                    if (currentTablePage < totalTablePages) {
                      setCurrentTablePage(prev => prev + 1);
                      return;
                    }

                    // last page → fetch more → then move
                    if (hasMoreCustomers) {
                      await fetchMore();
                      setCurrentTablePage(prev => prev + 1);
                    }
                  }}
                  disabled={!hasMoreCustomers && currentTablePage === totalTablePages}
                  className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
                <button
                  onClick={handleLastPage}
                  disabled={currentTablePage === totalTablePages && !hasMoreCustomers}
                  className="p-2 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                  title="Last page"
                >
                  <ChevronsRight size={16} />
                </button>


              </div>
            </div>
          </section>

        </div>
      </div>
    </ProtectedRoute>
  );
}
