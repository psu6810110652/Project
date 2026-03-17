import { PartialType } from '@nestjs/mapped-types';
import { CreateAddressDto } from './create-address.dto';
import { IsBoolean } from 'class-validator/types/decorator/typechecker/IsBoolean';
import { IsOptional } from 'class-validator/types/decorator/common/IsOptional';
import { IsString } from 'class-validator/types/decorator/typechecker/IsString';

export class UpdateAddressDto extends PartialType(CreateAddressDto) {
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
