import { Controller, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('usuarios')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  findAll(
    @Query('limite') limite?: string,
    @Query('pulo') pulo?: string,
    @Query('selecione') selecione?: string,
  ) {
    const limit = limite ? parseInt(limite, 10) : 10;
    const skip = pulo ? parseInt(pulo, 10) : 0;
    const select = String(selecione);
    return this.usersService.findAll(limit, skip, select);
  }
  @Get('aleatorios')
  findRandom() {
    return this.usersService.findRandom();
  }

  @Get('procurar')
  search(@Query('q') query: string) {
    return this.usersService.search(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(Number(id));
  }
}
