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
    `input input-bordered w-full ${
      errors[name as keyof typeof errors] ? "input-error border-red-500" : ""
    }`;

  const selectClass = (name: string) =>
    `select select-bordered w-full ${
      errors[name as keyof typeof errors] ? "border-red-500" : ""
    }`;

  const errorText = (name: string) =>
    errors[name as keyof typeof errors] ? (
      <span className="text-red-500 text-sm mt-1">
        {errors[name as keyof typeof errors]}
      </span>
    ) : null;

  return (
    <div className="min-h-[85vh] flex items-start md:items-center justify-center px-4 py-10 bg-gradient-to-br from-purple-50 to-yellow-50">
      <div className="w-full max-w-xl">
        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <h1 className="text-2xl font-bold">
              International Application Registration
            </h1>
            <p className="text-white/80 text-sm">
              Please fill in your details accurately
            </p>
          </div>

          {/* JSON Form - single column */}
          <form onSubmit={handleJsonSubmit} className="px-6 py-6 space-y-4">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="label" htmlFor="firstName">
                  <span className="label-text">First Name *</span>
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

              <div className="md:col-span-1">
                <label className="label" htmlFor="middleName">
                  <span className="label-text">Middle Name</span>
                </label>
                <input
                  id="middleName"
                  name="middleName"
                  type="text"
                  placeholder="Middle name (optional)"
                  className="input input-bordered w-full"
                />
              </div>

              <div className="md:col-span-1">
                <label className="label" htmlFor="lastName">
                  <span className="label-text">Last Name *</span>
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
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="phoneNumber">
                  <span className="label-text">Phone Number *</span>
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="+254... or 07..."
                  className={inputClass("phoneNumber")}
                />
                {errorText("phoneNumber")}
              </div>

              <div>
                <label className="label" htmlFor="email">
                  <span className="label-text">Email *</span>
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
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label" htmlFor="dob">
                  <span className="label-text">Date of Birth *</span>
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
                <label className="label" htmlFor="nationality">
                  <span className="label-text">Nationality *</span>
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
                <label className="label" htmlFor="religion">
                  <span className="label-text">Religion *</span>
                </label>
                <input
                  id="religion"
                  name="religion"
                  type="text"
                  placeholder="Religion"
                  className={inputClass("religion")}
                />
                {errorText("religion")}
              </div>
            </div>

            {/* Marital Status and Kids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="maritalStatus">
                  <span className="label-text">Marital Status *</span>
                </label>
                <select
                  id="maritalStatus"
                  name="maritalStatus"
                  defaultValue=""
                  className={selectClass("maritalStatus")}
                >
                  <option disabled value="">
                    Select marital status
                  </option>
                  <option value="SINGLE">Single</option>
                  <option value="MARRIED">Married</option>
                </select>
                {errorText("maritalStatus")}
              </div>

              <div>
                <label className="label" htmlFor="numberOfKids">
                  <span className="label-text">Number of Kids</span>
                </label>
                <input
                  id="numberOfKids"
                  name="numberOfKids"
                  type="number"
                  placeholder="Number of kids (optional)"
                  className="input input-bordered w-full"
                  min="0"
                />
              </div>
            </div>

            {/* Education and Employment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="educationLevel">
                  <span className="label-text">Education Level *</span>
                </label>
                <select
                  id="educationLevel"
                  name="educationLevel"
                  defaultValue=""
                  className={selectClass("educationLevel")}
                >
                  <option disabled value="">
                    Select education level
                  </option>
                  <option value="PRIMARY">Primary</option>
                  <option value="SECONDARY">Secondary</option>
                  <option value="UNIVERSITY">University</option>
                </select>
                {errorText("educationLevel")}
              </div>

              <div>
                <label className="label" htmlFor="employmentStatus">
                  <span className="label-text">Employment Status *</span>
                </label>
                <select
                  id="employmentStatus"
                  name="employmentStatus"
                  defaultValue=""
                  className={selectClass("employmentStatus")}
                >
                  <option disabled value="">
                    Select employment status
                  </option>
                  <option value="EMPLOYED">Employed</option>
                  <option value="NOT_EMPLOYED">Not Employed</option>
                </select>
                {errorText("employmentStatus")}
              </div>
            </div>

            {/* Current Job Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label" htmlFor="currentProfession">
                  <span className="label-text">Current Profession</span>
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
                <label className="label" htmlFor="currentSalary">
                  <span className="label-text">Current Salary (KES)</span>
                </label>
                <input
                  id="currentSalary"
                  name="currentSalary"
                  type="number"
                  placeholder="Current salary"
                  className="input input-bordered w-full"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="label" htmlFor="currentLocation">
                  <span className="label-text">Current Location</span>
                </label>
                <input
                  id="currentLocation"
                  name="currentLocation"
                  type="text"
                  placeholder="Current location"
                  className="input input-bordered w-full"
                />
              </div>
            </div>

            {/* Job Recruitment Category */}
            <div>
              <label className="label" htmlFor="jobRecruitment">
                <span className="label-text">Job Category *</span>
              </label>
              <select
                id="jobRecruitment"
                name="jobRecruitment"
                defaultValue=""
                className={selectClass("jobRecruitment")}
              >
                <option disabled value="">
                  Select job category
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
                <option value="HOTEL_HOSPITALITY">Hotel & Hospitality</option>
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

            {/* Languages */}
            <div>
              <label className="label">
                <span className="label-text">Languages Spoken *</span>
              </label>
              <div className="flex flex-wrap gap-4 p-3 rounded-lg border border-gray-200">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="languages"
                    value="ENGLISH"
                    className="checkbox checkbox-primary"
                  />
                  English
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="languages"
                    value="KISWAHILI"
                    className="checkbox checkbox-primary"
                  />
                  Kiswahili
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="languages"
                    value="ARABIC"
                    className="checkbox checkbox-primary"
                  />
                  Arabic
                </label>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="pt-6 border-t">
              <h2 className="text-lg font-semibold text-purple-800 mb-4">
                Required Documents
              </h2>

              <div className="space-y-4">
                {/* Passport Photo */}
                <div className="form-control">
                  <label htmlFor="passportPhoto" className="label">
                    <span className="label-text font-medium">
                      Passport Photo *
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
                <div className="form-control">
                  <label htmlFor="fullBodyPhoto" className="label">
                    <span className="label-text font-medium">
                      Full Body Photo *
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
                <div className="form-control">
                  <label htmlFor="idPhoto" className="label">
                    <span className="label-text font-medium">
                      National ID (Both Sides) *
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
                <div className="form-control">
                  <label htmlFor="resume" className="label">
                    <span className="label-text font-medium">
                      Resume / CV *
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
                <div className="form-control">
                  <label htmlFor="birthCertificate" className="label">
                    <span className="label-text font-medium">
                      Birth Certificate *
                    </span>
                  </label>
                  <input
                    id="birthCertificate"
                    name="birthCertificate"
                    type="file"
                    accept=".doc,.docx,.pdf,image/*"
                    className="file-input file-input-bordered w-full"
                  />
                  {errorText("birthCertificate")}
                </div>

                {/* Certificate of Good Conduct */}
                <div className="form-control">
                  <label htmlFor="goodConduct" className="label">
                    <span className="label-text font-medium">
                      Certificate of Good Conduct *
                    </span>
                  </label>
                  <input
                    id="goodConduct"
                    name="goodConduct"
                    type="file"
                    accept=".doc,.docx,.pdf,image/*"
                    className="file-input file-input-bordered w-full"
                  />
                  {errorText("goodConduct")}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="btn w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
            </div>
          </form>
        </div>

        {message && (
          <div
            className={`text-center mt-4 p-3 rounded-lg ${
              message.includes("✅")
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
