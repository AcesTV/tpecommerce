import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, Order } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}
  async create(orderData: CreateOrderDto, userId: number): Promise<Order> {
    try {
      return this.prisma.$transaction(async (prisma) => {
        const productIds = orderData.products.map((p) => p.productId);
        const existingProducts = await prisma.product.findMany({
          where: {
            id: { in: productIds },
          },
        });
        const existingProductIds = new Set(existingProducts.map((p) => p.id));

        // Trouver les produits non existants
        const nonExistingProducts = productIds.filter(
          (id) => !existingProductIds.has(id),
        );
        if (nonExistingProducts.length > 0) {
          throw new NotFoundException(
            `Les produits suivants n'existent pas: ${nonExistingProducts.join(
              ', ',
            )}`,
          );
        }

        const totalPrice = orderData.products.reduce(
          (acc, curr) =>
            acc +
            existingProducts.find((p) => p.id === curr.productId).price *
              curr.quantity,
          0,
        );

        const order = await prisma.order.create({
          data: {
            userId: userId,
            status: orderData.status,
            totalPrice: totalPrice,
          },
        });

        const orderProductsData = orderData.products.map((product) => {
          return {
            orderId: order.id,
            productId: product.productId,
            quantity: product.quantity,
          };
        });

        await prisma.orders_products.createMany({
          data: orderProductsData,
        });

        return order;
      });
    } catch (error) {
      throw error;
    }
  }

  findAll(): Promise<Order[]> {
    return this.prisma.order.findMany({
      include: {
        products: true,
      },
    });
  }

  findOne(orderId: number): Promise<Order> {
    if (!orderId) {
      throw new BadRequestException('Un ID de commande valide est requis');
    }
    const order = this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        products: true,
      },
    });

    if (!order) {
      throw new NotFoundException(
        `La commande avec l'ID ${orderId} n'existe pas`,
      );
    }

    return order;
  }

  async update(orderId: number, orderData: CreateOrderDto): Promise<Order> {
    if (!orderId) {
      throw new BadRequestException('Un ID de commande valide est requis');
    }
    try {
      return this.prisma.$transaction(async (prisma) => {
        // Vérifier l'existence de la commande

        if (!orderId) {
          throw new Error(`Commande avec l'ID ${orderId} non trouvée.`);
        }

        // Vérifier l'existence des produits
        const productIds = orderData.products.map((p) => p.productId);
        const existingProducts = await prisma.product.findMany({
          where: {
            id: { in: productIds },
          },
        });
        const existingProductIds = new Set(existingProducts.map((p) => p.id));

        // Trouver les produits non existants
        const nonExistingProducts = productIds.filter(
          (id) => !existingProductIds.has(id),
        );
        if (nonExistingProducts.length > 0) {
          throw new NotFoundException(
            `Les produits suivants n'existent pas: ${nonExistingProducts.join(
              ', ',
            )}`,
          );
        }

        const totalPrice = orderData.products.reduce(
          (acc, curr) =>
            acc +
            existingProducts.find((p) => p.id === curr.productId).price *
              curr.quantity,
          0,
        );

        const order = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: orderData.status,
            totalPrice: totalPrice,
          },
        });

        // Supprimer les produits de la commande
        await prisma.orders_products.deleteMany({
          where: { orderId },
        });

        // Ajouter les nouveaux produits
        const orderProductsData = orderData.products.map((product) => {
          return {
            orderId: orderId,
            productId: product.productId,
            quantity: product.quantity,
          };
        });

        await prisma.orders_products.createMany({
          data: orderProductsData,
        });

        return order;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Gérer la commande non trouvée
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `La commande avec l'ID ${orderId} n'existe pas`,
          );
        }
      }
      throw error;
    }
  }

  async remove(orderId: number): Promise<Order> {
    if (!orderId) {
      throw new BadRequestException('Un ID de commande valide est requis');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(
        `La commande avec l'ID ${orderId} n'existe pas`,
      );
    }

    try {
      await this.prisma.orders_products.deleteMany({
        where: { orderId },
      });

      return this.prisma.order.delete({
        where: { id: orderId },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Gérer la commande non trouvée
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `La commande avec l'ID ${orderId} n'existe pas`,
          );
        }
      }
      throw error;
    }
  }
}
