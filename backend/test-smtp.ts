import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === "465",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

console.log("SMTP_HOST:", process.env.SMTP_HOST);
console.log("SMTP_PORT:", process.env.SMTP_PORT);
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS length:", process.env.SMTP_PASS?.length);
console.log("SMTP_FROM_NAME:", process.env.SMTP_FROM_NAME);
console.log("SMTP_FROM_EMAIL:", process.env.SMTP_FROM_EMAIL);

console.log("\nVerifying SMTP connection...");
try {
    await transporter.verify();
    console.log("✅ SMTP connection OK!");
    
    // Try sending a test email
    const info = await transporter.sendMail({
        from: `HelPhin LMS <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER,
        subject: "[TEST] Pusat Layanan Test",
        text: "This is a test email from Pusat Layanan.",
    });
    console.log("✅ Test email sent! MessageId:", info.messageId);
} catch (error: any) {
    console.error("❌ SMTP Error:", error.message);
    console.error("Error code:", error.code);
    console.error("Full error:", error);
}
