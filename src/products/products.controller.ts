import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('produtos')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('categorias')
  findAllCategories() {
    return this.productsService.findAllCategories();
  }

  @Get('categorias/:categoria')
  findByTag(@Param('categoria') category: string) {
    if (!category || category.trim() === '') {
      throw new BadRequestException('Categoria não pode estar vazia');
    }

    return this.productsService.findByCategory(category.trim());
  }

  @Get('aleatorios')
  findRandom() {
    return this.productsService.findRandom();
  }

  @Get('procurar')
  search(@Query('q') query: string) {
    return this.productsService.search(query);
  }

  @Get()
  findAll(
    @Query('limite') limite?: string,
    @Query('pulo') pulo?: string,
    @Query('selecione') selecione?: string,
    @Query('ordenarPor') ordenarPor?: string,
    @Query('ordem') ordem?: string,
  ) {
    const limit = limite ? parseInt(limite, 10) : 10;
    const skip = pulo ? parseInt(pulo, 10) : 0;
    return this.productsService.findAll(
      limit,
      skip,
      selecione,
      ordenarPor,
      ordem,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(Number(id));
  }
}
