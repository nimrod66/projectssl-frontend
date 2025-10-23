"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type ErrorMap = Record<string, string | undefined>;

export default function SslRegistrationForm() {
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
    `input input-bordered w-full ${
      errors[name] ? "input-error border-red-500" : ""
    }`;
  const selectClass = (name: string) =>
    `select select-bordered w-full ${errors[name] ? "border-red-500" : ""}`;
  const errorText = (name: string) =>
    errors[name] ? (
      <p className="mt-1 text-xs text-red-600">{errors[name]}</p>
    ) : null;

  return (
    <div className="min-h-[85vh] flex items-start md:items-center justify-center px-4 py-10 bg-gradient-to-br from-purple-50 to-yellow-50">
      <div className="w-full max-w-xl">
        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <h1 className="text-2xl font-bold">Application Registration</h1>
            <p className="text-white/80 text-sm">
              Please fill in your details accurately
            </p>
          </div>

          {/* JSON Form - single column */}
          <form onSubmit={handleJsonSubmit} className="px-6 py-6 space-y-4">
            <div>
              <label className="sr-only" htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First name"
                className={inputClass("firstName")}
              />
              {errorText("firstName")}
            </div>
            <div>
              <label className="sr-only" htmlFor="middleName">
                Middle Name
              </label>
              <input
                id="middleName"
                name="middleName"
                type="text"
                placeholder="Middle name (optional)"
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last name"
                className={inputClass("lastName")}
              />
              {errorText("lastName")}
            </div>
            <div>
              <label className="sr-only" htmlFor="phoneNumber">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="Phone number"
                className={inputClass("phoneNumber")}
              />
              {errorText("phoneNumber")}
            </div>
            <div>
              <label className="sr-only" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                className={inputClass("email")}
              />
              {errorText("email")}
            </div>
            <div>
              <label className="sr-only" htmlFor="dob">
                Date of Birth
              </label>
              <input
                id="dob"
                name="dob"
                type="date"
                placeholder="DOB"
                className={inputClass("dob")}
              />
              {errorText("dob")}
            </div>
            <div>
              <label className="sr-only" htmlFor="nationality">
                Nationality
              </label>
              <input
                id="nationality"
                name="nationality"
                type="text"
                placeholder="Nationality"
                className={inputClass("nationality")}
              />
              {errorText("nationality")}
            </div>
            <div>
              <label className="sr-only" htmlFor="experience">
                Experience
              </label>
              <input
                id="experience"
                name="experience"
                type="text"
                placeholder="Experience (e.g. 3 years housekeeping)"
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="currentSalary">
                Current Salary
              </label>
              <input
                id="currentSalary"
                name="currentSalary"
                type="text"
                placeholder="Current salary"
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="currentProfession">
                Current Profession
              </label>
              <input
                id="currentProfession"
                name="currentProfession"
                type="text"
                placeholder="Current profession"
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="currentLocation">
                Current Location
              </label>
              <input
                id="currentLocation"
                name="currentLocation"
                type="text"
                placeholder="Current location"
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="employmentStatus">
                Employment Status
              </label>
              <select
                id="employmentStatus"
                name="employmentStatus"
                defaultValue=""
                className={selectClass("employmentStatus")}
              >
                <option disabled value="">
                  Employment status
                </option>
                <option value="EMPLOYED">Employed</option>
                <option value="NOT_EMPLOYED">Unemployed</option>
              </select>
              {errorText("employmentStatus")}
            </div>
            <div>
              <label className="sr-only" htmlFor="jobInterest">
                Job Interest
              </label>
              <select
                id="jobInterest"
                name="jobInterest"
                defaultValue=""
                className={selectClass("jobInterest")}
              >
                <option disabled value="">
                  Job interest
                </option>
                <option value="LOCAL_JOBS">Local Jobs</option>
                <option value="INTERNATIONAL_JOBS">International Jobs</option>
              </select>
              {errorText("jobInterest")}
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-1">
                Languages
              </span>
              <div className="flex flex-wrap gap-3 p-3 rounded-lg border border-gray-200">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="languages"
                    value="ENGLISH"
                    className="checkbox checkbox-primary checkbox-sm"
                  />
                  English
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="languages"
                    value="KISWAHILI"
                    className="checkbox checkbox-primary checkbox-sm"
                  />
                  Kiswahili
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="languages"
                    value="ARABIC"
                    className="checkbox checkbox-primary checkbox-sm"
                  />
                  Arabic
                </label>
              </div>
              {/* Skills Section */}
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  Skills & Specialities
                </span>
                {/*Elderly Care or Special Needs, Babies Older than 1 year or Younger than 1 year*/}
                <div className="flex flex-wrap gap-3 p-3 rounded-lg border border-gray-200">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="elderlyCare"
                      value="true"
                      className="checkbox checkbox-primary checkbox-sm"
                    />
                    Elderly Care
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="specialNeeds"
                      value="true"
                      className="checkbox checkbox-primary checkbox-sm"
                    />
                    Special Needs
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="olderThan1"
                      value="true"
                      className="checkbox checkbox-primary checkbox-sm"
                    />
                    Babies older than 1 year
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="youngerThan1"
                      value="true"
                      className="checkbox checkbox-primary checkbox-sm"
                    />
                    Babies younger than 1 year
                  </label>
                </div>
              </div>

              {/* Other Booleans Section */}
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Preferences
                </span>
                {/*Does the employer have the following animals */}
                <div className="flex flex-wrap gap-3 p-3 rounded-lg border border-gray-200">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="hasCat"
                      value="true"
                      className="checkbox checkbox-primary checkbox-sm"
                    />
                    Cats
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="hasDog"
                      value="true"
                      className="checkbox checkbox-primary checkbox-sm"
                    />
                    Dogs
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="extraPay"
                      value="true"
                      className="checkbox checkbox-primary checkbox-sm"
                    />
                    Extra Pay for Overtime
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="liveOut"
                      value="true"
                      className="checkbox checkbox-primary checkbox-sm"
                    />
                    Live Out
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="privateRoom"
                      value="true"
                      className="checkbox checkbox-primary checkbox-sm"
                    />
                    Private Maid Room
                  </label>
                </div>
              </div>
            </div>
            {/* File Upload Section */}
            <div className="pt-4">
              <h2 className="text-lg font-semibold text-purple-800">
                Upload Files
              </h2>
              <p className="text-sm text-gray-600">
                Attach your photos and resume to complete your application.
              </p>
            </div>
            {/* Passport Photo */}
            <div className="form-control w-full">
              <label htmlFor="passportPhoto" className="label">
                <span className="label-text text-purple-800 font-medium">
                  Passport Photo
                </span>
                <span className="label-text-alt text-gray-500">
                  Clear headshot photo
                </span>
              </label>
              <input
                id="passportPhoto"
                name="passportPhoto"
                type="file"
                accept="image/*"
                className="file-input file-input-bordered w-full"
              />
              {errorText("passportPhoto")}
            </div>

            {/* Full Body Photo */}
            <div className="form-control w-full mt-3">
              <label htmlFor="fullBodyPhoto" className="label">
                <span className="label-text text-purple-800 font-medium">
                  Full Body Photo
                </span>
                <span className="label-text-alt text-gray-500">
                  Full-length photo
                </span>
              </label>
              <input
                id="fullBodyPhoto"
                name="fullBodyPhoto"
                type="file"
                accept="image/*"
                className="file-input file-input-bordered w-full"
              />
              {errorText("fullBodyPhoto")}
            </div>

            {/* National ID */}
            <div className="form-control w-full mt-3">
              <label
                className="flex flex-col lg:flex-row lg:items-center lg:gap-2"
                htmlFor="idPhoto"
              >
                {" "}
                <span className="label-text text-purple-800 font-medium">
                  National ID (Both Sides)
                </span>
                <span className="label-text-alt text-gray-500">
                  Front & back in one file.
                </span>
              </label>
              <input
                id="idPhoto"
                name="idPhoto"
                type="file"
                accept="image/*"
                className="file-input file-input-bordered w-full"
              />
              {errorText("idPhoto")}
            </div>

            {/* Resume */}
            <div className="form-control w-full mt-3">
              <label
                className="flex flex-col lg:flex-row lg:items-center lg:gap-2"
                htmlFor="resume"
              >
                <span className="label-text text-purple-800 font-medium">
                  Resume / CV
                </span>
                <span className="label-text-alt text-gray-500">
                  Accepted formats: PDF, DOC, DOCX
                </span>
              </label>
              <input
                id="resume"
                name="resume"
                type="file"
                accept=".doc,.docx,.pdf"
                className="file-input file-input-bordered w-full"
              />
              {errorText("resume")}
            </div>
            {/* Birth Certificate */}
            <div className="form-control w-full mt-3">
              <label
                className="flex flex-col lg:flex-row lg:items-center lg:gap-2"
                htmlFor="birthCertificate"
              >
                <span className="label-text text-purple-800 font-medium">
                  Birth Certificate
                </span>
                <span className="label-text-alt text-gray-500">
                  Accepted formats: PDF, DOC, DOCX
                </span>
              </label>
              <input
                id="birthCertificate"
                name="birthCertificate"
                type="file"
                accept=".doc,.docx,.pdf"
                className="file-input file-input-bordered w-full"
              />
              {errorText("birthCertificate")}
            </div>

            {/* Certificate of Good Conduct */}
            <div className="form-control w-full mt-3">
              <label
                className="flex flex-col lg:flex-row lg:items-center lg:gap-2"
                htmlFor="goodConduct"
              >
                {" "}
                <span className="label-text text-purple-800 font-medium">
                  Certificate of Good Conduct
                </span>
                <span className="label-text-alt text-gray-500">
                  Accepted formats: PDF, DOC, DOCX
                </span>
              </label>
              <input
                id="goodConduct"
                name="goodConduct"
                type="file"
                accept=".doc,.docx,.pdf"
                className="file-input file-input-bordered w-full"
              />
              {errorText("goodConduct")}
            </div>
            <br></br>
            <button
              type="submit"
              className="btn w-full bg-yellow-400 text-purple-800 hover:bg-yellow-500 font-semibold"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
        {message && (
          <p className="text-center mt-4 text-sm text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}
