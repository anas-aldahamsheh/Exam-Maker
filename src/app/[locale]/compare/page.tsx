import React, { Suspense } from "react";
import { CompareView } from "@/features/comparison/CompareView";

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading comparison...</div>}>
      <CompareView />
    </Suspense>
  );
}
