import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";




const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Malkhana App",

  description: "District-wise Property Seizure App",
};



const RootLayout = async ({ children }: { children: React.ReactNode }) => {

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased gradient`}>
        {children}

        <Toaster position="top-right"
          reverseOrder={false} />
      </body>
    </html>
  );
}


export default RootLayout