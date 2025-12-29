"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  // Middleware handles protection, but we still need to redirect authenticated users
  // from root to dashboard if they land here.
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
    // No need to redirect unauthenticated; middleware does it.
    // Or if middleware allows root, we show landing page.
    // But config excludes auth, everything else is protected.
    // So root "/" is protected and will redirect to signin.
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-pln-gradient">
      <div className="text-white text-center">
        <h1 className="text-4xl font-bold mb-4">Sertifikasi Tower PLN</h1>
        <p className="text-xl opacity-80 animate-pulse">Memuat aplikasi...</p>
      </div>
    </div>
  );
}
