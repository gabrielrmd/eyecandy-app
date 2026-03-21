"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Building2,
  Briefcase,
  Bell,
  FileText,
  Rocket,
  Calendar,
  Camera,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Trash2,
} from "lucide-react";

const INDUSTRIES = [
  "Technology / SaaS",
  "E-commerce / Retail",
  "Healthcare / Wellness",
  "Finance / Fintech",
  "Education / EdTech",
  "Real Estate",
  "Food & Beverage",
  "Professional Services",
  "Manufacturing",
  "Travel & Hospitality",
  "Media & Entertainment",
  "Nonprofit / NGO",
  "Fashion & Beauty",
  "Automotive",
  "Other",
];

export default function AccountPage() {
  const [firstName, setFirstName] = useState("Alex");
  const [lastName, setLastName] = useState("Morgan");
  const [email, setEmail] = useState("alex@example.com");
  const [companyName, setCompanyName] = useState("Acme Corp");
  const [industry, setIndustry] = useState("Technology / SaaS");

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    weeklyDigest: true,
    templateReleases: false,
    challengeReminders: true,
  });

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 1200);
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-navy sm:text-3xl">
          Account Settings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile, preferences, and notifications.
        </p>

        {/* Profile section */}
        <section className="mt-8">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-navy">
              Profile
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Your personal and company information.
            </p>

            {/* Avatar */}
            <div className="mt-6 flex items-center gap-4">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-xl font-bold text-white">
                  {firstName.charAt(0)}
                  {lastName.charAt(0)}
                </div>
                <button
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-coral text-white transition-colors hover:bg-coral/90"
                  title="Upload avatar"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Profile photo
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or GIF. Max 2MB.
                </p>
              </div>
            </div>

            {/* Form fields */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="first-name"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  First name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <input
                    id="first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="last-name"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Last name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <input
                    id="last-name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="company"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Company name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <input
                    id="company"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="industry"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Industry
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <select
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Notification preferences */}
        <section className="mt-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-navy">
              Notification Preferences
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Choose what notifications you receive.
            </p>

            <div className="mt-6 space-y-4">
              {[
                {
                  key: "emailNotifications" as const,
                  icon: Bell,
                  title: "Email notifications",
                  description: "Receive important updates and activity alerts via email",
                },
                {
                  key: "weeklyDigest" as const,
                  icon: FileText,
                  title: "Weekly digest",
                  description: "A summary of your progress and platform updates each week",
                },
                {
                  key: "templateReleases" as const,
                  icon: Rocket,
                  title: "New template releases",
                  description: "Get notified when new marketing templates are added",
                },
                {
                  key: "challengeReminders" as const,
                  icon: Calendar,
                  title: "Challenge reminders",
                  description: "Reminders to complete your weekly challenge tasks",
                },
              ].map((pref) => {
                const Icon = pref.icon;
                const isOn = notifications[pref.key];
                return (
                  <div
                    key={pref.key}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {pref.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pref.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleNotification(pref.key)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-coral/20 focus:ring-offset-2 ${
                        isOn ? "bg-coral" : "bg-muted"
                      }`}
                      role="switch"
                      aria-checked={isOn}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform ${
                          isOn ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Save button */}
        <div className="mt-6 flex items-center justify-end gap-3">
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Changes saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="flex items-center gap-2 rounded-lg bg-coral px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral/90 disabled:opacity-60"
          >
            {saveStatus === "saving" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* Danger zone */}
        <section className="mt-10">
          <div className="rounded-xl border border-destructive/30 bg-card p-6">
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-destructive">
              Danger Zone
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Irreversible actions. Please proceed with caution.
            </p>

            <div className="mt-4 flex items-center justify-between rounded-lg border border-destructive/20 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Delete account
                </p>
                <p className="text-xs text-muted-foreground">
                  Permanently delete your account, strategies, and all
                  associated data. This cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="shrink-0 rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                <span className="flex items-center gap-1.5">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </span>
              </button>
            </div>

            {/* Delete confirmation */}
            {showDeleteConfirm && (
              <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      Are you sure? This action is irreversible.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      All your strategies, templates, challenge progress, and
                      account data will be permanently deleted.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        Cancel
                      </button>
                      <button className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90">
                        Yes, delete my account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
