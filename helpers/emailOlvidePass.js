import nodemailer from "nodemailer";

const emailOlvidePass = async (datos)=>{
    // Looking to send emails in production? Check out our Email API/SMTP product!
    var transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    //Enviar emial
    const { email, nombre, token } = datos;

    const info = await transport.sendMail({
        from: "APV - Administrador de pacientes de veterinaria",
        to: email,
        subject: "Reestablece tu password en APV",
        text: "Reestablece tu password en APV",
        html: `<p> Hola ${nombre}, has solicitado reestablecer tu password. </p>
                <p>Sigue el siguiente enlace para reestablecer tu password: 
                <a href="${process.env.FRONTEND_URL}/olvidepass/${token}"> Reestablecer password </a></p>
                <p> Si tu no creaste esta cuenta puedes ignorar este mail. </p>
            `
    });

    console.log("Mensaje enviado: %s", info.messageId); 

}

export default emailOlvidePass; 