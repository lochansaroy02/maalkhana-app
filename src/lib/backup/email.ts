import nodemailer from "nodemailer";

export async function sendBackupEmail(
    to: string | undefined,
    backup: string,
    userId: string,
    userName: string | undefined
) {
    const transporter = nodemailer.createTransport({

        service: "gmail",
        auth: {
            user: process.env.NEXT_PUBLIC_EMAIL_USER, // Gmail address
            pass: process.env.NEXT_PUBLIC_EMAIL_PASS, // App password (NOT normal Gmail password)
        },
    });

    const info = await transporter.sendMail({
        from: process.env.NEXT_PUBLIC_EMAIL_USER,
        to,
        subject: `Backup for Police Station User ${userId}`,
        text: "Attached is your complete police station backup.",
        attachments: [
            {
                filename: `station_${userId}_backup_${Date.now()}.json`,
                content: backup,
            },
        ],
    });

    console.log("✅ Backup email sent:", info.messageId);
}
