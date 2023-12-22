import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
// import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // @UseGuards(LocalAuthGuard)
  @Post('signin')
  async login(@Body() userdata: { email: string; password: string }) {
    return this.authService.login(userdata.email, userdata.password);
  }
}
