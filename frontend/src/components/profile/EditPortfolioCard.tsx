"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Camera, Plus, X } from "lucide-react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/cropImage";

interface PortfolioItem {
  id: number;
  image: string;
  title: string;
}

interface Props {
  portfolio: PortfolioItem[];
  isPerson: boolean;
  onAdd: (item: PortfolioItem) => void;
  onRemove: (id: number) => void;
}

export default function EditPortfolioCard({ portfolio, isPerson, onAdd, onRemove }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState<any>(null);
  const [error, setError] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please upload an image."); return; }
    if (file.size > 5 * 1024 * 1024) { alert("File size must be less than 5MB."); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setTitle("");
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedPixels(null);
      setShowModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!image || !title.trim()) { setError(true); return; }
    try {
      const cropped = await getCroppedImg(image, croppedPixels);
      const newId = portfolio.length > 0 ? Math.max(...portfolio.map((p) => p.id)) + 1 : 1;
      onAdd({ id: newId, image: cropped, title: title.trim() });
      closeModal();
    } catch {
      alert("Failed to crop image. Please try again.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setImage(null);
    setTitle("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedPixels(null);
    setError(false);
  };

  return (
    <>
      <Card className="p-6 sm:p-8 mb-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{isPerson ? "Portfolio" : "Our Work"}</h2>
          <p className="text-gray-600">Upload images that represent your work</p>

          {portfolio.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <Camera className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">Tips for great portfolio images:</h3>
                  <ul className="text-sm text-green-800 space-y-1.5">
                    <li>• Use clear, high-quality images that represent your services.</li>
                    <li>• Include different project examples so clients can see your full range of services.</li>
                    <li>• Use bright images with a simple, descriptive title.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {portfolio.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {portfolio.map((item, i) => (
              <div key={i} className="relative group">
                <div className="relative overflow-hidden rounded-lg aspect-square">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200" />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onRemove(item.id)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-2 text-center font-medium">{item.title}</p>
              </div>
            ))}
          </div>
        )}

        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-700 transition-colors cursor-pointer group"
          onClick={() => document.getElementById("portfolio-upload")?.click()}
        >
          <input type="file" accept="image/*" id="portfolio-upload" onChange={handleUpload} className="hidden" />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3 group-hover:text-green-600 transition-colors" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload Portfolio Images</h3>
          <p className="text-gray-500 text-sm mb-4">Click to browse and select images</p>
          <Button variant="outline" className="gap-2 cursor-pointer mb-3" type="button">
            <Plus className="h-4 w-4" /> Choose Files
          </Button>
          <p className="text-xs text-gray-400">PNG, JPG or GIF. Max 5MB per file.</p>
        </div>
      </Card>

      {showModal && image && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add Portfolio Item</h3>
              <button onClick={closeModal} className="cursor-pointer text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, pixels) => setCroppedPixels(pixels)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zoom-add">Zoom</Label>
                <input id="zoom-add" type="range" title="Zoom" min="1" max="3" step="0.1"
                  value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolioTitle">Title <span className="text-red-500">*</span></Label>
                <Input id="portfolioTitle" type="text" placeholder="Enter a title for this work..."
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setError(false); }}
                  className={error ? "border-red-500" : ""} />
                {error && <p className="text-xs text-red-500">Title is required</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={closeModal} className="flex-1 cursor-pointer">Cancel</Button>
                <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700 text-white cursor-pointer">
                  Add to Portfolio
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
