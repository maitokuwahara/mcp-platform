"use client";
import { Suspense } from "react";
import OAuthConsentClient from "./OAuthConsentClient";

export default function Page() {
  return (
    <Suspense fallback={<p>読み込み中...</p>}>
      <OAuthConsentClient />
    </Suspense>
  );
}
