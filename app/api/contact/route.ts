import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 })
    }

    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const to = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER

    await transport.sendMail({
      from: `"CUBE Contact" <${process.env.SMTP_USER}>`,
      to,
      replyTo: email,
      subject: `[Contact CUBE] ${subject}`,
      text: `
Nom: ${name}
Email: ${email}
Téléphone: ${phone || "N/A"}

Message:
${message}
      `.trim(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur envoi email contact:", error)
    return NextResponse.json({ error: "Erreur lors de l'envoi du message" }, { status: 500 })
  }
}

