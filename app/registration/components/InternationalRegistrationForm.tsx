"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type ErrorMap = Record<string, string | undefined>;

export default function SslInternationalRegistrationForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  const validate = (form: HTMLFormElement): boolean => {
    const data = new FormData(form);
    const e: ErrorMap = {};

    const get = (name: string) => (data.get(name)?.toString() || "").trim();

    if (!get("firstName")) e.firstName = "First name is required";
    if (!get("lastName")) e.lastName = "Last name is required";

    const phone = get("phoneNumber");
    if (!phone) e.phoneNumber = "Phone number is required";
    else if (!/^(?:\+254\d{9}|0(?:7\d{8}|1\d{8}))$/.test(phone))
      e.phoneNumber = "Enter a valid Kenyan phone number";

    const email = get("email");
    if (!email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email";

    if (!get("dob")) e.dob = "Date of birth is required";
    if (!get("nationality")) e.nationality = "Nationality is required";
    if (!get("religion")) e.religion = "Religion is required";
    if (!get("maritalStatus")) e.maritalStatus = "Marital status is required";
    if (!get("educationLevel"))
      e.educationLevel = "Education level is required";
    if (!get("employmentStatus"))
      e.employmentStatus = "Select employment status";
    if (!get("jobRecruitment")) e.jobRecruitment = "Select job category";

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

  const handleJsonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;

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

      // Build DTO exactly matching backend
      const raw = Object.fromEntries(formData.entries());

      const dto: any = {
        firstName: raw.firstName,
        middleName: raw.middleName || null,
        lastName: raw.lastName,
        phoneNumber: raw.phoneNumber,
        email: raw.email,
        dob: raw.dob,
        nationality: raw.nationality,
        religion: raw.religion,
        maritalStatus: raw.maritalStatus,
        numberOfKids: raw.numberOfKids || null,
        educationLevel: raw.educationLevel,
        currentProfession: raw.currentProfession || null,
        currentSalary: raw.currentSalary
          ? parseFloat(raw.currentSalary as string)
          : null,
        currentLocation: raw.currentLocation || null,
        employmentStatus: raw.employmentStatus,
        jobRecruitment: raw.jobRecruitment,
        languages: formData
          .getAll("languages")
          .map((l) => l.toString().toUpperCase()),
      };

      // 1. Create application
      const res = await fetch(`${API_BASE}/api/international`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create application");
      }

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
          const uploadRes = await fetch(
            `${API_BASE}/api/media/${applicationId}/${endpoint}?kind=${kind}`,
            { method: "POST", body: fd }
          );

          if (!uploadRes.ok) {
            throw new Error(`Failed to upload ${fieldName}`);
          }
        }
      };

      await Promise.all([
        uploadFile("passportPhoto", "PASSPORT", "photo"),
        uploadFile("fullBodyPhoto", "FULL_PHOTO", "photo"),
        uploadFile("resume", "RESUME", "resume"),
        uploadFile("idPhoto", "NATIONAL_ID", "resume"),
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
      toast.error(err.message || "Something went wrong. Please try again.", {
        id: loadingToast,
      });
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-5"></div>
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
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                International Job Application
              </h1>
              <p className="text-purple-100 text-sm md:text-base max-w-2xl mx-auto">
                Complete this form to begin your journey. All fields marked with
                * are required.
              </p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleJsonSubmit} className="p-8 md:p-10">
            {/* Section 1: Personal Information */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Personal Information
                </h2>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
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
                      className="block text-sm font-semibold text-gray-700 mb-2"
                      htmlFor="middleName"
                    >
                      Middle Name
                    </label>
                    <input
                      id="middleName"
                      name="middleName"
                      type="text"
                      placeholder="Middle name (optional)"
                      className={inputClass("middleName")}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
                      htmlFor="phoneNumber"
                    >
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="+254712345678 or 0712345678"
                      className={inputClass("phoneNumber")}
                    />
                    {errorText("phoneNumber")}
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
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
                      className="block text-sm font-semibold text-gray-700 mb-2"
                      htmlFor="nationality"
                    >
                      Nationality <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="nationality"
                      name="nationality"
                      type="text"
                      placeholder="e.g., Kenyan"
                      className={inputClass("nationality")}
                    />
                    {errorText("nationality")}
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
                      htmlFor="religion"
                    >
                      Religion <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="religion"
                      name="religion"
                      type="text"
                      placeholder="e.g., Christian"
                      className={inputClass("religion")}
                    />
                    {errorText("religion")}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
                      htmlFor="maritalStatus"
                    >
                      Marital Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="maritalStatus"
                      name="maritalStatus"
                      defaultValue=""
                      className={selectClass("maritalStatus")}
                    >
                      <option disabled value="">
                        Select your marital status
                      </option>
                      <option value="SINGLE">Single</option>
                      <option value="MARRIED">Married</option>
                    </select>
                    {errorText("maritalStatus")}
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
                      htmlFor="numberOfKids"
                    >
                      Number of Children
                    </label>
                    <input
                      id="numberOfKids"
                      name="numberOfKids"
                      type="number"
                      placeholder="Enter number of children"
                      className={inputClass("numberOfKids")}
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Education & Employment */}
            <div className="mb-10 pt-8 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Education & Employment
                </h2>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
                      htmlFor="educationLevel"
                    >
                      Education Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="educationLevel"
                      name="educationLevel"
                      defaultValue=""
                      className={selectClass("educationLevel")}
                    >
                      <option disabled value="">
                        Select your education level
                      </option>
                      <option value="PRIMARY">Primary</option>
                      <option value="SECONDARY">Secondary</option>
                      <option value="UNIVERSITY">University</option>
                    </select>
                    {errorText("educationLevel")}
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
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
                        Select your employment status
                      </option>
                      <option value="EMPLOYED">Employed</option>
                      <option value="NOT_EMPLOYED">Not Employed</option>
                    </select>
                    {errorText("employmentStatus")}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
                      htmlFor="currentProfession"
                    >
                      Current Profession
                    </label>
                    <input
                      id="currentProfession"
                      name="currentProfession"
                      type="text"
                      placeholder="e.g., Teacher, Nurse"
                      className={inputClass("currentProfession")}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
                      htmlFor="currentSalary"
                    >
                      Current Salary (KES)
                    </label>
                    <input
                      id="currentSalary"
                      name="currentSalary"
                      type="number"
                      placeholder="Monthly salary"
                      className={inputClass("currentSalary")}
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
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

                <div>
                  <label
                    className="block text-sm font-semibold text-gray-700 mb-2"
                    htmlFor="jobRecruitment"
                  >
                    Job Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="jobRecruitment"
                    name="jobRecruitment"
                    defaultValue=""
                    className={selectClass("jobRecruitment")}
                  >
                    <option disabled value="">
                      Select your preferred job category
                    </option>
                    <option value="ADMINISTRATIONS">Administrations</option>
                    <option value="AGRICULTURE">Agriculture</option>
                    <option value="CAREGIVING">Caregiving</option>
                    <option value="CLEANING">Cleaning</option>
                    <option value="CONSTRUCTIONS">Constructions</option>
                    <option value="ELECTRICIANS">Electricians</option>
                    <option value="DOMESTIC_WORKERS">Domestic Workers</option>
                    <option value="EDUCATION">Education</option>
                    <option value="GARMENTS">Garments</option>
                    <option value="HEAVY_EQUIPMENT">Heavy Equipment</option>
                    <option value="HOTEL_HOSPITALITY">
                      Hotel & Hospitality
                    </option>
                    <option value="MANUFACTURING">Manufacturing</option>
                    <option value="MEDICAL">Medical</option>
                    <option value="MECHANICAL">Mechanical</option>
                    <option value="POWER_GAS_WATER">Power, Gas & Water</option>
                    <option value="SECURITY">Security</option>
                    <option value="SUPERMARKETS">Supermarkets</option>
                    <option value="TECHNOLOGY">Technology</option>
                  </select>
                  {errorText("jobRecruitment")}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Languages Spoken <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-4 p-5 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all">
                      <input
                        type="checkbox"
                        name="languages"
                        value="ENGLISH"
                        className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        English
                      </span>
                    </label>
                    <label className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all">
                      <input
                        type="checkbox"
                        name="languages"
                        value="KISWAHILI"
                        className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Kiswahili
                      </span>
                    </label>
                    <label className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all">
                      <input
                        type="checkbox"
                        name="languages"
                        value="ARABIC"
                        className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Arabic
                      </span>
                    </label>
                  </div>
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
            <div className="pt-8">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Submit Application</span>
                  </>
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
          <div
            className={`mt-6 p-5 rounded-xl shadow-lg flex items-start gap-4 ${
              message.includes("✅")
                ? "bg-green-50 border-2 border-green-200"
                : "bg-red-50 border-2 border-red-200"
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.includes("✅") ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {message.includes("✅") ? (
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p
                className={`font-semibold text-lg ${
                  message.includes("✅") ? "text-green-800" : "text-red-800"
                }`}
              >
                {message}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
