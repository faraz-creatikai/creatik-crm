"use client";

import "./globals.css";
import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./component/Nav";
import { AppSidebar } from "../components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "../components/ui/separator";
import ProtectedRoute from "./component/ProtectedRoutes";
import { AuthProvider } from "@/context/AuthContext";
import { Poppins, Manrope, Schibsted_Grotesk } from 'next/font/google'
import { CustomerImportProvider } from "@/context/CustomerImportContext";
import { ContactImportProvider } from "@/context/ContactImportContext";
import MobileHamburger from "./component/HamburgerMenu";
import Link from "next/link";
import { Router } from "next/router";

const poppins = Schibsted_Grotesk({
  weight: '400',
  subsets: ['latin'],
})

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname === "/admin" || pathname === "/register";

  useEffect(() => {
    if (Router && "prefetch" in Router) {
      Router.prefetch = async () => {}; // override prefetch globally
    }
  }, []);

  return (
    <html lang="en" className={`min-h-screen w-full overflow-x-hidden ${poppins.className}`}>
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#ffffff" />
      <link rel="icon" href="/icons/favicon-16x16.png" />
       <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />
        <title>Prime Consultancy Leads</title>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <body className="min-h-screen w-full bg-violet-100 overflow-x-hidden">
        <AuthProvider>
          <CustomerImportProvider>
            <ContactImportProvider>
              {isAdminPage ? (
                <main className="min-h-screen ">{children}</main>
              ) : (
                <ProtectedRoute>
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full overflow-hidden">
                      {/* Sidebar */}
                      <AppSidebar />

                      {/* Main Area */}
                      <SidebarInset className="flex flex-col flex-1 min-h-screen overflow-hidden">

                        {/* Navbar */}
                        <header className="flex items-center gap-2 shrink-0 bg-white max-sm:fixed max-sm:top-0 max-sm:left-0 max-sm:w-full max-sm:bg-[var(--color-primary)] text-gray-800 px-4 pl-0 shadow-sm z-10">
                          <div className="flex items-center gap-2 ml-2 max-sm:hidden ">
                            <SidebarTrigger className="ml-1 cursor-pointer" />
                            <Separator
                              orientation="vertical"
                              className="mr-2 data-[orientation=vertical]:h-4"
                            />
                          </div>

                          <MobileHamburger />

                          <Link href={"/dashboard"} className=" text-white cursor-pointer font-extrabold text-shadow-2xs text-shadow-black text-xl py-1 sm:hidden">
                            Dashboard
                          </Link>

                          <div className="ml-auto w-full">
                            <Navbar />
                          </div>
                        </header>

                        {/* Page Content */}
                        <main className="flex-1 overflow-y-auto bg-violet-100">
                          {/* Mobile Sidebar Trigger */}
                          <div className="flex items-center gap-2 max-w-[100px] max-md:hidden md:hidden mt-4 ml-4">
                            <SidebarTrigger className="ml-1" />
                            <Separator
                              orientation="vertical"
                              className="mr-2 data-[orientation=vertical]:h-4"
                            />
                          </div>

                          {/* Actual Page */}
                          <div className="p-4 max-md:px-2 max-md:py-2 max-sm:mt-[52px]">{children}</div>
                        </main>
                      </SidebarInset>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              )}
            </ContactImportProvider>
          </CustomerImportProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
