import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, Order, orders_products } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}
  async create(orderData: CreateOrderDto): Promise<Order> {
    try {
      return this.prisma.$transaction(async (prisma) => {
        const order = await prisma.order.create({
          data: {
            userId: orderData.userId,
            status: orderData.status,
            totalPrice: orderData.totalPrice,
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

  update(orderId: number, data: Prisma.OrderUpdateInput) {
    if (!orderId) {
      throw new BadRequestException('Un ID de commande valide est requis');
    }
    try {
      return this.prisma.order.update({
        where: { id: orderId },
        data,
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

  remove(orderId: number): Promise<Order> {
    if (!orderId) {
      throw new BadRequestException('Un ID de commande valide est requis');
    }
    try {
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
