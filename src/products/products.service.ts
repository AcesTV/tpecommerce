import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, Product } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}
  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    try {
      return await this.prisma.product.create({
        data,
      });
    } catch (error) {
      throw error;
    }
  }

  findAll(): Promise<Product[]> {
    return this.prisma.product.findMany();
  }

  async findOne(productId: number): Promise<Product> {
    if (!productId) {
      throw new BadRequestException('Un ID de produit valide est requis');
    }
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(
        `Le produit avec l'ID ${productId} n'existe pas`,
      );
    }

    return product;
  }

  async update(productId: number, data: Prisma.ProductUpdateInput) {
    if (!productId) {
      throw new BadRequestException('Un ID de produit valide est requis');
    }

    try {
      const productExist = await this.prisma.product.findUnique({
        where: { id: productId },
      });
      if (!productExist) {
        throw new NotFoundException(
          `Le produit avec l'ID ${productId} n'existe pas`,
        );
      }
    } catch (error) {
      throw error;
    }

    try {
      return this.prisma.product.update({
        where: { id: productId },
        data,
      });
    } catch (error) {
      console.log('error!!!!!');
      console.log(error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Gérer le produit non trouvé
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Le produit avec l'ID ${productId} n'existe pas`,
          );
        }
      }
      throw error;
    }
  }

  async remove(productId: number) {
    if (!productId) {
      throw new BadRequestException('Un ID de produit valide est requis');
    }
    try {
      await this.prisma.orders_products.deleteMany({
        where: { productId },
      });

      return await this.prisma.product.delete({
        where: { id: productId },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Gérer l'utilisateur non trouvé
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Le produit avec l'ID ${productId} non trouvé`,
          );
        }
      }
      // Relancer les autres erreurs
      throw error;
    }
  }
}
