import jsPDF from "jspdf";

export const generateSinglePDF = async (entry: any, title = "Maalkhana Entry") => {
    const doc = new jsPDF();

    let y = 20;

    doc.setFontSize(16);
    doc.text(title, 15, y);
    y += 10;

    const excludedKeys = ["photoUrl", "document", "id", "userId", "districtId", "createdAt", "updatedAt"];
    const keys = Object.keys(entry).filter(key => !excludedKeys.includes(key));

    doc.setFontSize(12);
    keys.forEach((key) => {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        const value = typeof entry[key] === 'boolean' ? (entry[key] ? "Yes" : "No") : (entry[key] ?? "-");

        doc.text(`${label}: ${value}`, 15, y);
        y += 8;
    });

    // 🖼 Add photo if available
    if (entry.photoUrl) {
        try {
            const imageData = await getImageBase64(entry.photoUrl);
            doc.addImage(imageData, "JPEG", 140, 20, 50, 50); // x, y, width, height
        } catch (error) {
            console.error("Image loading failed", error);
        }
    }

    doc.save(`${title}_${entry.firNo || "entry"}.pdf`);
};

const getImageBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject("Canvas context not available");
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL("image/jpeg");
            resolve(dataURL);
        };
        img.onerror = reject;
        img.src = url;
    });
};
