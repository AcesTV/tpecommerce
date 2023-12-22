import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(
    name: string,
    email: string,
    password: string,
    adress: string,
    role: UserRole,
  ) {
    return this.usersService.create({
      name,
      email,
      password,
      adress,
      role,
    });
  }

  async login(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const payload = { email: user.email, sub: user.id, role: user.role };
      return {
        accessToken: this.jwtService.sign(payload),
      };
    }
    throw new NotFoundException('Email ou mot de passe incorrect');
  }
}
