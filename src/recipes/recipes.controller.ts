import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';

@Controller('receitas')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get('culinarias')
  findAllCuisines() {
    return this.recipesService.findAllCuisines();
  }

  @Get('culinarias/:culinaria')
  findByCuisine(@Param('culinaria') cuisine: string) {
    return this.recipesService.findByCuisine(cuisine);
  }

  @Get('tags')
  findAllTags() {
    return this.recipesService.findAllTags();
  }

  @Get('tags/:tag')
  findByTag(@Param('tag') tag: string) {
    if (!tag || tag.trim() === '') {
      throw new BadRequestException('Tag não pode estar vazia');
    }

    return this.recipesService.findByTag(tag.trim());
  }

  @Get('aleatorias')
  findRandom() {
    return this.recipesService.findRandom();
  }

  @Get('procurar')
  search(@Query('q') query: string) {
    return this.recipesService.search(query);
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
    return this.recipesService.findAll(
      limit,
      skip,
      selecione,
      ordenarPor,
      ordem,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recipesService.findOne(Number(id));
  }
}
