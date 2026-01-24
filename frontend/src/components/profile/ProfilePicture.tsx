"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/cropImage";

interface ProfilePictureUploaderProps {
currentProfilePicture: string;
userName: string;
onProfileChange: (newProfilePicture: string) => void;
size?: "sm" | "md" | "lg" | "xl" | "2xl";
showLabel?: boolean;
readOnly?: boolean;
}

export default function ProfilePictureUploader({
    currentProfilePicture,
    userName,
    onProfileChange,
    size = "md",
    showLabel = true,
    readOnly = false,
    }: ProfilePictureUploaderProps) {
        const [showCropper, setShowCropper] = useState(false);
        const [imageToCrop, setImageToCrop] = useState<string | null>(null);
        const [crop, setCrop] = useState({ x: 0, y: 0 });
        const [zoom, setZoom] = useState(1);
        const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

        const sizeClasses = {
            sm: "w-16 h-16",
            md: "w-24 h-24",
            lg: "w-32 h-32",
            xl: "w-40 h-40",
            "2xl": "w-48 h-48",
        } as const;

        const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            if (!file.type.startsWith("image/")) {
            alert("Please upload an image.");
            return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
            setImageToCrop(reader.result as string);
            setShowCropper(true);
            };
            reader.readAsDataURL(file);
        };

        const saveCroppedImage = async () => {
            try {
            const croppedImage = await getCroppedImg(imageToCrop!, croppedAreaPixels);
            onProfileChange(croppedImage);
            setShowCropper(false);
            } catch (err) {
            console.error(err);
            }
        };
        return (
        <>
        <div className="flex flex-col items-center gap-3">
            <Avatar className={`${sizeClasses[size]} border-4 border-gray-100`}>
            <AvatarImage src={currentProfilePicture} alt={userName} />
            <AvatarFallback className="text-2xl">{userName.charAt(0)}</AvatarFallback>
            </Avatar>
            {!readOnly && (
                <div className="flex flex-col items-center gap-2">
            <input
                type="file"
                accept="image/*"
                id="profileInput"
                onChange={handleProfileUpload}
                className="hidden"
            />

            <Button
                variant="outline"
                className="gap-2 cursor-pointer"
                onClick={() => document.getElementById("profileInput")?.click()}
                type="button"
            >
                <Camera className="h-4 w-4" />
                Upload Image
            </Button>
            {showLabel && (
                <p className="text-xs text-gray-500">JPG, PNG or GIF. Max 2MB.</p>
            )}
            </div>
            )}
        </div>

        {/* Cropper Modal */}
        {showCropper && imageToCrop && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-[90%] max-w-xl">
                <h2 className="text-lg font-semibold mb-4">Adjust your profile photo</h2>

                <div className="relative w-full h-64 bg-gray-200 rounded-xl overflow-hidden">
                <Cropper
                    image={imageToCrop}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(croppedArea, croppedPixels) =>
                    setCroppedAreaPixels(croppedPixels)
                    }
                />
                </div>

                <div className="mt-4 flex justify-between">
                <Button variant="outline" onClick={() => setShowCropper(false)} type="button" className="cursor-pointer">
                    Cancel
                </Button>
                <Button onClick={saveCroppedImage} type="button" className="cursor-pointer">Save</Button>
                </div>
            </div>
            </div>
        )}
        </>
    );
}