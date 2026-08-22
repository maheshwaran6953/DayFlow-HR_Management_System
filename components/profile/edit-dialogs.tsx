"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError, updateOwnContactInfo, updateProfile } from "@/lib/api";
import type { ContactPatch, Employee } from "@/types";

interface EditContactDialogProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (updated: Employee) => void;
}

/**
 * Self-service edit: employees may only change phone, address and picture.
 */
export function EditContactDialog({
  employee,
  open,
  onOpenChange,
  onSaved,
}: EditContactDialogProps) {
  const [phone, setPhone] = React.useState(employee.personal.phone);
  const [address, setAddress] = React.useState(employee.personal.address);
  const [avatarUrl, setAvatarUrl] = React.useState(employee.avatarUrl ?? "");
  const [busy, setBusy] = React.useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const patch: ContactPatch = { phone, address, avatarUrl };
      const updated = await updateOwnContactInfo(employee.id, patch);
      toast.success("Contact details updated.");
      onOpenChange(false);
      onSaved(updated);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save changes.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit contact info</DialogTitle>
          <DialogDescription>
            You can update your phone number, address and profile picture. Other
            fields are managed by HR.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="contact-phone">Phone</Label>
            <Input
              id="contact-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="contact-address">Address</Label>
            <Input
              id="contact-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="contact-avatar">Profile picture URL</Label>
            <Input
              id="contact-avatar"
              type="url"
              placeholder="https://…"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Paste an image link (uploads need the real backend).
            </p>
          </div>
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract"] as const;

interface EditPersonalDialogProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (updated: Employee) => void;
}

/** Admin-only personal details editor (covers every personal field). */
export function EditPersonalDialog({
  employee,
  open,
  onOpenChange,
  onSaved,
}: EditPersonalDialogProps) {
  const [name, setName] = React.useState(employee.name);
  const [email, setEmail] = React.useState(employee.email);
  const [dateOfBirth, setDateOfBirth] = React.useState(employee.personal.dateOfBirth);
  const [gender, setGender] = React.useState(employee.personal.gender);
  const [phone, setPhone] = React.useState(employee.personal.phone);
  const [address, setAddress] = React.useState(employee.personal.address);
  const [avatarUrl, setAvatarUrl] = React.useState(employee.avatarUrl ?? "");
  const [busy, setBusy] = React.useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const updated = await updateProfile(employee.id, {
        name,
        email,
        avatarUrl: avatarUrl === "" ? null : avatarUrl,
        personal: { dateOfBirth, gender, phone, address },
      });
      toast.success("Profile updated.");
      onOpenChange(false);
      onSaved(updated);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save changes.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit personal details</DialogTitle>
          <DialogDescription>Admin/HR only.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="personal-name">Full name</Label>
            <Input
              id="personal-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="personal-email">Email</Label>
            <Input
              id="personal-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="personal-dob">Date of birth</Label>
            <Input
              id="personal-dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="personal-gender">Gender</Label>
            <Input
              id="personal-gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="personal-phone">Phone</Label>
            <Input
              id="personal-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="personal-address">Address</Label>
            <Input
              id="personal-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="col-span-full flex flex-col gap-1.5">
            <Label htmlFor="personal-avatar">Profile picture URL</Label>
            <Input
              id="personal-avatar"
              type="url"
              placeholder="https://…"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>
          <DialogFooter className="col-span-full mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface EditJobDialogProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (updated: Employee) => void;
}

/** Admin-only job details editor. */
export function EditJobDialog({
  employee,
  open,
  onOpenChange,
  onSaved,
}: EditJobDialogProps) {
  const [form, setForm] = React.useState(employee.job);
  const [busy, setBusy] = React.useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const updated = await updateProfile(employee.id, { job: form });
      toast.success("Job details updated.");
      onOpenChange(false);
      onSaved(updated);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save changes.");
    } finally {
      setBusy(false);
    }
  }

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit job details</DialogTitle>
          <DialogDescription>Admin/HR only.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="job-designation">Designation</Label>
            <Input
              id="job-designation"
              value={form.designation}
              onChange={(e) => set("designation", e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="job-department">Department</Label>
            <Input
              id="job-department"
              value={form.department}
              onChange={(e) => set("department", e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Employment type</Label>
            <Select<(typeof EMPLOYMENT_TYPES)[number]>
              value={form.employmentType}
              onValueChange={(v) => {
                if (v) set("employmentType", v);
              }}
              items={EMPLOYMENT_TYPES.map((t) => ({ value: t, label: t }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="job-joined">Joined on</Label>
            <Input
              id="job-joined"
              type="date"
              value={form.joinedOn}
              onChange={(e) => set("joinedOn", e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="job-manager">Reporting manager</Label>
            <Input
              id="job-manager"
              value={form.reportingManager}
              onChange={(e) => set("reportingManager", e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="job-location">Work location</Label>
            <Input
              id="job-location"
              value={form.workLocation}
              onChange={(e) => set("workLocation", e.target.value)}
              required
            />
          </div>
          <DialogFooter className="col-span-full mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
