import LoginForm from "@/components/LoginForm";

export default function LoginPage() {


  return (
    <div className="flex min-h-screen items-center gradient justify-center bg-gray-100">
      <div className="  glass-effect p-10 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl text-blue-100 font-bold mb-6 text-center">Please Login</h1>
        <LoginForm />
      </div>
    </div>
  );
}
