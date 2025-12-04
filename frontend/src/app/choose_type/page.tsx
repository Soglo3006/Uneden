"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { UserPen, Building2 } from "lucide-react";

export default function ChooseTypePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <Card className="p-6 sm:p-8 max-w-lg w-full animate-in fade-in duration-300">
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
          Are you creating a Personal or Company account?
        </h2>

        <div className="grid sm:grid-cols-2 gap-4 mt-6">

          <Link href="/profile/complete_profil?type=person" className="block">
            <div className="h-full cursor-pointer border rounded-xl p-6 flex flex-col items-center gap-3 transition-all hover:border-green-600 hover:bg-green-50">
              <UserPen className="h-10 w-10 text-green-700" />
              <h3 className="text-lg font-semibold text-gray-900">Personal Account</h3>
              <p className="text-sm text-gray-500 text-center">
                Ideal for individuals offering services.
              </p>
            </div>
          </Link>

          <Link href="/profile/complete_profil?type=company" className="block">
            <div className="h-full cursor-pointer border rounded-xl p-6 flex flex-col items-center gap-3 transition-all hover:border-green-600 hover:bg-green-50">
              <Building2 className="h-10 w-10 text-green-700" />
              <h3 className="text-lg font-semibold text-gray-900">Company Account</h3>
              <p className="text-sm text-gray-500 text-center">
                Perfect for businesses managing multiple services.
              </p>
            </div>
          </Link>

        </div>
      </Card>
    </div>
  );
}
