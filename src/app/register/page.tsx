"use client";

import React, { useState, useEffect, JSX } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FaUserAlt, FaLock, FaPhone } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { registerRequestUser } from "@/store/requestusers/requestusers";
import PopupMenu from "../component/popups/PopupMenu";
import RegisterPopup from "../component/popups/RegisterPopup";
import { passwordRules, ValidatePassword } from "../utils/ValidatePassword";


type PasswordValidationResult = {
  messages: JSX.Element[]; // for inline display
  errorString: string | null; // for toast
};

const Register = () => {
  const router = useRouter();
  const { admin, isLoading, login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const togglePassword = () => {
    setShowPassword(!showPassword)
  };




  /*   if (isLoading || loading) {
      return (
        <div className="grid place-items-center min-h-screen w-full text-lg text-gray-600">
          Loading...
        </div>
      );
    } */


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const PhoneValidationError = validatePhone(phone);
    const PasswordValidationError = ValidatePassword(password);
    // const PasswordValidationError = validatePassword(password)

    if (PasswordValidationError) {
      setPasswordError(PasswordValidationError);
      toast.error(PasswordValidationError);
      return;
    }
    if (PhoneValidationError) {
      setPhoneError(PhoneValidationError);
      toast.error(PhoneValidationError);
      return;
    }
    // if (PasswordValidationError) {
    //   // setPasswordError(PasswordValidationError)
    //   toast.error(PasswordValidationError);
    //   return;
    // }
    setLoading(true);

    const res = await registerRequestUser({ name, email, password, phone });
    if (res) {
      //router.push("/dashboard")
      setIsPopupOpen(true);
      setLoading(false);
      return;
    };
    setLoading(false);
    setIsPopupOpen(false);
    toast.error("Failed To Register")
  };

  //for phone number validation
  const validatePhone = (phone: string) => {
    if (!phone) return "Phone number is required";
    if (!/^(?:\+91|0)?[6-9]\d{9}$/.test(phone)) {
      return "Enter a valid Indian phone number";
    }
    return "";
  };
  // const validatePassword = (password: string) => {
  //   // Define rules
  //   const rules = [
  //     {
  //       test: /.{6,}/,
  //       message: "Password must be at least 6 characters long",
  //     },
  //     {
  //       test: /[A-Z]/,
  //       message: "Password must include at least one uppercase letter",
  //     },
  //     {
  //       test: /\d/,
  //       message: "Password must include at least one number",
  //     },
  //     {
  //       test: /[!@#$%^&*]/,
  //       message: "Password must include at least one special character",
  //     },
  //   ];

  //   // Map over rules and return <p> with conditional class
  //   return rules.map((rule, idx) => {
  //     const passed = rule.test.test(password);
  //     return (
  //       <p key={idx} className={passed ? "text-green-600" : "text-red-600"}>
  //         {rule.message}
  //       </p>
  //     );
  //   });
  // };





  return (
    <>
      {isPopupOpen && <RegisterPopup onClose={() => {
        setIsPopupOpen(false)
        setEmail("")
        setPassword("")
        setName("")
        setPhone("")
        setPasswordError("")
      }} />
      }
      <div className="min-h-screen w-full flex items-center justify-center bg-[url('/bgimage.webp')] bg-center bg-cover">
        <Toaster position="top-right" />
        <div className="relative w-full max-w-5xl min-h-[calc(100vh-200px)] bg-[url('/bgimage.webp')] bg-center bg-cover  rounded-2xl overflow-hidden shadow-2xl shadow-black/70 flex flex-col md:flex-row">
          <div className="relative w-full md:w-1/2 flex items-center justify-center p-10">
            <div className="text-center">
              <h2 className="text-4xl text-blue-200 font-bold mb-4">
                Hi There 👋
              </h2>
              <p className="text-purple-300 text-lg">
                Register your user account to manage everything efficiently.
              </p>
            </div>
            <div className="absolute right-[-60px] top-0 bottom-0 w-[120px]  rounded-full  opacity-30"></div>
          </div>

          <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12">
            <h3 className="text-2xl font-semibold text-blue-200 text-center mb-6">
              Register Account
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="relative mt-2">
                <FaUserAlt className="absolute left-3 top-3 text-gray-300" />
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  type="text"
                  id="name"
                  required
                  className="peer w-full pl-10 pt-4 pb-2 border-b border-gray-300 text-gray-300 focus:border-purple-300 focus:outline-none transition bg-transparent"
                />
                <label
                  htmlFor="name"
                  className={`absolute left-10 text-gray-300 text-sm transition-all duration-200 ${name
                    ? "-top-1.5 text-purple-300 text-sm"
                    : "top-3 text-gray-300 text-base"
                    } peer-focus:-top-1.5 peer-focus:text-purple-300 peer-focus:text-sm`}
                >
                  Fullname
                </label>
              </div>
              <div className="relative mt-2">
                <FaUserAlt className="absolute left-3 top-3 text-gray-300" />
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  type="email"
                  id="email"
                  required
                  className="peer w-full pl-10 pt-4 pb-2 border-b border-gray-300 text-gray-300 focus:border-purple-300 focus:outline-none transition bg-transparent"
                />
                <label
                  htmlFor="email"
                  className={`absolute left-10 text-gray-300 text-sm transition-all duration-200 ${email
                    ? "-top-1.5 text-purple-300 text-sm"
                    : "top-3 text-gray-300 text-base"
                    } peer-focus:-top-1.5 peer-focus:text-purple-300 peer-focus:text-sm`}
                >
                  Email Address
                </label>
              </div>
              <div>


                <div className="relative mt-4">
                  <FaLock className="absolute left-3 top-3 text-gray-300" />
                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    required
                    className="peer w-full pl-10 pt-4 pb-2 border-b border-gray-300 text-gray-300 focus:border-purple-300 focus:outline-none transition bg-transparent"
                  />
                  <label
                    htmlFor="password"
                    className={`absolute left-10 text-gray-300 text-sm transition-all duration-200 ${password
                      ? "-top-1.5 text-purple-300 text-md"
                      : "top-3 text-gray-300 text-base"
                      } peer-focus:-top-1.5 peer-focus:text-purple-300 peer-focus:text-sm`}
                  >
                    Password
                  </label>
                  <button type="button" onClick={() => togglePassword()} className="text-sm cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>

                </div>
                {/* {passwordError && (
                  <p className="text-red-500 text-sm mt-1">{passwordError}
                  </p>
                )} */}
                <div className="flex flex-col gap-1  mt-2 text-sm font-extralight">
                  {passwordRules.map((rule, idx) => {
                    const passed = rule.test.test(password);
                    return (passwordError === rule.message) && <p key={idx} className={passed ? "text-green-500" : "text-red-500"}>
                      {rule.message}
                    </p>

                  })}
                </div>
              </div>

              <div className="relative mt-2">
                <FaPhone className="absolute left-3 top-3 text-gray-300 rotate-[100deg]" />
                <input
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    setPhone(value);
                    setPhoneError(validatePhone(value));
                  }}
                  value={phone}
                  type="text"
                  id="phone"
                  className="peer w-full pl-10 pt-4 pb-2 border-b border-gray-300 text-gray-300 focus:border-purple-300 focus:outline-none transition bg-transparent"
                />
                <label
                  htmlFor="phone"
                  className={`absolute left-10 text-gray-300 text-sm transition-all duration-200 ${phone
                    ? "-top-1.5 text-purple-300 text-sm"
                    : "top-3 text-gray-300 text-base"
                    } peer-focus:-top-1.5 peer-focus:text-purple-300 peer-focus:text-sm`}
                >
                  Phone Number
                </label>
                {phoneError && (
                  <p className="text-red-500 text-sm mt-1">{phoneError}
                  </p>
                )}
              </div>

              <button
                type={loading ? "button" : "submit"}
                disabled={loading}
                className="w-full cursor-pointer py-3 mt-2 text-white text-lg font-medium rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-500 hover:to-blue-700  transition disabled:opacity-60"
              >
                {loading ? " Registering..." : " Register"}
              </button>
            </form>
            <div className="mt-6 flex justify-center gap-1 text-sm text-center text-gray-300">
              <p>Already have an Account?</p>
              <Link href="/admin" className=" text-cyan-400 hover:underline">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;