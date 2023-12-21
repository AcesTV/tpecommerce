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
import { ProductsService } from './products.service';
import { Product as ProductModel } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

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
    return this.productsService.update(+id, productData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ProductModel> {
    return this.productsService.remove(+id);
  }
}
