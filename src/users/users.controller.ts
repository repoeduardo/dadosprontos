import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('usuarios')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('filtrar')
  filter(
    @Query('chave') chave?: string,
    @Query('valor') valor?: string,
    @Query('limite') limite?: string,
    @Query('pulo') pulo?: string,
    @Query('selecione') selecione?: string,
  ) {
    if (!chave || !valor) {
      throw new BadRequestException(
        'Os parâmetros "chave" e "valor" são obrigatórios',
      );
    }

    const limit = limite ? parseInt(limite, 10) : 10;
    const skip = pulo ? parseInt(pulo, 10) : 0;

    return this.usersService.filterBy(chave, valor, limit, skip, selecione);
  }

  @Get('aleatorios')
  findRandom() {
    return this.usersService.findRandom();
  }

  @Get('procurar')
  search(@Query('q') query: string) {
    return this.usersService.search(query);
  }

  @Get()
  findAll(
    @Query('limite') limite?: string,
    @Query('pulo') pulo?: string,
    @Query('selecione') selecione?: string,
  ) {
    const limit = limite ? parseInt(limite, 10) : 10;
    const skip = pulo ? parseInt(pulo, 10) : 0;
    return this.usersService.findAll(limit, skip, selecione);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(Number(id));
  }
}
