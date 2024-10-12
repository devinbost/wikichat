"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const [status, setStatus] = useState("Verifying...");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await fetch(`/api/verifyUser?token=${token}`);
        const data = await res.json();
        if (res.ok) {
          setStatus("User verified successfully! You can now login.");
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        } else {
          setStatus(data.message || "Verification failed.");
        }
      } catch (error) {
        setStatus("Verification failed.");
      }
    };

    if (token) {
      verifyUser();
    } else {
      setStatus("No token provided.");
    }
  }, [token, router]);

  return <div>{status}</div>;
}