import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { formatPhone, randomstring } from '@utils';
import * as argon from 'argon2';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

import { AuthDto, AuthValidateOtpDto, LoginDto, UpdateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt.payload';
import { MailService } from '@mail/mail.service';
import { Message } from '@utils/message';

@Injectable()
export class AuthenticationService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(param: JwtPayload): Promise<User> {
    return await this.prisma.user.findUnique({
      where: {
        email: param.email,
      },
    });
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) throw new ForbiddenException('Credentials do not match');
    delete user.password;

    return user;
  }

  async signup(params: AuthDto): Promise<object> {
    // Check if a user with the same email, username, or phone number already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: params.email },
          { username: params.username },
          { phoneNumber: params.phoneNumber },
        ],
      },
    });

    if (existingUser) {
      throw new ForbiddenException(
        'A user with this email, username, or phone number already exists.',
      );
    }

    try {
      // 1. Generate the password hash
      const hash = await argon.hash(params.password);

      // 2. Create a new user in the database
      const newUser = await this.prisma.user.create({
        data: {
          firstname: params.firstname,
          lastname: params.lastname,
          email: params.email,
          username: params.username,
          password: hash,
          phoneNumber: params.phoneNumber,
        },
      });

      // 3. Generate verification token
      const { token, hashedToken, tokenExpires } = await this.generateToken();

      // 4. Save the token to the user
      await this.prisma.user.update({
        where: { id: newUser.id },
        data: {
          verifyToken: hashedToken,
          verifyTokenExpires: tokenExpires,
        },
      });

      // 5. Send email (only for test email)
      if (params.email === 'nanretgungshik@gmail.com') {
        const verificationLink = `${this.config.get<string>(
          'CLIENT_URL',
        )}/auth/verify-email?token=${token}`;

        await this.mailService
          .sendWelcomeEmail(params.email, params.firstname, verificationLink)
          .catch((error) => {
            console.error('Email sending failed:', error);
          });
      }

      // Remove sensitive data before returning
      const { password, ...userWithoutPassword } = newUser;

      return { userWithoutPassword, token };
    } catch (error) {
      Logger.error('Unexpected error during user signup:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred. Please try again later.',
      );
    }
  }

  async verifyEmail({ token, email }: { token: string; email: string }) {
    // Find user by email
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if the token exists and is still valid
    if (
      !user.verifyToken ||
      new Date(user.verifyTokenExpires).getTime() < Date.now()
    ) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Compare the token
    const isEqual = await argon.verify(user.verifyToken, token);
    if (!isEqual) {
      throw new UnauthorizedException('Invalid token');
    }

    // Update user: mark as verified and remove verification token
    await this.prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        verifyToken: null,
        verifyTokenExpires: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async signin(params: LoginDto): Promise<{
    user: object;
    token: string;
  }> {
    try {
      const formattedEmail = params.email.trim();
      const formattedPassword = params.password.trim();
      //TODO:
      // 1. find user by email
      const user = await this.prisma.user.findFirst({
        where: {
          email: {
            equals: formattedEmail,
            mode: 'insensitive', // Makes the query case-insensitive
          },
        },
      });

      // 2. if user does not exist throw exception
      if (!user) {
        throw new ForbiddenException('Account not found!');
      }

      // check if user is verified
      if (!user.isVerified) {
        throw new UnauthorizedException('Please verify your account');
      }

      // 3. check if password is correct
      const pwMatches = await argon.verify(user.password, formattedPassword);
      // 4. if password is incorrect throw exception
      if (!pwMatches)
        throw new ForbiddenException(`Credentials don't match ☠️`);
      // 5. delete the password hash from the user object
      delete user.password;

      return this.signToken(user);
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  async signToken(user: User): Promise<{
    user: object;
    token: string;
  }> {
    const { id, email, role } = user;
    const payload = {
      sub: id,
      email,
      role,
    };

    const secret = this.config.get('JWT_SCERET');
    const TTL = this.config.get('TTL');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: TTL,
      secret: secret,
    });

    return {
      user,
      token,
    };
  }

  async decodeToken(token: string): Promise<{
    email: string;
    sub: string;
    iat: string | number;
    exp: string | number;
  }> {
    const jwtPayload = await this.jwt.decode(token);
    if (!jwtPayload) {
      throw new BadRequestException('An error occured');
    }
    const isExpired = Date.now() >= jwtPayload.exp * 1000;
    if (isExpired) throw new ForbiddenException('Invalid Token ☠️');
    return jwtPayload;
  }

  async forgotPassword({ email }: { email: string }) {
    // Find user in the database
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate reset token
    const { token, hashedToken, tokenExpires } = await this.generateToken();
    console.log(token);

    // Update user with reset token and expiration date
    await this.prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordTokenExpires: tokenExpires,
      },
    });

    let resetPasswordLink;
    try {
      // Generate reset password link
      resetPasswordLink = `${this.config.get<string>(
        'CLIENT_URL',
      )}/reset-password?token=${token}`;

      // Send email only if it matches your testing email
      await this.mailService.sendResetPasswordLink(
        email,
        user.firstname,
        resetPasswordLink,
      );
    } catch (error) {
      console.error('Email sending failed:', error);
    }

    return {
      message: 'Reset password link sent successfully',
      link: resetPasswordLink,
    };
  }

  async resetPassword({
    token,
    password,
  }: {
    token: string;
    password: string;
  }) {
    // Find user where the reset token is still valid
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordTokenExpires: { gt: new Date() }, // Ensures token is still valid
      },
    });

    if (!user || !(await argon.verify(user.resetPasswordToken, token))) {
      throw new ForbiddenException(
        'Invalid or expired reset token. Please try again.',
      );
    }

    // Hash the new password
    const hashedPassword = await argon.hash(password);

    // Update the user record: set new password and remove reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpires: null,
      },
    });

    return { message: 'Password successfully reset' };
  }

  // Generate and send magic link
  async sendMagicLink(email: string) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const token = await this.signToken(user);
    let magicLink;
    try {
      // Magic link URL
      magicLink = `${this.config.get('CLIENT_URL')}/auth/magic-login?token=${token.token}`;
      // Send email only if it matches your testing email
      await this.mailService.sendMagicLink(email, magicLink);
    } catch (error) {
      console.error('Email sending failed:', error);
    }

    return { message: Message.MAGIC_LINK_SENT, link: magicLink };
  }

  // Verify magic link token
  async verifyMagicLink(token: string) {
    try {
      // Verify token
      const { email } = await this.decodeToken(token);

      // Find user
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate JWT for authentication
      const authToken = await this.signToken(user);
      return { message: Message.LOGIN_SUCCESS, token: authToken };
    } catch (err) {
      Logger.error(err);
      throw new UnauthorizedException('Invalid or expired magic link');
    }
  }

  private async generateToken() {
    const token = crypto.randomBytes(20).toString('hex');
    const tokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const hashedToken = await argon.hash(token);

    return { token, hashedToken, tokenExpires };
  }

  //get current user profile
  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    delete user.password;

    return user;
  }

  //update user
  async updateUserProfile(userId: string, user: UpdateUserDto) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: user,
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    delete updatedUser.password;

    return updatedUser;
  }

  //change password

  async triggerVerification(params): Promise<any> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            {
              email: params.email,
            },
            {
              phoneNumber: formatPhone(params.phoneNo),
            },
            {
              phoneNumber: params.phoneNo,
            },
          ],
        },
      });

      if (!user) throw new ForbiddenException('User does not exist');
      return {
        reference_id: '9df6a3c7-8bcb-4620-b867-501d76ab26bf',
        destination: params.phoneNo,
        status_id: '82655ad3-5143-4b85-b75d-610be8c18687',
        status: 'whatsapp OTP sent successfully',
      };
      // TODO: ADD DOJAH VALIDATION

      // const request: SendOtpDto = {
      //   sender_id: process.env.APP_NAME,
      //   destination: formatPhone(params.phoneNo),
      //   channel: params?.channel ? params?.channel : 'sms',
      //   expiry: 10,
      //   priority: true,
      // };

      // const response = await this.appService.sendOtp(request);

      // return response;
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred. Please try again later.',
      );
    }
  }

  async validatePhoneNoVerification(params: AuthValidateOtpDto): Promise<any> {
    // TODO: ADD DOJAH VALIDATION
    // const request: ValidateOtpDto = {
    //   code: params.code,
    //   reference_id: params.reference_id,
    // };
    if (params.code !== '123456') {
      throw new BadRequestException('Invalid OTP');
    }
    // const response = await this.appService.validateOtp(request);
    const response = {
      valid: true,
    };

    if (response.valid) {
      const user = await this.prisma.user.update({
        where: {
          phoneNumber: formatPhone(params.phoneNo),
        },
        data: {
          isVerified: true,
        },
      });

      if (!user) throw new ForbiddenException('User does not exist');
    } else {
      throw new BadRequestException('Invalid OTP');
    }

    return response;
  }

  // async resetResquest(params: AuthValidateOtpDto): Promise<User> {
  //   if (params.code !== '123456') {
  //     throw new BadRequestException('Invalid OTP');
  //   }

  //   const user = await this.prisma.user.update({
  //     where: {
  //       phoneNumber: formatPhone(params.phoneNo) as string,
  //     },
  //     data: {
  //       resetResquest: randomstring(42),
  //     },
  //   });

  //   if (!user) throw new ForbiddenException('User does not exist');

  //   return user;
  // }

  // async resetPassword(params: RestPasswordDTO): Promise<User> {
  //   const { password, confirm_password } = params;

  //   if (password !== confirm_password) {
  //     throw new ForbiddenException('Passwords do not match');
  //   }

  //   const hash = await argon.hash(params.password);
  //   const user = await this.prisma.user.update({
  //     where: { phoneNumber: formatPhone(params.phoneNo) as string },
  //     data: {
  //       password: hash,
  //       resetResquest: null,
  //     },
  //   });

  //   delete user.password;

  //   return user;
  // }

  // async forgetPassword(params: ForgetPasswordDTO): Promise<any> {
  //   const user = await this.prisma.user.findFirst({
  //     where: {
  //       OR: [
  //         {
  //           email: params.email,
  //         },
  //         {
  //           phoneNumber: formatPhone(params.phoneNo),
  //         },
  //       ],
  //     },
  //   });

  //   if (!user) throw new ForbiddenException('User does not exist');

  //   return {
  //     reference_id: '4a37dece-9de1-438a-8f9c-fd67638afde4',
  //     destination: params.phoneNo,
  //     status_id: '0f47d301-a82f-4d56-944d-06f5c839bcaf',
  //     status: 'sms OTP sent successfully',
  //   };
  // }
}
