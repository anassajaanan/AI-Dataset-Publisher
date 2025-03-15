"use client";

import { RainbowButton } from "@/components/ui/rainbow-button";
import { RainbowButtonDemo } from "@/components/ui/rainbow-button-demo";

export default function RainbowTest() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      <h1 className="text-3xl font-bold text-center">Rainbow Button Test</h1>
      
      <div className="flex flex-col items-center justify-center gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Default Rainbow Button</h2>
          <RainbowButton>Default Rainbow Button</RainbowButton>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Rainbow Button Demo</h2>
          <RainbowButtonDemo />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Rainbow Button with Custom Class</h2>
          <RainbowButton className="px-12 py-3">
            Custom Rainbow Button
          </RainbowButton>
        </div>
      </div>
    </div>
  );
} 