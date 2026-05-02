import { IsBoolean, IsEnum, IsInt, IsNumber,
         IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountType } from '@prisma/client';

export class UpdateDiscountRuleDto {
  @IsString()   @IsOptional() name?:      string;
  @IsEnum(DiscountType) @IsOptional() type?: DiscountType;
  @Type(() => Number) @IsNumber() @Min(0) @IsOptional() value?: number;
  @IsString()   @IsOptional() condition?: string;
  @IsBoolean()  @IsOptional() isActive?:  boolean;
  @Type(() => Number) @IsInt() @IsOptional() priority?: number;
}