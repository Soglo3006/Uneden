import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";
import {
  ChevronRight,
  ShieldAlert,
  UserRoundPlus,
  ArrowLeft
} from "lucide-react";

export default function EllipsisPage({ onClose }) {
  const [screen, setScreen] = useState("default"); 

  return (
    <div className="w-full bg-gray-50">
      <div className="bg-white border-b relative">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-900 text-xl absolute top-4 right-4 cursor-pointer"
        >
          ✕
        </button>

        {screen !== "default" && (
          <button
            onClick={() => setScreen("default")}
            className="text-gray-600 hover:text-gray-900 text-sm absolute top-1 left-4 flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}

        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {screen === "default" && "Profile Options"}
            {screen === "reportUser" && "Report User"}
            {screen === "reportListing" && "Report Listing"}
            {screen === "blockUser" && "Block User"}
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {screen === "default" && <DefaultMenu setScreen={setScreen} />}
        {screen === "reportUser" && <ReportUserPage setScreen={setScreen} />}
        {screen === "reportListing" && <ReportListingPage setScreen={setScreen} />}
        {screen === "blockUser" && <BlockUserPage setScreen={setScreen} />}
      </div>
    </div>
  );
}

function DefaultMenu({ setScreen }) {
  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <ShieldAlert className="h-6 w-6 text-green-700" />
            <h2 className="text-xl font-bold text-gray-900">Report Safety</h2>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-between cursor-pointer"
            onClick={() => setScreen("reportUser")} 
          >
            <span>Report User</span>
            <ChevronRight />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between cursor-pointer"
            onClick={() => setScreen("reportListing")} 
          >
            <span>Report Listing</span>
            <ChevronRight />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
            onClick={() => setScreen("blockUser")} 
          >
            <span>Block User</span>
            <ChevronRight />
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <UserRoundPlus className="h-6 w-6 text-green-700" />
            <h2 className="text-xl font-bold text-gray-900">Profile</h2>
          </div>
        </div>

        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-between cursor-pointer">
            <span>Share Profile</span>
            <ChevronRight />
          </Button>

          <Button variant="outline" className="w-full justify-between cursor-pointer">
            <span>Copy Profile Link</span>
            <ChevronRight />
          </Button>
        </div>
      </Card>
    </div>
  );
}

function ReportUserPage() {
  return (
    <Card className="px-6 pt-6">
      <p className="text-gray-600">
        Tell us why you want to report this user.
      </p>

      <div className="">
        <label className="text-sm font-medium text-gray-700">Reason</label>

        <Select>
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="inappropriate" className="cursor-pointer">Inappropriate behavior</SelectItem>
            <SelectItem value="fraud" className="cursor-pointer">Fraud / Scam attempt</SelectItem>
            <SelectItem value="harassment" className="cursor-pointer">Harassment</SelectItem>
            <SelectItem value="spam" className="cursor-pointer">Spam</SelectItem>
            <SelectItem value="fake" className="cursor-pointer">Fake profile</SelectItem>
            <SelectItem value="other" className="cursor-pointer">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="">
        <label className="text-sm font-medium text-gray-700">Details</label>
        <Textarea
          placeholder="Describe the issue..."
          className="min-h-[120px] resize-none"
        />
      </div>

      <Button className="w-full bg-green-700 hover:bg-green-800 text-white cursor-pointer">
        Submit Report
      </Button>
    </Card>
  );
}


function ReportListingPage() {
  return (
    <Card className="px-6 pt-6">
      <p className="text-gray-600">
        Tell us what is wrong with this listing.
      </p>

      <div className="">
        <label className="text-sm font-medium text-gray-700">Reason</label>

        <Select>
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="misleading" className="cursor-pointer">Misleading Information</SelectItem>
            <SelectItem value="price" className="cursor-pointer">Wrong Price</SelectItem>
            <SelectItem value="illegal" className="cursor-pointer">Illegal Service</SelectItem>
            <SelectItem value="offensive" className="cursor-pointer">Offensive Content</SelectItem>
            <SelectItem value="scam" className="cursor-pointer">Scam</SelectItem>
            <SelectItem value="other" className="cursor-pointer">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="">
        <label className="text-sm font-medium text-gray-700">Details</label>

        <Textarea
          placeholder="Describe the problem..."
          className="min-h-[120px] resize-none"
        />
      </div>

      <Button className="w-full bg-green-700 hover:bg-green-800 text-white cursor-pointer">
        Submit Report
      </Button>
    </Card>
  );
}


function BlockUserPage() {
  return (
    <Card className="p-6">
        <p className="text-gray-700 font-bold text-3xl justify-center flex">
        Are you sure you want to block this user?
      </p>
      <p className="text-gray-700">
        Blocking this user will prevent them from contacting you, viewing your
        profile, or interacting with you.
      </p>

      <Button className="w-full bg-red-600 hover:bg-red-700 text-white cursor-pointer">
        Confirm Block
      </Button>
    </Card>
  );
}
