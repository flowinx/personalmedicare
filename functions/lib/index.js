"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendContactMessage = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
// Carregar variáveis de ambiente
dotenv.config();
// Inicializar Firebase Admin
admin.initializeApp();
// Configurar transporter do Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || ((_a = functions.config().email) === null || _a === void 0 ? void 0 : _a.user) || 'personalmedicare@gmail.com',
        pass: process.env.EMAIL_PASSWORD || ((_b = functions.config().email) === null || _b === void 0 ? void 0 : _b.password) || 'CONFIGURE_GMAIL_APP_PASSWORD'
    }
});
exports.sendContactMessage = functions.https.onCall(async (data, context) => {
    var _a;
    // Validar dados de entrada
    if (!data.name || !data.email || !data.subject || !data.message) {
        throw new functions.https.HttpsError('invalid-argument', 'Todos os campos são obrigatórios.');
    }
    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        throw new functions.https.HttpsError('invalid-argument', 'Email inválido.');
    }
    try {
        const timestamp = new Date().toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        // 1. Enviar email para a equipe (flowinxcorp@gmail.com)
        await transporter.sendMail({
            from: '"Personal Medicare" <personalmedicare@gmail.com>',
            to: 'flowinxcorp@gmail.com',
            subject: `[Personal Medicare] ${data.subject}`,
            html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #b081ee; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #b081ee; }
              .value { margin-top: 5px; }
              .message-box { background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #b081ee; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>💊 Nova Mensagem de Contato</h2>
                <p>Personal Medicare App</p>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">👤 Nome:</div>
                  <div class="value">${data.name}</div>
                </div>
                <div class="field">
                  <div class="label">📧 Email:</div>
                  <div class="value">${data.email}</div>
                </div>
                <div class="field">
                  <div class="label">📋 Assunto:</div>
                  <div class="value">${data.subject}</div>
                </div>
                <div class="field">
                  <div class="label">💬 Mensagem:</div>
                  <div class="message-box">${data.message.replace(/\n/g, '<br>')}</div>
                </div>
                <div class="field">
                  <div class="label">🕐 Data/Hora:</div>
                  <div class="value">${timestamp}</div>
                </div>
              </div>
              <div class="footer">
                <p>Enviado automaticamente via Personal Medicare App</p>
                <p>Responda diretamente para o email do usuário: ${data.email}</p>
              </div>
            </div>
          </body>
          </html>
        `
        });
        // 2. Enviar email de confirmação para o usuário
        await transporter.sendMail({
            from: '"Personal Medicare" <personalmedicare@gmail.com>',
            to: data.email,
            subject: 'Recebemos sua mensagem - Personal Medicare',
            html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #b081ee; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .highlight { background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #b081ee; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              .button { display: inline-block; background: #b081ee; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>💊 Personal Medicare</h2>
                <p>Obrigado pelo seu contato!</p>
              </div>
              <div class="content">
                <h3>Olá ${data.name}! 👋</h3>
                
                <p>Recebemos sua mensagem com sucesso!</p>
                
                <div class="highlight">
                  <strong>📋 Assunto:</strong> ${data.subject}<br>
                  <strong>🕐 Recebido em:</strong> ${timestamp}
                </div>
                
                <p><strong>⏰ Tempo de Resposta:</strong></p>
                <p>Nossa equipe analisará sua solicitação e responderá em até <strong>24 horas</strong> neste mesmo email (${data.email}).</p>
                
                <p><strong>📞 Outros Canais:</strong></p>
                <p>Se precisar de ajuda urgente, você também pode:</p>
                <ul>
                  <li>📧 Enviar email para: flowinxcorp@gmail.com</li>
                  <li>📱 Acessar a Central de Ajuda no app</li>
                  <li>🌐 Visitar: personalmedicare.com</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                  <p><strong>Obrigado por usar o Personal Medicare!</strong></p>
                  <p>Estamos aqui para cuidar de quem você ama. ❤️</p>
                </div>
              </div>
              <div class="footer">
                <p>Equipe Personal Medicare</p>
                <p>Este é um email automático, não responda a esta mensagem.</p>
              </div>
            </div>
          </body>
          </html>
        `
        });
        // 3. Salvar no Firestore para histórico (opcional)
        await admin.firestore().collection('contact_messages').add({
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: 'sent',
            ip: ((_a = context.rawRequest) === null || _a === void 0 ? void 0 : _a.ip) || 'unknown'
        });
        console.log(`Contact message sent successfully from ${data.email}`);
        return {
            success: true,
            message: 'Mensagem enviada com sucesso!'
        };
    }
    catch (error) {
        console.error('Error sending contact message:', error);
        throw new functions.https.HttpsError('internal', 'Erro interno do servidor. Tente novamente mais tarde.');
    }
});
//# sourceMappingURL=index.js.map