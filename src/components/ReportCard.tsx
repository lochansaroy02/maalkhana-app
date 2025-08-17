import { ReactNode } from "react"

interface CardProps {
    title: string
    data: number | undefined
    bgColour: string
    icon: ReactNode
}
const ReportCard = ({ data, bgColour, icon, title }: CardProps) => {
    return (
        <div className="">
            <div className={`${bgColour} px-4 py-4 gap-2  lg:h-32 lg:w-64   rounded-lg   flex flex-col `}>
                <div className=" flex  gap-2  items-center ">
                    <h1 className="text-base w-3/4  text-balance   font-bold text-neutral-100  ">{title}</h1>
                    <span className="text-neutral-50">
                        {icon}
                    </span>
                </div>
                <div className=" flex  ">
                    <h1 className="text-4xl font-bold text-neutral-200">{
                        data ?
                            data : "0"
                    }</h1>
                </div>
            </div>
        </div>
    )
}

export default ReportCard