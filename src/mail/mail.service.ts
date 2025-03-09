import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { accountActivation } from './templates/accountActivation';
import { resetPassword } from './templates/resetPassword';
import { magicLink } from './templates/magicLink';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendWelcomeEmail(
    email: string,
    name: string,
    verificationLink: string,
  ) {
    // Send the verify email
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to EMP Housing! Please verify your email',
      html: accountActivation(name, 'EMP Housing', verificationLink),
    });
  }

  async sendResetPasswordLink(
    email: string,
    name: string,
    resetPasswordLink: string,
  ) {
    // Send the verify email
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Your Password',
      html: resetPassword(name, resetPasswordLink),
    });
  }

  async sendMagicLink(email: string, link: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Magic Link Login',
      html: magicLink(link),
    });
  }
}
