import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
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

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(Number(id));
  }
}
