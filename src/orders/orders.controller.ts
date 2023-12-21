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
import { OrdersService } from './orders.service';
import { Order as OrderModel } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() orderData: CreateOrderDto): Promise<OrderModel> {
    if (
      !orderData.userId ||
      !orderData.status ||
      !orderData.totalPrice ||
      !orderData.products
    ) {
      throw new BadRequestException('Tous les champs sont obligatoires');
    }

    const { userId, status, totalPrice, products } = orderData;

    return this.ordersService.create({ userId, status, totalPrice }, products);
  }

  @Get()
  findAll(): Promise<OrderModel[]> {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<OrderModel> {
    return this.ordersService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() productData: { status?: string; totalPrice?: number },
  ): Promise<OrderModel> {
    return this.ordersService.update(+id, productData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
