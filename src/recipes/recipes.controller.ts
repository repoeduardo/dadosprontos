import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
  async findByTag(@Param('tag') tag: string) {
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
  findAll() {
    return this.recipesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recipesService.findOne(Number(id));
  }
}
