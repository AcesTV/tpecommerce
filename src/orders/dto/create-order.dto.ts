import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

class CreateOrderProductDto {
  @IsNumber()
  productId: number;
  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsNotEmpty()
  products: CreateOrderProductDto[];
}
