import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User as UserModel } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole as UserRolePrisma } from '@prisma/client';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async create(
    @Body()
    userData: {
      name: string;
      email: string;
      password: string;
      adress: string;
      role: UserRolePrisma;
    },
  ): Promise<UserModel> {
    if (
      !userData.name ||
      !userData.email ||
      !userData.password ||
      !userData.adress ||
      !userData.role
    ) {
      throw new BadRequestException('Tous les champs sont obligatoires');
    }

    return this.usersService.create(userData);
  }

  @Roles(UserRole.Admin)
  @Get()
  async findAll(): Promise<UserModel[]> {
    return this.usersService.findAll();
  }

  @Roles(UserRole.Admin)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserModel> {
    return this.usersService.findOne(+id);
  }

  @Roles(UserRole.Admin)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    userData: {
      name?: string;
      email?: string;
      password?: string;
      adress?: string;
      role?: UserRolePrisma;
    },
  ): Promise<UserModel> {
    return this.usersService.update(+id, userData);
  }

  @Roles(UserRole.Admin)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<UserModel> {
    return this.usersService.remove(+id);
  }
}
