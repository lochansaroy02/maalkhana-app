import { useAuthStore } from "@/store/authStore";
import { useDistrictStore } from "@/store/districtStore";
import { uploadToImageKit } from "./imagekit";

export type MediaKind = "photos" | "documents";

/**
 * Which folder a file goes to. Callers pass their old ImageKit sub-folder
 * ("photo", "doc", "movement-docs", "malkhana-entry"…); anything named "doc"
 * or that is not an image goes to documents.
 */
const kindFor = (file: File, hint: string): MediaKind => {
    if (/doc/i.test(hint)) return "documents";
    return file.type.startsWith("image/") ? "photos" : "documents";
};

/**
 * Uploads a photo or document to the media server, into
 *   <district>/<police-station>/<photos|documents>/<yyyy>/<mm>/
 * and returns its public (CDN) URL.
 *
 * While the media server is not configured (MEDIA_SERVER_URL /
 * MEDIA_UPLOAD_SECRET missing), uploads keep going to ImageKit as before.
 */
export const uploadFile = async (file: File, hint: string): Promise<string> => {
    const kind = kindFor(file, hint);
    const { token, user } = useAuthStore.getState();
    // District / ASP users upload for the police station picked in the header.
    const stationUserId = user?.role === "policeStation" ? undefined : useDistrictStore.getState().userId || undefined;

    const ticketRes = await fetch("/api/media/upload-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ kind, stationUserId }),
    });
    const ticket = await ticketRes.json().catch(() => ({}));

    if (ticketRes.status === 503 && ticket?.configured === false) {
        return uploadToImageKit(file, hint);
    }
    if (!ticketRes.ok || !ticket?.success) {
        throw new Error(ticket?.error || "Upload failed");
    }

    const form = new FormData();
    form.append("file", file, file.name);
    const uploadRes = await fetch(ticket.uploadUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${ticket.ticket}` },
        body: form,
    });
    const result = await uploadRes.json().catch(() => ({}));
    if (!uploadRes.ok || !result?.success || !result.url) {
        throw new Error(result?.error || "Upload failed");
    }
    return result.url as string;
};
