
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { to, subject, type, data } = body;

        let htmlContent = '';

        if (type === 'confirmation') {
            htmlContent = `
                <h1>¡Turno Confirmado!</h1>
                <p>Hola <strong>${data.clientName}</strong>,</p>
                <p>Tu turno para <strong>${data.serviceName}</strong> ha sido confirmado.</p>
                <p>📅 Fecha: ${data.date}<br>⏰ Hora: ${data.time}<br>📍 Lugar: ${data.location}</p>
                <p>¡Te esperamos!</p>
            `;
        } else if (type === 'welcome') {
            htmlContent = `
                <h1>¡Bienvenida a Ouleeh!</h1>
                <p>Hola <strong>${data.name}</strong>,</p>
                <p>Gracias por registrarte. Ahora puedes gestionar tus turnos de forma fácil y rápida.</p>
            `;
        } else {
            htmlContent = `<p>${JSON.stringify(data)}</p>`;
        }

        const dataRes = await resend.emails.send({
            from: 'Ouleeh <onboarding@resend.dev>',
            to: [to],
            subject: subject,
            html: htmlContent,
        });

        if (dataRes.error) {
            console.error("Resend API Error:", dataRes.error);
            return NextResponse.json({ success: false, error: dataRes.error }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: dataRes.data });
    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json({ success: false, error: "Failed to send notification" }, { status: 500 });
    }
}
