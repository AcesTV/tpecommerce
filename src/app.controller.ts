import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('signup')
  @Render('signup')
  signup() {}

  @Get('signin')
  @Render('signin')
  signin() {}

  @Post('signin')
  signIn(@Body() userData: { email: string; password: string }) {
    return this.appService.signIn(userData);
  }
}
