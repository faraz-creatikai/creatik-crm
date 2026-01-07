"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import { MdDelete, MdEdit } from "react-icons/md";
import Button from "@mui/material/Button";
import { PlusSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import PopupMenu from "../../component/popups/PopupMenu";
import {
  typesGetDataInterface,
  typesDialogDataInterface,
} from "@/store/masters/types/types.interface";
import { deleteTypes, getTypes } from "@/store/masters/types/types";
import DeleteDialog from "@/app/component/popups/DeleteDialog";
import AddButton from "@/app/component/buttons/AddButton";
import PageHeader from "@/app/component/labels/PageHeader";
import MasterProtectedRoute from "@/app/component/MasterProtectedRoutes";

export default function CustomerTypePage() {
  const [types, setTypes] = useState<typesGetDataInterface[]>([]);
  const [keyword, setKeyword] = useState("");
  const [limit, setLimit] = useState("10");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteDialogData, setDeleteDialogData] =
    useState<typesDialogDataInterface | null>(null);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [rowsPerTablePage, setRowsPerTablePage] = useState(10);
  const router = useRouter();

  const fetchTypes = async () => {
    const data = await getTypes();
    if (data) {
      const formatted = data.map((t: typesGetDataInterface) => ({
        ...t,
        Name: t.Name.charAt(0).toUpperCase() + t.Name.slice(1),
      }));
      setTypes(formatted);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  useEffect(() => {
    setRowsPerTablePage(Number(limit));
    setCurrentTablePage(1);
  }, [limit])

  const filteredTypes = useMemo(() => {
    return types
      .filter(
        (t) =>
          keyword === "" ||
          t.Name.toLowerCase().includes(keyword.toLowerCase()) ||
          t.Campaign?.Name?.toLowerCase().includes(keyword.toLowerCase())
      )
  }, [types, keyword]);

  const handleDelete = async (data: typesDialogDataInterface | null) => {
    if (!data) return;
    const res = await deleteTypes(data.id);
    if (res) {
      toast.success("Customer Type deleted successfully!");
      setIsDeleteDialogOpen(false);
      setDeleteDialogData(null);
      fetchTypes();
      return;
    }
    toast.error("Failed to delete Customer Type.");
  };

  const handleEdit = (id?: string) => {
    router.push(`/masters/customer-types/edit/${id}`);
  };

  const handleClear = () => {
    setKeyword("");
    setLimit("10");
  };

  const totalTablePages = Math.ceil(filteredTypes.length / rowsPerTablePage);
  const indexOfLastRow = currentTablePage * rowsPerTablePage;
  const indexOfFirstRow = indexOfLastRow - rowsPerTablePage;
  const currentRows = filteredTypes.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <MasterProtectedRoute>
      <Toaster position="top-right" />
      <div className="min-h-[calc(100vh-56px)] overflow-auto max-md:py-10">


        {/* DELETE POPUP */}
        <DeleteDialog<typesDialogDataInterface>
          isOpen={isDeleteDialogOpen}
          title="Are you sure you want to delete this followup?"
          data={deleteDialogData}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setDeleteDialogData(null);
          }}
          onDelete={handleDelete}
        />


        {/* Card Container */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 relative">
          <PageHeader title="Dashboard" subtitles={["Customer Type"]} />
          {/* Add Button */}

          <AddButton
            url="/masters/customer-types/add"
            text="Add"
            icon={<PlusSquare size={18} />}
          />

          {/* Filter Form */}
          <form className="w-full flex flex-wrap gap-6 items-end mb-6 mt-16">
            <div className="flex flex-col flex-1 w-60">
              <label
                htmlFor="keyword"
                className="text-lg font-medium text-gray-900 pl-1"
              >
                Keyword
              </label>
              <input
                id="keyword"
                type="text"
                placeholder="Search by name or campaign..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full outline-none border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-800"
              />
            </div>

            <div className="flex flex-col w-40">
              <label
                htmlFor="limit"
                className="text-lg font-medium text-gray-900 pl-1"
              >
                Limit
              </label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="h-10 border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-800"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 text-sm hover:underline transition-all"
              >
                Clear Search
              </button>
            </div>
          </form>

          {/* Table */}
          <div className="overflow-auto">
            <table className="table-auto w-full border-collapse text-sm border border-gray-200">
              <thead className="bg-[var(--color-primary)] text-white">
                <tr className="flex justify-between items-center w-full">
                  <th className="flex items-center gap-10 px-8 py-3 border border-[var(--color-secondary-dark)] text-left w-1/2">
                    <p className="w-[60px]">S.No.</p>
                    <p className="w-[200px]">Campaign</p>
                    <p className="w-[200px]">Name</p>
                  </th>

                  <th className="flex items-center gap-10 px-8 py-3 border border-[var(--color-secondary-dark)] text-left w-1/2 justify-end">
                    <p className="w-[120px]">Status</p>
                    <p className="w-[120px]">Action</p>
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((t, i) => (
                    <tr
                      key={t._id || i}
                      className="border-t flex justify-between items-center w-full hover:bg-[#f7f6f3] transition-all duration-200"
                    >
                      <td className="flex items-center gap-10 px-8 py-3 w-1/2">
                        <p className="w-[60px]">{(currentTablePage - 1) * rowsPerTablePage + (i + 1)}</p>
                        <p className="w-[200px]">{t.Campaign?.Name}</p>
                        <p className="w-[200px] font-semibold break-all whitespace-normal max-w-[200px]">{t.Name}</p>
                      </td>

                      <td className="flex items-center gap-10 px-8 py-3 w-1/2 justify-end">
                        <div className="w-[120px]">
                          <span
                            className={`px-3 py-1 rounded-[2px] text-xs font-semibold ${t.Status === "Active"
                              ? "bg-[#E8F5E9] text-green-700"
                              : "bg-red-100 text-red-700"
                              }`}
                          >
                            {t.Status}
                          </span>
                        </div>

                        <div className="w-[120px] flex gap-2 items-center justify-start">
                          <Button
                            sx={{
                              backgroundColor: "#E8F5E9",
                              color: "var(--color-primary)",
                              minWidth: "32px",
                              height: "32px",
                              borderRadius: "8px",
                            }}
                            onClick={() => handleEdit(t._id || String(i))}
                          >
                            <MdEdit />
                          </Button>

                          <Button
                            sx={{
                              backgroundColor: "#FDECEA",
                              color: "#C62828",
                              minWidth: "32px",
                              height: "32px",
                              borderRadius: "8px",
                            }}
                            onClick={() => {
                              setIsDeleteDialogOpen(true);
                              setDeleteDialogData({
                                id: t._id || String(i),
                                Name: t.Name,
                                Status: t.Status,
                              });
                            }}
                          >
                            <MdDelete />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-4 text-gray-500"
                    >
                      No customer types found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-between items-center mt-3 py-3 px-5">
              <p className="text-sm">
                Page {currentTablePage} of {totalTablePages}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentTablePage((p) => Math.max(1, p - 1))
                  }
                  disabled={currentTablePage === 1}
                  className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentTablePage((p) =>
                      p < totalTablePages ? p + 1 : p
                    )
                  }
                  disabled={
                    currentTablePage === totalTablePages ||
                    currentRows.length <= 0
                  }
                  className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MasterProtectedRoute>
  );
}
