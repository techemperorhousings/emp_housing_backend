import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { formatPhone, randomstring } from '@utils';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';

import {
  AuthDto,
  AuthValidateOtpDto,
  ForgetPasswordDTO,
  LoginDto,
  RestPasswordDTO,
} from './dto';
import { JwtPayload } from './interfaces/jwt.payload';

@Injectable()
export class AuthenticationService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
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
    // Check if a user with the same email or username already exists
    //check if roleId exists
    const [existingUser, roleExists] = await Promise.all([
      this.prisma.user.findFirst({
        where: {
          OR: [{ email: params.email }, { phoneNumber: params.phoneNumber }],
        },
      }),
      this.prisma.role.findUnique({
        where: {
          id: params.roleId,
        },
      }),
    ]);

    if (existingUser) {
      throw new ForbiddenException(
        'A user with this email or phone number already exists.',
      );
    }
    if (!roleExists) {
      throw new ForbiddenException('Role does not exist');
    }

    try {
      // 1. Generate the password hash
      const hash = await argon.hash(params.password);

      // 2. Create a new user in the database
      const user = await this.prisma.user.create({
        data: {
          email: params.email,
          firstname: params.firstname,
          lastname: params.lastname,
          password: hash,
          phoneNumber: params.phoneNumber,
          profileImage: params.profileImage,
          roleId: params.roleId,
        },
      });

      delete user.password; // Remove sensitive data
      // await this.notify.sendNotification({
      //   message: `${user.id} - ${user.firstname} ${user.lastname} just created an account. 🚀`,
      //   useDiscord: true,
      // });

      return this.signToken(user);
    } catch (error) {
      throw error;
    }
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
        include: {
          role: true,
        },
      });

      // 2. if user does not exist throw exception
      if (!user) {
        throw new ForbiddenException('Account not found!');
      }

      // cheeck if user is verified

      // 3. check if password is correct
      const pwMatches = await argon.verify(user.password, formattedPassword);
      // 4. if password is incorrect throw exception
      if (!pwMatches)
        throw new ForbiddenException(`Credentials don't match ☠️`);
      // 5. delete the password hash from the user object
      delete user.password;

      return this.signToken(user);
    } catch (error) {
      throw error;
    }
  }

  async signToken(user: User): Promise<{
    user: object;
    token: string;
  }> {
    const { id, email } = user;
    const payload = {
      sub: id,
      email,
    };

    const secret = this.config.get('JWT_SECRET');
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

  async triggerVerification(params: ForgetPasswordDTO): Promise<any> {
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
      throw error;
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
          verified: true,
        },
      });

      if (!user) throw new ForbiddenException('User does not exist');
    } else {
      throw new BadRequestException('Invalid OTP');
    }

    return response;
  }

  async forgetPassword(params: ForgetPasswordDTO): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email: params.email,
          },
          {
            phoneNumber: formatPhone(params.phoneNo),
          },
        ],
      },
    });

    if (!user) throw new ForbiddenException('User does not exist');

    return {
      reference_id: '4a37dece-9de1-438a-8f9c-fd67638afde4',
      destination: params.phoneNo,
      status_id: '0f47d301-a82f-4d56-944d-06f5c839bcaf',
      status: 'sms OTP sent successfully',
    };
  }

  async resetResquest(params: AuthValidateOtpDto): Promise<User> {
    if (params.code !== '123456') {
      throw new BadRequestException('Invalid OTP');
    }

    const user = await this.prisma.user.update({
      where: {
        phoneNumber: formatPhone(params.phoneNo) as string,
      },
      data: {
        resetRequest: randomstring(42),
      },
    });

    if (!user) throw new ForbiddenException('User does not exist');

    return user;
  }

  async resetPassword(params: RestPasswordDTO): Promise<User> {
    const { password, confirm_password } = params;

    if (password !== confirm_password) {
      throw new ForbiddenException('Passwords do not match');
    }

    const hash = await argon.hash(params.password);
    const user = await this.prisma.user.update({
      where: { phoneNumber: formatPhone(params.phoneNo) as string },
      data: {
        password: hash,
        resetRequest: null,
      },
    });

    delete user.password;

    return user;
  }
}
