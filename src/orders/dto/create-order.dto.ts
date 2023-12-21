class CreateOrderProductDto {
  productId: number;
  quantity: number;
}

export class CreateOrderDto {
  userId: number;
  status: string;
  totalPrice: number;
  products: CreateOrderProductDto[];
}
