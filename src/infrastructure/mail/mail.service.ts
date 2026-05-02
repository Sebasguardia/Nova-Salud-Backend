import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { welcomeTemplate } from './templates/welcome.template';
import { passwordChangedTemplate } from './templates/password-changed.template';
import { passwordResetTemplate } from './templates/password-reset.template';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host:   process.env.MAIL_HOST   ?? 'smtp.gmail.com',
      port:   parseInt(process.env.MAIL_PORT ?? '587', 10),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER ?? '',
        pass: process.env.MAIL_PASS ?? '',
      },
    });
  }

  async sendWelcomeEmail(
    to: string,
    firstName: string,
    dni: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from:    process.env.MAIL_FROM ?? 'BoticaSystem <no-reply@botica.com>',
        to,
        subject: 'Bienvenido — Tus credenciales de acceso',
        html:    welcomeTemplate(firstName, to, dni),
      });
      this.logger.log(`Correo de bienvenida enviado a ${to}`);
    } catch (error) {
      this.logger.error(`Error enviando correo a ${to}: ${error}`);
    }
  }

  async sendPasswordChangedEmail(
    to: string,
    firstName: string,
  ): Promise<void> {
    try {
      const date = new Date().toLocaleString('es-PE');
      await this.transporter.sendMail({
        from:    process.env.MAIL_FROM ?? 'BoticaSystem <no-reply@botica.com>',
        to,
        subject: 'Tu contraseña ha sido actualizada',
        html:    passwordChangedTemplate(firstName, date),
      });
      this.logger.log(`Correo de cambio de contraseña enviado a ${to}`);
    } catch (error) {
      this.logger.error(`Error enviando correo a ${to}: ${error}`);
    }
  }

  async sendPasswordResetEmail(
    to: string,
    firstName: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from:    process.env.MAIL_FROM ?? 'BoticaSystem <no-reply@botica.com>',
        to,
        subject: 'Tu contraseña ha sido restablecida',
        html:    passwordResetTemplate(firstName),
      });
      this.logger.log(`Correo de restablecimiento enviado a ${to}`);
    } catch (error) {
      this.logger.error(`Error enviando correo a ${to}: ${error}`);
    }
  }
}