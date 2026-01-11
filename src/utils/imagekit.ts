import { upload } from "@imagekit/next"; // ImageKit Auth Utility
export const getAuth = async () => {
    const res = await fetch("/api/upload-auth");
    return res.json();
};

export const uploadToImageKit = async (file: File, subFolder: string) => {
    try {
        const auth = await getAuth();


        const result = await upload({
            file,
            fileName: `${subFolder}_${Date.now()}_${file.name}`,
            publicKey: auth.publicKey,
            token: auth.token,
            signature: auth.signature,
            expire: auth.expire,
            folder: `/uploads/nilami`,
        });
        return result.url;
    } catch (error) {
        console.error("ImageKit Upload Error:", error);
        throw new Error("Upload failed");
    }
};
