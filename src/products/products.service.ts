import { Injectable, NotFoundException } from '@nestjs/common';
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

  findOne(productId: number): Promise<Product> {
    const product = this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(
        `Le produit avec l'ID ${productId} n'existe pas`,
      );
    }

    return product;
  }

  update(id: number, data: Prisma.ProductUpdateInput) {
    try {
      const product = this.prisma.product.update({
        where: { id: id },
        data,
      });
      return product;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Gérer le produit non trouvé
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Le produit avec l'ID ${id} n'existe pas`,
          );
        }
      }
      throw error;
    }
  }

  remove(productId: number) {
    try {
      return this.prisma.product.delete({
        where: { id: productId },
      });
    } catch (error) {
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
}
