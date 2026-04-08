import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth";
import { sendSupportEmail } from "../utils/mailer";
import { logActivity } from "../utils/logger";

export const supportRoutes = new Elysia({ prefix: "/support" })
    .use(authMiddleware)

    // ==================== SEND SUPPORT TICKET ====================
    .post(
        "/send",
        async ({ user, body, set }: any) => {
            if (!user) {
                set.status = 401;
                return { success: false, message: "Unauthorized" };
            }

            const { subject, category, message } = body;

            let emailSent = false;
            try {
                emailSent = await sendSupportEmail(
                    user.name || "Unknown User",
                    user.email || "no-reply@helphin-lms.com",
                    subject,
                    category,
                    message
                );
            } catch (err) {
                console.error("[SUPPORT] Email sending threw error:", err);
            }

            // Always log the activity regardless of email outcome
            await logActivity(user.id, "send_support_ticket", "support", undefined, {
                subject,
                category,
                emailSent,
            });

            if (!emailSent) {
                console.error("[SUPPORT] Email failed to send. Check SMTP_USER and SMTP_PASS in .env");
                return { 
                    success: true, 
                    message: "Laporan berhasil tercatat! Namun email notifikasi gagal dikirim. Tim kami tetap akan menindaklanjuti." 
                };
            }

            return { 
                success: true, 
                message: "Laporan berhasil dikirim! Tim kami akan meninjau dan merespons melalui email." 
            };
        },
        {
            body: t.Object({
                subject: t.String({ minLength: 3 }),
                category: t.String({ minLength: 1 }),
                message: t.String({ minLength: 1 }),
            }),
        }
    );
