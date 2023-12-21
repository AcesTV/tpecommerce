import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User as UserModel } from '@prisma/client';

@Controller('users')
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
    },
  ): Promise<UserModel> {
    if (
      !userData.name ||
      !userData.email ||
      !userData.password ||
      !userData.adress
    ) {
      throw new BadRequestException('Tous les champs sont obligatoires');
    }

    return this.usersService.create(userData);
  }

  @Get()
  async findAll(): Promise<UserModel[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserModel> {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    userData: {
      name?: string;
      email?: string;
      password?: string;
      adress?: string;
    },
  ): Promise<UserModel> {
    return this.usersService.update(+id, userData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<UserModel> {
    return this.usersService.remove(+id);
  }
}
