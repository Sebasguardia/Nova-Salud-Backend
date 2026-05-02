import { Controller, Get } from '@nestjs/common';
import { Public } from './shared/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  getHello() {
    return {
      message: '¡Bienvenido a la API de Salud Nova Backend! 🚀',
      version: '1.0.0',
      status: 'API funcionando correctamente',
    };
  }
}
