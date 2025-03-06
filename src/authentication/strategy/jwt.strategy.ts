import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    // super({
    //   jwtFromRequest: ExtractJwt.fromExtractors([
    //     (request) => {
    //       return request?.cookies?.accessToken;
    //     },
    //   ]),
    //   ignoreExpiration: false,
    //   secretOrKey: process.env.JWT_SCERET,
    // });
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,

      secretOrKey: process.env.JWT_SCERET,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });
    if (!user) {
      throw new UnauthorizedException('', 'Your session has expired ☠');
    }
    delete user.password;
    return user;
  }
}
