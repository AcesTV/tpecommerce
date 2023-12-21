import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async create(data: Prisma.UserCreateInput): Promise<User> {
    try {
      return await this.prisma.user.create({ data });
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(
        `L'utilisateur avec l'ID ${userId} non trouvé`,
      );
    }

    return user;
  }

  async update(userId: number, data: Prisma.UserUpdateInput): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data,
      });
      return user;
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
