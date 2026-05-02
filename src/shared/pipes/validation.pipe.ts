import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object, {
      whitelist:            true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const messages = errors.map((err) =>
        Object.values(err.constraints ?? {}).join(', '),
      );
      throw new BadRequestException({
        message:    'Datos inválidos',
        errors:     messages,
        statusCode: 400,
      });
    }

    return object;
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}