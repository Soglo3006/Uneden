"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { SubPageHeader } from "./SubPageHeader";
import { useTranslation } from "react-i18next";

interface Props {
  onBack: () => void;
  onClose: () => void;
}

export default function ChangePasswordPage({ onBack, onClose }: Props) {
  const { t } = useTranslation();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

  const validateForm = () => {
    const newErrors = { oldPassword: "", newPassword: "", confirmPassword: "" };
    if (!formData.oldPassword) newErrors.oldPassword = t("settings.passwordRequired");
    if (!formData.newPassword) newErrors.newPassword = t("settings.newPasswordRequired");
    else if (formData.newPassword.length < 8) newErrors.newPassword = t("settings.newPasswordMinLength");
    if (!formData.confirmPassword) newErrors.confirmPassword = t("settings.confirmPasswordRequired");
    else if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = t("settings.passwordsMismatch");
    if (formData.oldPassword === formData.newPassword) newErrors.newPassword = t("settings.passwordSameAsCurrent");
    setErrors(newErrors);
    return !Object.values(newErrors).some(e => e !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(false);
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ oldPassword: formData.oldPassword, newPassword: formData.newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || t("settings.passwordError"));
      setSuccess(true);
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => onBack(), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("settings.passwordError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50">
      <SubPageHeader title={t("settings.changePassword")} subtitle={t("settings.updatePassword")} onBack={onBack} onClose={onClose} />
      <div className="px-3 sm:px-4 py-4 sm:py-8">
        <Card className="p-4 sm:p-6">
          {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg"><p className="text-green-800 text-sm">{t("settings.passwordUpdated")}</p></div>}
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-red-800 text-sm">{error}</p></div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="oldPassword" className="pb-2 text-sm">{t("settings.currentPassword")}</Label>
              <Input id="oldPassword" type="password" value={formData.oldPassword}
                onChange={(e) => { setFormData({ ...formData, oldPassword: e.target.value }); setErrors({ ...errors, oldPassword: "" }); }}
                className={errors.oldPassword ? "border-red-500" : ""} disabled={loading} />
              {errors.oldPassword && <p className="text-xs text-red-500 mt-1">{errors.oldPassword}</p>}
            </div>
            <div>
              <Label htmlFor="newPassword" className="pb-2 text-sm">{t("settings.newPassword")}</Label>
              <Input id="newPassword" type="password" value={formData.newPassword}
                onChange={(e) => { setFormData({ ...formData, newPassword: e.target.value }); setErrors({ ...errors, newPassword: "" }); }}
                className={errors.newPassword ? "border-red-500" : ""} disabled={loading} />
              {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>}
              <p className="text-xs text-gray-500 mt-1">{t("settings.passwordMinLength")}</p>
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="pb-2 text-sm">{t("settings.confirmPassword")}</Label>
              <Input id="confirmPassword" type="password" value={formData.confirmPassword}
                onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); setErrors({ ...errors, confirmPassword: "" }); }}
                className={errors.confirmPassword ? "border-red-500" : ""} disabled={loading} />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>
            <Button type="submit" className="w-full bg-green-700 text-white hover:bg-green-800 cursor-pointer text-sm" disabled={loading}>
              {loading ? t("settings.updating") : t("settings.updatePassword")}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
