import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Global()
@Module({
  imports: [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('MAIL_SMTP_HOST'),
          port: Number(config.get<string>('MAIL_SMTP_PORT')),
          secure: false,
          auth: {
            user: config.get<string>('MAIL_SMTP_USER'),
            pass: config.get<string>('MAIL_SMTP_PASS'),
          },
          tls: { rejectUnauthorized: false },
        },
        defaults: {
          from: `"No Reply" <${config.get<string>('MAIL_FROM')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],

  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
