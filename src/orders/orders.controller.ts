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
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order as OrderModel } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { UserRole } from '../enums/user-role.enum';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(UserRole.Admin, UserRole.Client, UserRole.Manager)
  @Post()
  create(@Body() orderData: CreateOrderDto, @Req() req): Promise<OrderModel> {
    if (!orderData.status || !orderData.products) {
      throw new BadRequestException('Tous les champs sont obligatoires');
    }

    const userId = req.user.userId;
    const { status, products } = orderData;

    return this.ordersService.create({ status, products }, userId);
  }

  @Roles(UserRole.Admin, UserRole.Manager)
  @Get()
  findAll(): Promise<OrderModel[]> {
    return this.ordersService.findAll();
  }

  @Roles(UserRole.Admin, UserRole.Manager)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<OrderModel> {
    return this.ordersService.findOne(+id);
  }

  @Roles(UserRole.Admin, UserRole.Manager)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() orderData: CreateOrderDto,
  ): Promise<OrderModel> {
    const { status, products } = orderData;
    return this.ordersService.update(+id, { status, products });
  }

  @Roles(UserRole.Admin, UserRole.Manager)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
