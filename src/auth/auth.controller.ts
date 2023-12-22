import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRole } from '@prisma/client';
// import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body()
    userdata: {
      name: string;
      email: string;
      password: string;
      adress: string;
      role: UserRole;
    },
  ) {
    if (
      !userdata.name ||
      !userdata.email ||
      !userdata.password ||
      !userdata.adress ||
      !userdata.role
    ) {
      throw new BadRequestException('Tous les champs sont obligatoires');
    }

    return this.authService.signup(
      userdata.name,
      userdata.email,
      userdata.password,
      userdata.adress,
      userdata.role,
    );
  }

  // @UseGuards(LocalAuthGuard)
  @Post('signin')
  async login(@Body() userdata: { email: string; password: string }) {
    return this.authService.login(userdata.email, userdata.password);
  }
}
