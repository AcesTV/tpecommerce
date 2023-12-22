import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async create(data: Prisma.UserCreateInput): Promise<User> {
    try {
      const encryptedPassword = await bcrypt.hash(data.password, 10);

      return await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: encryptedPassword,
          adress: data.adress,
          role: data.role,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Vérifier si l'erreur est due à une contrainte d'unicité
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Un utilisateur avec cet email existe déjà',
          );
        }
      }
      // Relancer l'erreur si ce n'est pas une contrainte d'unicité
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOne(userId: number): Promise<User> {
    if (!userId) {
      throw new BadRequestException("Un ID d'utilisateur valide est requis");
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: true,
      },
    });

    if (!user) {
      throw new NotFoundException(
        `L'utilisateur avec l'ID ${userId} non trouvé`,
      );
    }

    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    if (!email) {
      throw new BadRequestException("Un email d'utilisateur valide est requis");
    }
    const user = await this.prisma.user.findUnique({
      where: { email: email },
      include: {
        orders: true,
      },
    });

    if (!user) {
      throw new NotFoundException(
        `L'utilisateur avec l'email ${email} non trouvé`,
      );
    }

    return user;
  }

  async update(userId: number, data: Prisma.UserUpdateInput): Promise<User> {
    if (!userId) {
      throw new BadRequestException("Un ID d'utilisateur valide est requis");
    }
    if (
      data.role &&
      data.role !== UserRole.Admin &&
      data.role !== UserRole.Manager &&
      data.role !== UserRole.Client
    ) {
      throw new BadRequestException('Un rôle valide est requis');
    }
    try {
      const password =
        typeof data.password === 'string' ? data.password : undefined;
      if (password) {
        data.password = await bcrypt.hash(password, 10);
      }

      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
          adress: data.adress,
          role: data.role,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Gérer la contrainte d'unicité
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Un utilisateur avec cet email existe déjà',
          );
        }
        // Gérer l'utilisateur non trouvé
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Utilisateur avec l'ID ${userId} non trouvé`,
          );
        }
      }
      // Relancer les autres erreurs
      throw error;
    }
  }

  async remove(userId: number) {
    if (!userId) {
      throw new BadRequestException("Un ID d'utilisateur valide est requis");
    }
    try {
      return await this.prisma.user.delete({
        where: { id: userId },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Gérer l'utilisateur non trouvé
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Utilisateur avec l'ID ${userId} non trouvé`,
          );
        }
      }
      // Relancer les autres erreurs
      throw error;
    }
  }
}
