import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "Sanctuary — Student Mental Health Support",
  description: "A safe space for students to access mental health support through AI guidance, counsellors, and wellness resources.",
  keywords: ["mental health", "student wellness", "counselling", "AI support", "mood tracking"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
