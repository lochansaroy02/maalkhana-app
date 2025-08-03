import { ReactNode } from "react"

const Modal = ({ children }: { children: ReactNode }) => {

    return (
        <div className="fixed  rounded-xl top-0 left-0 w-full h-full flex flex-col  pt-12 items-center gap-4">
            <div className='bg-white/10 relative  rounded-xl flex justify-center items-center flex-col  backdrop-blur-xl shadow-lg z-50 py-6 px-4 h-3/4 w-3/4 '>
                {children}
            </div>
        </div>
    )
}

export default Modal