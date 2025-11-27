import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Recipe } from './entities/recipe.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayContains, Repository } from 'typeorm';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
  ) {}
  async findAll() {
    const recipes = await this.recipeRepository.find();
    if (!recipes) {
      throw new NotFoundException();
    }
    return recipes;
  }

  async findOne(id: number) {
    const recipe = await this.recipeRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!recipe) {
      throw new NotFoundException();
    }
    return recipe;
  }

  async findRandom(limit: number = 5) {
    const recipes = await this.recipeRepository
      .createQueryBuilder('recipe')
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();

    if (!recipes) {
      throw new NotFoundException();
    }
    return recipes;
  }

  async search(query: string, limit: number = 3) {
    if (!query || query.trim() === '') {
      throw new BadRequestException('Query de busca não pode estar vazia');
    }
    const recipes = await this.recipeRepository
      .createQueryBuilder('recipe')
      .where('LOWER(recipe.nome) LIKE LOWER(:query)', { query: `%${query}%` })
      .limit(limit)
      .getMany();

    if (!recipes) {
      throw new NotFoundException();
    }

    return recipes;
  }

  async findAllTags() {
    const result = await this.recipeRepository
      .createQueryBuilder('recipe')
      .select('unnest(recipe.tags)', 'tag')
      .distinct(true)
      .getRawMany();
    return result.map((item) => item.tag);
  }

  async findByTag(tag: string) {
    const recipes = await this.recipeRepository.find({
      where: {
        tags: ArrayContains([tag]),
      },
    });

    if (recipes.length === 0) {
      throw new NotFoundException();
    }

    return recipes;
  }

  async findAllCuisines() {
    const result = await this.recipeRepository
      .createQueryBuilder('recipe')
      .select('DISTINCT recipe.culinaria', 'culinaria')
      .getRawMany();
    return result.map((item) => item.culinaria);
  }

  async findByCuisine(cuisine: string) {
    const recipes = await this.recipeRepository.find({
      where: { culinaria: cuisine },
    });

    if (recipes.length === 0) {
      throw new NotFoundException();
    }

    return recipes;
  }
}
