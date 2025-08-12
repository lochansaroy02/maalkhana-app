import logo from "@/assets/spycore.jpeg"
import Image from 'next/image'

interface LogoProps {
    width: number | `${number}` | undefined
    height: number | `${number}` | undefined
}
const Spycore = ({ width, height }: LogoProps) => {
    return (
        <Image width={width} height={height} src={logo} alt='No image' />
    )
}

export default Spycore