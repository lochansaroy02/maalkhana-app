// @/utils/uploadToCloudinary.ts

export const uploadToCloudinary = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await res.json();

        if (!res.ok) {
            console.error("Cloudinary Error:", data.error?.message || "Unknown Error");
            return null;
        }

        return data.secure_url; // This will now only return if the request was successful
    } catch (error) {
        console.error("Network Error during Cloudinary upload:", error);
        return null;
    }
};