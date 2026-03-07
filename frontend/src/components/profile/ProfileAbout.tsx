"use client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users } from "lucide-react";

interface Props {
  profileUser: any;
  isPerson: boolean;
  isCompany: boolean;
  skills: string[];
  languages: any[];
  memberSince: string;
}

export default function ProfileAbout({ profileUser, isPerson, isCompany, skills, languages, memberSince }: Props) {
  if (!profileUser.bio) return null;

  return (
    <Card className="p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {isPerson ? "About Me" : "About Our Company"}
      </h2>
      <p className="text-gray-700 leading-relaxed mb-6 break-words">{profileUser.bio}</p>
      <Separator className="my-4" />

      <div className="grid md:grid-cols-2 gap-6">
        {skills.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {isPerson ? "Skills" : "Services Offered"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: string, i: number) => (
                <Badge key={i} variant="secondary" className="bg-green-100 text-green-700">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {languages.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {isPerson ? "Languages I Speak" : "Languages Supported"}
            </h3>
            <p className="text-gray-700">
              {languages
                .map((lang: any) =>
                  typeof lang === "string" ? lang : `${lang.language} (${lang.proficiency})`
                )
                .join(", ")}
            </p>
          </div>
        )}

        {isCompany && profileUser.team_size && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Team Size</h3>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-500" />
              <p className="text-gray-700">{profileUser.team_size}</p>
            </div>
          </div>
        )}

        {isPerson && profileUser.profession && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Profession</h3>
            <p className="text-gray-700">{profileUser.profession}</p>
          </div>
        )}

        {isCompany && profileUser.industry && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Industry</h3>
            <p className="text-gray-700">{profileUser.industry}</p>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            {isPerson ? "Member Since" : "Established On"}
          </h3>
          <p className="text-gray-700">{memberSince}</p>
        </div>
      </div>
    </Card>
  );
}
