import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  signIn(userData: { email: string; password: string }) {
    return `Sign in with ${userData.email} and ${userData.password}`;
  }
}
