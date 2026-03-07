"use client";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Props {
  availability: string;
  language: string;
  mobility: string;
  onAvailabilityChange: (v: string) => void;
  onLanguageChange: (v: string) => void;
  onMobilityChange: (v: string) => void;
}

export default function AvailabilityLanguageMobilityFields({
  availability, language, mobility,
  onAvailabilityChange, onLanguageChange, onMobilityChange,
}: Props) {
  return (
    <div className="pb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="text-base font-medium text-gray-900">Availability</Label>
          <Select value={availability} onValueChange={onAvailabilityChange}>
            <SelectTrigger className="h-12 cursor-pointer">
              <SelectValue placeholder="Select availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anytime" className="cursor-pointer">Anytime</SelectItem>
              <SelectItem value="weekends" className="cursor-pointer">Weekends</SelectItem>
              <SelectItem value="weekdays" className="cursor-pointer">Weekdays</SelectItem>
              <SelectItem value="evenings" className="cursor-pointer">Evenings</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-medium text-gray-900">Spoken Language</Label>
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="h-12 cursor-pointer">
              <SelectValue placeholder="Preferred language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="french" className="cursor-pointer">French</SelectItem>
              <SelectItem value="english" className="cursor-pointer">English</SelectItem>
              <SelectItem value="bilingual" className="cursor-pointer">Bilingual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-medium text-gray-900">Mobility</Label>
          <Select value={mobility} onValueChange={onMobilityChange}>
            <SelectTrigger className="h-12 cursor-pointer">
              <SelectValue placeholder="Can you travel?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes" className="cursor-pointer">Yes</SelectItem>
              <SelectItem value="no" className="cursor-pointer">No</SelectItem>
              <SelectItem value="limited" className="cursor-pointer">Limited distance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
