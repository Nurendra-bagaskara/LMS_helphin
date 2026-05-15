import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTP = async (email: string, otp: string, name: string) => {
    try {
        const { data, error } = await resend.emails.send({
            from: `${process.env.SMTP_FROM_NAME || "HelPhin LMS"} <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
            to: [email],
            subject: "[HelPhin LMS] Kode Verifikasi Lupa Password",
            html: `
                <div style="font-family: sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; max-width: 500px; margin: 0 auto;">
                        <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">Halo, ${name}!</h1>
                        <p style="color: #666; font-size: 16px; line-height: 1.5;">
                            Kami menerima permintaan untuk mengatur ulang kata sandi Anda. Silakan gunakan kode OTP di bawah ini untuk melanjutkan:
                        </p>
                        <div style="background-color: #f0f0f0; padding: 15px; text-align: center; border-radius: 5px; margin: 25px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb;">${otp}</span>
                        </div>
                        <p style="color: #666; font-size: 14px;">
                            Kode ini akan berlaku selama <strong>5 menit</strong>. Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.
                        </p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="color: #999; font-size: 12px; text-align: center;">
                            HelPhin Learning Management System (LMS)
                        </p>
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error(`[MAILER] Resend error sending to ${email}:`, error);
            return false;
        }

        console.log(`[MAILER] Email sent successfully to ${email}. ID: ${data?.id}`);
        return true;
    } catch (error) {
        console.error(`[MAILER] Error sending email to ${email}:`, error);
        return false;
    }
};

export const sendSupportEmail = async (
    senderName: string,
    senderEmail: string,
    subject: string,
    category: string,
    message: string
) => {
    const companyEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER || "support@helphin-lms.com";

    const categoryLabels: Record<string, string> = {
        bug: "Bug / Error Sistem",
        feature: "Permintaan Fitur",
        account: "Masalah Akun",
        content: "Masalah Konten / Materi",
        other: "Lainnya",
    };

    try {
        const { data, error } = await resend.emails.send({
            from: `${process.env.SMTP_FROM_NAME || "HelPhin LMS"} <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
            to: [companyEmail],
            subject: `[Pusat Layanan] ${subject}`,
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f6f9; padding: 24px;">
                    <div style="background-color: #ffffff; padding: 32px; border-radius: 12px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                        <div style="background: linear-gradient(135deg, #1e293b, #334155); padding: 20px 24px; border-radius: 8px; margin-bottom: 24px;">
                            <h1 style="color: #ffffff; font-size: 20px; margin: 0;">Laporan Pusat Layanan</h1>
                            <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0;">HelPhin Learning Management System</p>
                        </div>
                        
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                            <tr>
                                <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600; width: 120px; vertical-align: top;">Pengirim</td>
                                <td style="padding: 10px 0; color: #1e293b; font-size: 14px;">${senderName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600; vertical-align: top;">Email</td>
                                <td style="padding: 10px 0; color: #1e293b; font-size: 14px;">${senderEmail}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600; vertical-align: top;">Kategori</td>
                                <td style="padding: 10px 0; color: #1e293b; font-size: 14px;">${categoryLabels[category] || category}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600; vertical-align: top;">Subjek</td>
                                <td style="padding: 10px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${subject}</td>
                            </tr>
                        </table>

                        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px;">Pesan</p>
                            <p style="color: #334155; font-size: 14px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
                        </div>

                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">
                        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
                            Email ini dikirim otomatis dari Pusat Layanan HelPhin LMS.
                        </p>
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error(`[MAILER] Resend error sending support email:`, error);
            return false;
        }

        console.log(`[MAILER] Support email sent. ID: ${data?.id}`);
        return true;
    } catch (error: any) {
        console.error(`[MAILER] Error sending support email:`, error?.message || error);
        return false;
    }
};
