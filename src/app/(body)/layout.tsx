import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function BodyLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Sidebar />
            <div className="pl-[20%] w-full">
                <Header />
                <div className="pt-18">
                    {children}
                </div>
            </div>
        </>
    );
}
