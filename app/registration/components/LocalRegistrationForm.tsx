"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type ErrorMap = Record<string, string | undefined>;

export default function SslLocalRegistrationForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<ErrorMap>({});
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  const validate = (form: HTMLFormElement): boolean => {
    const data = new FormData(form);
    const e: ErrorMap = {};

    const get = (name: string) => (data.get(name)?.toString() || "").trim();

    if (!get("firstName")) e.firstName = "First name is required";
    if (!get("lastName")) e.lastName = "Last name is required";

    const phone = get("phoneNumber");
    if (!phone) {
      e.phoneNumber = "Phone number is required";
    } else if (!/^(?:\+254\d{9}|0(?:7\d{8}|1\d{8}))$/.test(phone)) {
      e.phoneNumber = "Enter a valid Kenyan phone number";
    }

    const email = get("email");
    if (!email) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = "Enter a valid email";
    }

    if (!get("dob")) e.dob = "Date of birth is required";
    if (!get("nationality")) e.nationality = "Nationality is required";
    if (!get("employmentStatus"))
      e.employmentStatus = "Select employment status";
    if (!get("jobInterest")) e.jobInterest = "Select your job interest";

    // File validations
    if (!data.get("passportPhoto"))
      e.passportPhoto = "Passport photo is required";
    if (!data.get("fullBodyPhoto"))
      e.fullBodyPhoto = "Full body photo is required";
    if (!data.get("idPhoto")) e.idPhoto = "National ID photo is required";
    if (!data.get("resume")) e.resume = "Resume is required";
    if (!data.get("birthCertificate"))
      e.birthCertificate = "Birth certificate is required";
    if (!data.get("goodConduct"))
      e.goodConduct = "Certificate of good conduct is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleJsonSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!validate(form)) {
      setMessage("Please fix the highlighted fields.");
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setLoading(true);
    setMessage("");
    const loadingToast = toast.loading("Submitting your application...");

    try {
      const formData = new FormData(form);

      // Convert checkboxes → booleans
      const booleanKeys = [
        "hasCat",
        "hasDog",
        "extraPay",
        "liveOut",
        "privateRoom",
        "elderlyCare",
        "specialNeeds",
        "olderThan1",
        "youngerThan1",
      ];
      const booleans = booleanKeys.reduce((acc, key) => {
        acc[key] = formData.get(key) === "true";
        return acc;
      }, {} as Record<string, boolean>);

      // Build DTO
      const raw = Object.fromEntries(formData.entries());
      const dto: any = {
        ...raw,
        languages: formData.getAll("languages") as string[],
        ...booleans,
      };

      // Normalize enums
      dto.employmentStatus = dto.employmentStatus?.toUpperCase();
      dto.jobInterest = dto.jobInterest?.toUpperCase();
      dto.languages = dto.languages?.map((lang: string) => lang.toUpperCase());

      // Remove empty
      Object.keys(dto).forEach((k) => {
        if (dto[k] === "") delete dto[k];
      });

      // 1. Create application
      const res = await fetch(`${API_BASE}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });
      if (!res.ok) throw new Error("Failed to create application");
      const application = await res.json();
      const applicationId = application.id;

      // 2. Upload helper
      const uploadFile = async (
        fieldName: string,
        kind: string,
        endpoint: string
      ) => {
        const file = formData.get(fieldName) as File;
        if (file && file.size > 0) {
          const fd = new FormData();
          fd.append("file", file);
          await fetch(
            `${API_BASE}/api/media/${applicationId}/${endpoint}?kind=${kind}`,
            {
              method: "POST",
              body: fd,
            }
          );
        }
      };

      // Uploads
      await Promise.all([
        uploadFile("passportPhoto", "PASSPORT", "photo"),
        uploadFile("idPhoto", "NATIONAL_ID", "photo"),
        uploadFile("fullBodyPhoto", "FULL_PHOTO", "photo"),
        uploadFile("resume", "RESUME", "resume"),
        uploadFile("birthCertificate", "BIRTH_CERTIFICATE", "resume"),
        uploadFile("goodConduct", "GOOD_CONDUCT", "resume"),
      ]);

      setMessage("✅ Application submitted successfully!");
      toast.success("Application submitted successfully!", {
        id: loadingToast,
      });
      form.reset();
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.", {
        id: loadingToast,
      });
    } finally {
      setLoading(false);
    }
  };

  // Styling helpers
  const inputClass = (name: string) =>
    `w-full px-4 py-2.5 rounded-lg border text-gray-900 placeholder-gray-400 
  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent 
  ${
    errors[name as keyof typeof errors]
      ? "border-red-400 bg-red-50 focus:ring-red-500 placeholder-red-400"
      : "border-gray-400 bg-gray-50 hover:border-purple-400 focus:bg-white"
  }`;

  const selectClass = (name: string) =>
    `w-full px-4 py-2.5 rounded-lg border text-gray-900 placeholder-gray-600 
  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer 
  ${
    errors[name as keyof typeof errors]
      ? "border-red-400 bg-red-50 focus:ring-red-500"
      : "border-gray-400 bg-gray-50 hover:border-purple-400 focus:bg-white"
  }`;

  const errorText = (name: string) =>
    errors[name as keyof typeof errors] ? (
      <span className="flex items-center gap-1 text-red-600 text-xs font-semibold mt-1.5 bg-white bg-opacity-90 px-2 py-0.5 rounded-md shadow-sm z-10">
        <svg
          className="w-3.5 h-3.5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <span className="whitespace-pre-wrap leading-tight">
          {errors[name as keyof typeof errors]}
        </span>
      </span>
    ) : null;

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-8 bg-gradient-to-br from-purple-50 via-white to-yellow-50">
      <div className="w-full max-w-2xl">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-purple-100">
          {/* Header with decorative elements */}
          <div className="relative px-8 py-8 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full opacity-10 -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full opacity-5 -ml-24 -mb-24"></div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2">
                Local Application Registration
              </h1>
              <p className="text-purple-100 text-sm">
                Please fill in your details accurately to complete your
                application
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleJsonSubmit} className="px-8 py-8">
            {/* Personal Information Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                Personal Information
              </h2>
              <p className="text-sm text-gray-500 mb-5 ml-10">
                Basic details about yourself
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="firstName"
                  >
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    className={inputClass("firstName")}
                  />
                  {errorText("firstName")}
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="middleName"
                  >
                    Middle Name
                  </label>
                  <input
                    id="middleName"
                    name="middleName"
                    type="text"
                    placeholder="Enter your middle name"
                    className={inputClass("middleName")}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="lastName"
                  >
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    className={inputClass("lastName")}
                  />
                  {errorText("lastName")}
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="dob"
                  >
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dob"
                    name="dob"
                    type="date"
                    className={inputClass("dob")}
                  />
                  {errorText("dob")}
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="nationality"
                  >
                    Nationality <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nationality"
                    name="nationality"
                    type="text"
                    placeholder="Enter your nationality"
                    className={inputClass("nationality")}
                  />
                  {errorText("nationality")}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                Contact Information
              </h2>
              <p className="text-sm text-gray-500 mb-5 ml-10">
                How can we reach you?
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="phoneNumber"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="+254 700 000 000"
                    className={inputClass("phoneNumber")}
                  />
                  {errorText("phoneNumber")}
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="email"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className={inputClass("email")}
                  />
                  {errorText("email")}
                </div>

                <div className="md:col-span-2">
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="currentLocation"
                  >
                    Current Location
                  </label>
                  <input
                    id="currentLocation"
                    name="currentLocation"
                    type="text"
                    placeholder="e.g., Nairobi"
                    className={inputClass("currentLocation")}
                  />
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                Professional Background
              </h2>
              <p className="text-sm text-gray-500 mb-5 ml-10">
                Tell us about your experience
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="currentProfession"
                  >
                    Current Profession
                  </label>
                  <input
                    id="currentProfession"
                    name="currentProfession"
                    type="text"
                    placeholder="e.g., Housekeeper"
                    className={inputClass("currentProfession")}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="experience"
                  >
                    Years of Experience
                  </label>
                  <input
                    id="experience"
                    name="experience"
                    type="text"
                    placeholder="e.g., 3 years housekeeping"
                    className={inputClass("experience")}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="currentSalary"
                  >
                    Current Salary
                  </label>
                  <input
                    id="currentSalary"
                    name="currentSalary"
                    type="text"
                    placeholder="Enter amount"
                    className={inputClass("currentSalary")}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="employmentStatus"
                  >
                    Employment Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="employmentStatus"
                    name="employmentStatus"
                    defaultValue=""
                    className={selectClass("employmentStatus")}
                  >
                    <option disabled value="">
                      Select status
                    </option>
                    <option value="EMPLOYED">Employed</option>
                    <option value="NOT_EMPLOYED">Unemployed</option>
                  </select>
                  {errorText("employmentStatus")}
                </div>

                <div className="md:col-span-2">
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="jobInterest"
                  >
                    Job Interest <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="jobInterest"
                    name="jobInterest"
                    defaultValue=""
                    className={selectClass("jobInterest")}
                  >
                    <option disabled value="">
                      Select your preference
                    </option>
                    <option value="LOCAL_JOBS">Local Jobs</option>
                    <option value="INTERNATIONAL_JOBS">
                      International Jobs
                    </option>
                  </select>
                  {errorText("jobInterest")}
                </div>
              </div>
            </div>

            {/* Languages Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </span>
                Languages
              </h2>
              <p className="text-sm text-gray-500 mb-5 ml-10">
                Select all languages you speak
              </p>

              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 cursor-pointer transition-all duration-200">
                    <input
                      type="checkbox"
                      name="languages"
                      value="ENGLISH"
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      English
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 cursor-pointer transition-all duration-200">
                    <input
                      type="checkbox"
                      name="languages"
                      value="KISWAHILI"
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Kiswahili
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 cursor-pointer transition-all duration-200">
                    <input
                      type="checkbox"
                      name="languages"
                      value="ARABIC"
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Arabic
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Skills & Specialities Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">
                  5
                </span>
                Skills & Specialities
              </h2>
              <p className="text-sm text-gray-500 mb-5 ml-10">
                Select all areas where you have experience
              </p>

              <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-xl border border-yellow-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-yellow-300 cursor-pointer transition-all duration-200">
                    <input
                      type="checkbox"
                      name="elderlyCare"
                      value="true"
                      className="w-5 h-5 text-yellow-500 rounded focus:ring-2 focus:ring-yellow-400"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Elderly Care
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-yellow-300 cursor-pointer transition-all duration-200">
                    <input
                      type="checkbox"
                      name="specialNeeds"
                      value="true"
                      className="w-5 h-5 text-yellow-500 rounded focus:ring-2 focus:ring-yellow-400"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Special Needs
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-yellow-300 cursor-pointer transition-all duration-200">
                    <input
                      type="checkbox"
                      name="olderThan1"
                      value="true"
                      className="w-5 h-5 text-yellow-500 rounded focus:ring-2 focus:ring-yellow-400"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Babies older than 1 year
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-yellow-300 cursor-pointer transition-all duration-200">
                    <input
                      type="checkbox"
                      name="youngerThan1"
                      value="true"
                      className="w-5 h-5 text-yellow-500 rounded focus:ring-2 focus:ring-yellow-400"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Babies younger than 1 year
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Additional Preferences Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">
                  6
                </span>
                Additional Preferences
              </h2>
              <p className="text-sm text-gray-500 mb-5 ml-10">
                Your workplace preferences
              </p>

              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 cursor-pointer transition-all duration-200">
                    <input
                      type="checkbox"
                      name="hasCat"
                      value="true"
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Comfortable with Cats
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 cursor-pointer transition-all duration-200">
                    <input
                      type="checkbox"
                      name="hasDog"
                      value="true"
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Comfortable with Dogs
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 cursor-pointer transition-all duration-200">
                    <input
                      type="checkbox"
                      name="extraPay"
                      value="true"
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Extra Pay for Overtime
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 cursor-pointer transition-all duration-200">
                    <input
                      type="checkbox"
                      name="liveOut"
                      value="true"
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Live Out
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 cursor-pointer transition-all duration-200 sm:col-span-2">
                    <input
                      type="checkbox"
                      name="privateRoom"
                      value="true"
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Private Maid Room
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">
                  7
                </span>
                Required Documents
              </h2>
              <p className="text-sm text-gray-500 mb-5 ml-10">
                Upload the following documents to complete your application
              </p>

              <div className="space-y-5">
                {/* Passport Photo */}
                <div className="bg-white p-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-300 transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <label
                        htmlFor="passportPhoto"
                        className="block text-sm font-semibold text-gray-800"
                      >
                        Passport Photo <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Clear headshot photo (JPG, PNG)
                      </p>
                    </div>
                  </div>
                  <input
                    id="passportPhoto"
                    name="passportPhoto"
                    type="file"
                    accept="image/*"
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer cursor-pointer"
                  />
                  {errorText("passportPhoto")}
                </div>

                {/* Full Body Photo */}
                <div className="bg-white p-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-300 transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <label
                        htmlFor="fullBodyPhoto"
                        className="block text-sm font-semibold text-gray-800"
                      >
                        Full Body Photo <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Full-length photo (JPG, PNG)
                      </p>
                    </div>
                  </div>
                  <input
                    id="fullBodyPhoto"
                    name="fullBodyPhoto"
                    type="file"
                    accept="image/*"
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer cursor-pointer"
                  />
                  {errorText("fullBodyPhoto")}
                </div>

                {/* National ID */}
                <div className="bg-white p-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-300 transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <label
                        htmlFor="idPhoto"
                        className="block text-sm font-semibold text-gray-800"
                      >
                        National ID (Both Sides){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Front & back in one file (PDF, DOC, DOCX)
                      </p>
                    </div>
                  </div>
                  <input
                    id="idPhoto"
                    name="idPhoto"
                    type="file"
                    accept=".doc,.docx,.pdf"
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer cursor-pointer"
                  />
                  {errorText("idPhoto")}
                </div>

                {/* Resume */}
                <div className="bg-white p-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-300 transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <label
                        htmlFor="resume"
                        className="block text-sm font-semibold text-gray-800"
                      >
                        Resume / CV <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, DOC, or DOCX format
                      </p>
                    </div>
                  </div>
                  <input
                    id="resume"
                    name="resume"
                    type="file"
                    accept=".doc,.docx,.pdf"
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer cursor-pointer"
                  />
                  {errorText("resume")}
                </div>

                {/* Birth Certificate */}
                <div className="bg-white p-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-300 transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <label
                        htmlFor="birthCertificate"
                        className="block text-sm font-semibold text-gray-800"
                      >
                        Birth Certificate{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, DOC, or DOCX format
                      </p>
                    </div>
                  </div>
                  <input
                    id="birthCertificate"
                    name="birthCertificate"
                    type="file"
                    accept=".doc,.docx,.pdf"
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer cursor-pointer"
                  />
                  {errorText("birthCertificate")}
                </div>

                {/* Certificate of Good Conduct */}
                <div className="bg-white p-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-300 transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <label
                        htmlFor="goodConduct"
                        className="block text-sm font-semibold text-gray-800"
                      >
                        Certificate of Good Conduct{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, DOC, or DOCX format
                      </p>
                    </div>
                  </div>
                  <input
                    id="goodConduct"
                    name="goodConduct"
                    type="file"
                    accept=".doc,.docx,.pdf"
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer cursor-pointer"
                  />
                  {errorText("goodConduct")}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full py-4 px-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-800 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:from-yellow-500 hover:to-yellow-600 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting Application...
                  </span>
                ) : (
                  "Submit Application"
                )}
              </button>
              <p className="text-center text-xs text-gray-500 mt-3">
                By submitting this form, you agree to our terms and conditions
              </p>
            </div>
          </form>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
            <p className="text-green-700 font-medium">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
