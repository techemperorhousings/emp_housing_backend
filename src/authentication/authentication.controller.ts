import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Message } from '@utils/message';
import { AuthenticationService } from './authentication.service';
import {
  AuthDto,
  AuthValidateOtpDto,
  ForgotPasswordDto,
  LoginDto,
  MagicLinkDto,
  ResetPasswordDto,
  UpdateUserDto,
} from './dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { Public } from '@decorators/index.decorator';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Authentication')
@Controller('/authentication')
export class AuthenticationController {
  constructor(
    private _auth: AuthenticationService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Create Account' })
  @ApiBody({
    description: 'new user credentials',
    type: AuthDto,
  })
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

  @Public()
  @Post('/verify-email')
  @ApiOperation({ summary: 'Verify Email' })
  @ApiBody({ description: 'User credentials', type: VerifyEmailDto })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @HttpCode(HttpStatus.OK)
  async verify(@Body() body: VerifyEmailDto) {
    return this._auth.verifyEmail(body);
  }

  @Public()
  @ApiOperation({ summary: 'Login User' })
  @ApiBody({
    description: 'User credentials',
    type: LoginDto,
  })
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

  // @Patch('validate-otp')
  // async validatePhoneNoVerification(@Body() params: AuthValidateOtpDto) {
  //   const user = await this._auth.validatePhoneNoVerification(params);

  //   return {
  //     message: 'Your phone number has been verified successfully',
  //     data: user,
  //   };
  // }

  @Throttle({ default: { limit: 3, ttl: 86400 } }) // Allow max 3 requests per 24 hours
  @Public()
  @Post('/forgot-password')
  @ApiOperation({ summary: 'Forgot Password' })
  @ApiBody({ description: 'User email', type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Reset password link sent successfully',
  })
  @HttpCode(HttpStatus.OK)
  async forgotPasswordController(@Body() body: ForgotPasswordDto) {
    return this._auth.forgotPassword(body);
  }

  @Public()
  @Post('/reset-password')
  @ApiOperation({ summary: 'Reset Password' })
  @ApiBody({
    description: 'User credentials',
    type: ResetPasswordDto,
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @HttpCode(HttpStatus.OK)
  async resetPasswordController(@Body() body: ResetPasswordDto) {
    return this._auth.resetPassword(body);
  }

  @Public()
  @ApiOperation({
    summary: 'Send Magic Link',
  })
  @ApiBody({ description: 'User email', type: MagicLinkDto })
  @ApiResponse({ status: 200, description: 'Magic link sent successfully' })
  @HttpCode(HttpStatus.OK)
  @Post('magic-link')
  async sendMagicLink(@Body('email') email: string) {
    return this._auth.sendMagicLink(email);
  }

  @Public()
  @ApiOperation({ summary: 'Verify Magic Link' })
  @ApiQuery({ name: 'token', description: 'Magic Link Token' })
  @HttpCode(HttpStatus.OK)
  @Post('magic-login')
  async verifyMagicLink(@Query('token') token: string) {
    return this._auth.verifyMagicLink(token);
  }

  @ApiOperation({ summary: 'Get User Profile' })
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'User profile fetched successfully',
  })
  @Get('profile')
  async getProfile(@Req() req) {
    return this._auth.getUserProfile(req.user.id);
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    description: 'User details to update',
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  @Patch('profile')
  async updateProfile(@Req() req, @Body() user: UpdateUserDto) {
    return this._auth.updateUserProfile(req.user.id, user);
  }

  // @ApiOperation({ summary: 'Forgot Password' })
  // @Post('forgot-password')
  // async forgetPassword(@Body() params: ForgetPasswordDTO) {
  //   const user = await this._auth.forgetPassword(params);

  //   return {
  //     message:
  //       '📱 A link to reset your password has been sent to your email and phone number',
  //     data: user,
  //   };
  // }

  // @ApiOperation({ summary: 'Validate Code for Forgot Password' })
  // @Patch('forget-password-validation')
  // async forgetPasswordValidation(@Body() params: AuthValidateOtpDto) {
  //   const user = await this._auth.resetResquest(params);

  //   return {
  //     message: '🔧 Account Password Reset Requested',
  //     data: user,
  //   };
  // }

  // @ApiOperation({ summary: 'Reset Password' })
  // @Post('reset-password')
  // async resetPassword(@Body() params: RestPasswordDTO) {
  //   const user = await this._auth.resetPassword(params);

  //   return {
  //     message: '🥶 Your passowrd has been changed successfully',
  //     data: user,
  //   };
  // }

  // @Post('send-otp')
  // async intialillizePhoneNoVerification(@Body() params: ForgetPasswordDTO) {
  //   const user = await this._auth.triggerVerification(params);

  //   return {
  //     message: 'A one time password has been sent to your phone number',
  //     data: user,
  //   };
  // }

  // @Post('magic-link')
  // async magicLink(@Body() params: MagicLinkDto) {
  //   // const magicLink = generateRandomHash(150);
  //   const { email } = params;
  //   const findUser = await this._auth.findUserByEmail(email);
  //   const token = (await this._auth.signToken(findUser)).token;
  //   // const url = `${this.config.get('MAGIC_LINK_CALLBACK')}${magicLink}?email=${email}`;
  //   const url = `${this.config.get('MAGIC_LINK_CALLBACK')}${token}`;
  //   return {
  //     message: Message.MAGIC_LINK_SENT,
  //     data: url,
  //   };
  // }

  // @Get('verify-link/:id')
  // async verfiyLink(@Req() req) {
  //   const {
  //     params: { id },
  //   } = req;
  //   const { email } = await this._auth.decodeToken(id);
  //   const findUser = await this._auth.findUserByEmail(email);

  //   return {
  //     message: Message.LOGIN_SUCCESS,
  //     data: { ...findUser },
  //   };
  // }
}
