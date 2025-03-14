import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
  Post,
  Req,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Message } from '@utils/message';
import { AuthenticationService } from './authentication.service';
import {
  AuthDto,
  AuthValidateOtpDto,
  ForgetPasswordDTO,
  LoginDto,
  MagicLinkDto,
  RestPasswordDTO,
} from './dto';

@ApiTags('Authentication')
@Controller('/authentication')
export class AuthenticationController {
  constructor(
    private _auth: AuthenticationService,
    private readonly config: ConfigService,
  ) {}

  @ApiOperation({ summary: 'Create Account' })
  @ApiResponse({
    status: 200,
    description: Message.ACCOUNT_CREATION_SUCCESS,
  })
  @Post('create')
  async signup(@Body() params: AuthDto) {
    return {
      message: Message.ACCOUNT_CREATION_SUCCESS,
      data: await this._auth.signup(params),
    };
  }

  @Post('login')
  async signin(@Body() params: LoginDto) {
    const user = await this._auth.signin(params);
    if (!user) {
      throw new NotFoundException('User does not exist!');
    }

    return {
      message: Message.LOGIN_SUCCESS,
      data: { ...user },
    };
  }

  @Post('magic-link')
  async magicLink(@Body() params: MagicLinkDto) {
    // const magicLink = generateRandomHash(150);
    const { email } = params;
    const findUser = await this._auth.findUserByEmail(email);
    const token = (await this._auth.signToken(findUser)).token;
    // const url = `${this.config.get('MAGIC_LINK_CALLBACK')}${magicLink}?email=${email}`;
    const url = `${this.config.get('MAGIC_LINK_CALLBACK')}${token}`;
    return {
      message: Message.MAGIC_LINK_SENT,
      data: url,
    };
  }

  @Get('verify-link/:id')
  async verfiyLink(@Req() req) {
    const {
      params: { id },
    } = req;
    const { email } = await this._auth.decodeToken(id);
    const findUser = await this._auth.findUserByEmail(email);

    return {
      message: Message.LOGIN_SUCCESS,
      data: { ...findUser },
    };
  }

  @Post('send-otp')
  async intialillizePhoneNoVerification(@Body() params: ForgetPasswordDTO) {
    const user = await this._auth.triggerVerification(params);

    return {
      message: 'A one time password has been sent to your phone number',
      data: user,
    };
  }

  @Patch('validate-otp')
  async validatePhoneNoVerification(@Body() params: AuthValidateOtpDto) {
    const user = await this._auth.validatePhoneNoVerification(params);

    return {
      message: 'Your phone number has been verified successfully',
      data: user,
    };
  }

  @ApiOperation({ summary: 'Forgot Password' })
  @Post('forgot-password')
  async forgetPassword(@Body() params: ForgetPasswordDTO) {
    const user = await this._auth.forgetPassword(params);

    return {
      message:
        '📱 A link to reset your password has been sent to your email and phone number',
      data: user,
    };
  }

  @ApiOperation({ summary: 'Validate Code for Forgot Password' })
  @Patch('forget-password-validation')
  async forgetPasswordValidation(@Body() params: AuthValidateOtpDto) {
    const user = await this._auth.resetResquest(params);

    return {
      message: '🔧 Account Password Reset Requested',
      data: user,
    };
  }

  @ApiOperation({ summary: 'Reset Password' })
  @Post('reset-password')
  async resetPassword(@Body() params: RestPasswordDTO) {
    const user = await this._auth.resetPassword(params);

    return {
      message: '🥶 Your passowrd has been changed successfully',
      data: user,
    };
  }
}
