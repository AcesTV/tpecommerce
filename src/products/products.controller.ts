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
import { ProductsService } from './products.service';
import { Product as ProductModel } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Manager)
  @Post()
  async create(
    @Body()
    productData: {
      name: string;
      description: string;
      price: number;
      quantityInStock: number;
    },
  ): Promise<ProductModel> {
    if (
      !productData.name ||
      !productData.description ||
      !productData.price ||
      !productData.quantityInStock
    ) {
      throw new BadRequestException('Tous les champs sont obligatoires');
    }

    return this.productsService.create(productData);
  }

  @Get()
  async findAll(): Promise<ProductModel[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductModel> {
    return this.productsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Manager)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    productData: {
      name?: string;
      description?: string;
      price?: number;
      quantityInStock?: number;
    },
  ): Promise<ProductModel> {
    if (!id) {
      throw new BadRequestException('Un ID de produit valide est requis');
    }
    return this.productsService.update(+id, productData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Manager)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ProductModel> {
    return this.productsService.remove(+id);
  }
}
