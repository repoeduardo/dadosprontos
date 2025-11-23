import { Controller, Get } from '@nestjs/common';

@Controller('usuarios')
export class UsersController {
  @Get('hello')
  hello() {
    return 'Rota de usuarios em funcionamento...';
  }
}
