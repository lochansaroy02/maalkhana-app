"use client";
import Logo from "@/assets/Logo";
import LoginForm from "@/components/LoginForm";
import { useTranslations } from "next-intl";


export default function LoginPage() {





  const t = useTranslations("HomePage");
  return (
    <div className="flex min-h-screen items-center gradient justify-center ">
      <div className="  glass-effect p-10 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl text-blue-100 font-bold mb-6 text-center">{t("title")}</h1>
        <div className='flex justify-center'>
          <Logo width={120} height={120} />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
