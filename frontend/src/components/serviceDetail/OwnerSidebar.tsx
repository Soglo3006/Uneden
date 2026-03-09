"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface Props {
  confirmDelete: boolean;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onCancelDelete: () => void;
}

export default function OwnerSidebar({ confirmDelete, deleting, onEdit, onDelete, onCancelDelete }: Props) {
  const { t } = useTranslation();

  return (
    <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm space-y-3">
      <h3 className="font-semibold text-gray-900 mb-2">{t("serviceDetail.manageListing")}</h3>
      <Button
        className="w-full bg-green-700 hover:bg-green-800 text-white h-12 gap-2"
        onClick={onEdit}
      >
        {t("serviceDetail.editListing")}
      </Button>
      {confirmDelete ? (
        <div className="space-y-2">
          <p className="text-sm text-red-600 text-center font-medium">
            {t("serviceDetail.deleteConfirmWarning")}
          </p>
          <Button
            className="w-full bg-red-600 hover:bg-red-700 text-white h-11"
            onClick={onDelete}
            disabled={deleting}
          >
            {deleting ? t("serviceDetail.deleting") : t("serviceDetail.yesDeleteListing")}
          </Button>
          <Button variant="outline" className="w-full h-11" onClick={onCancelDelete}>
            {t("common.cancel")}
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full h-12 text-red-600 border-red-200 hover:bg-red-50 gap-2"
          onClick={onDelete}
        >
          {t("serviceDetail.deleteListing")}
        </Button>
      )}
      <Link href="/my-listings">
        <Button variant="outline" className="w-full h-11 mt-1">
          {t("serviceDetail.viewAllMyListings")}
        </Button>
      </Link>
    </div>
  );
}
