import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateAddressDto {
    @IsOptional()
    @IsString()
    houseNumber?: string;

    @IsOptional()
    @IsString()
    streetSoi?: string;

    @IsOptional()
    @IsString()
    province?: string;

    @IsOptional()
    @IsString()
    district?: string;

    @IsOptional()
    @IsString()
    subDistrict?: string;

    @IsOptional()
    @IsString()
    postalCode?: string;

    @IsOptional()
    @IsString()
    fullAddress?: string;

    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}
