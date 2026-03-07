"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  portfolio: any[];
  isPerson: boolean;
}

export default function ProfilePortfolio({ portfolio, isPerson }: Props) {
  const [selected, setSelected] = useState<any>(null);

  if (portfolio.length === 0) return null;

  return (
    <>
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {isPerson ? "My Portfolio" : "Our Projects"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {portfolio.map((item: any, index: number) => (
            <div
              key={item.id || index}
              className="group cursor-pointer"
              onClick={() => setSelected(item)}
            >
              <div className="relative overflow-hidden rounded-lg aspect-square">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <p className="text-sm font-medium text-gray-700 text-center mt-2">{item.title}</p>
            </div>
          ))}
        </div>
      </Card>

      {selected && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-3xl p-4 relative animate-in fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              className="absolute top-6 right-6 p-2 bg-black/50 hover:bg-black/70 text-white rounded"
              onClick={() => setSelected(null)}
            >
              ✕
            </Button>
            <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-200 max-w-[500px] mx-auto">
              <img src={selected.image} alt={selected.title} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-xl font-semibold text-center mt-4">{selected.title}</h3>
          </div>
        </div>
      )}
    </>
  );
}
