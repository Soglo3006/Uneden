import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link"
import {
ChevronRight,
ShieldAlert,
UserRoundPlus,
} from "lucide-react";

export default function EllipsisPage({onClose}) {

return (
<div className="w-full bg-gray-50">
    <div className="bg-white border-b relative">
        <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-900 text-xl absolute top-4 right-4 cursor-pointer"
        >
        ✕
        </button>
    <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile Actions</h1>
    </div>
    </div>


    <div className="max-w-5xl mx-auto px-4 py-8">
    <div className="grid gap-6">

        <Card className="p-6">
        <div className="flex items-start justify-between ">
            <div className="flex items-center gap-4">
            <ShieldAlert className="h-6 w-6 text-green-700" />
            <div>
            <h2 className="text-xl font-bold text-gray-900">Report Safety</h2>
            </div>
            </div>
        </div>

        <div className="space-y-4">

            <Button variant="outline" className="w-full justify-between cursor-pointer">
            <span>Report User</span>
            <ChevronRight className="h-4 w-4" />
            </Button>

            <Button variant="outline" className="w-full justify-between cursor-pointer">
            <span>Report Listing</span>
            <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
            variant="outline"
            className="w-full justify-between border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
            >
            <span className="flex items-center gap-2">
                Block User
            </span>
            <ChevronRight className="h-4 w-4" />
            </Button>

        </div>
        </Card>

        <Card className="p-6">
        <div className="flex items-start justify-between ">
            <div className="flex items-center gap-4">
                <UserRoundPlus  className="h-6 w-6 text-green-700" />
            <div>
                <h2 className="text-xl font-bold text-gray-900">Profile</h2>
            </div>
            </div>
        </div>

        <div className="space-y-4">

            <Button variant="outline" className="w-full justify-between cursor-pointer">
            <span>Share profile</span>
            <ChevronRight className="h-4 w-4" />
            </Button>

            <Button variant="outline" className="w-full justify-between cursor-pointer">
            <span>Copy Profile Link</span>
            <ChevronRight className="h-4 w-4" />
            </Button>

        </div>
        </Card>

    </div>
    </div>
</div>
);
}