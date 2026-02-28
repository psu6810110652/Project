import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateOrderDto {
    @IsString()
    @IsNotEmpty()
    customerName: string;

    @IsArray()
    @IsNotEmpty()
    products: any[];

    @IsNumber()
    @IsNotEmpty()
    totalAmount: number;

    @IsString()
    @IsOptional()
    status?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    customerId?: string;

    @IsString()
    @IsOptional()
    paymentSlip?: string;
}
