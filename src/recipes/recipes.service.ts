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
  async findAll(
    limit: number = 10,
    skip: number = 0,
    select?: string,
    ordenarPor?: string,
    ordem?: string,
  ) {
    if (limit < 0 || skip < 0) {
      throw new BadRequestException(
        'Limite e pulo devem ser números positivos',
      );
    }

    const MAX_LIMIT = 50;

    const queryBuilder = this.recipeRepository.createQueryBuilder('recipe');

    if (select) {
      const fields = this.validateAndGetFields(select);
      queryBuilder.select(fields.map((field) => `recipe.${field}`));
    }

    if (ordenarPor) {
      this.applyOrdering(queryBuilder, ordenarPor, ordem);
    }

    if (limit === 0) {
      const recipes = await queryBuilder.getMany();
      if (!recipes) {
        throw new NotFoundException();
      }

      return {
        receitas: recipes,
        total: recipes.length,
        limite: 0,
        pulo: 0,
      };
    }

    const secureLimit = Math.min(limit, MAX_LIMIT);
    const total = await queryBuilder.getCount();
    queryBuilder.skip(skip).take(secureLimit);
    const recipes = await queryBuilder.getMany();

    return {
      receitas: recipes,
      total_de_registros: total,
      limite: secureLimit,
      pulo: skip,
      paginas: Math.ceil(total / secureLimit),
      pagina_atual: Math.floor(skip / secureLimit) + 1,
    };
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

  private validateAndGetFields(select: string): string[] {
    const fields = select.split(',').map((field) => field.trim());
    const metadata = this.recipeRepository.metadata;
    const validFields = metadata.columns.map((col) => col.propertyName);

    const invalidFields = fields.filter(
      (field) => !validFields.includes(field),
    );
    if (invalidFields.length > 0) {
      throw new BadRequestException(
        `Campos inválidos: ${invalidFields.join(', ')}`,
      );
    }

    if (!fields.includes('id')) {
      fields.unshift('id');
    }

    return fields;
  }

  private applyOrdering(
    queryBuilder: any,
    orderBy: string,
    order?: string,
  ): void {
    const metadata = this.recipeRepository.metadata;
    const validFields = metadata.columns.map((col) => col.propertyName);

    if (!validFields.includes(orderBy)) {
      throw new BadRequestException(
        `Campo inválido para ordenação: ${orderBy}`,
      );
    }

    // Validar e normalizar a ordem
    const normalizedOrder = order?.toLowerCase();

    if (
      normalizedOrder &&
      !['crescente', 'decrescente', 'asc', 'desc'].includes(normalizedOrder)
    ) {
      throw new BadRequestException(
        'Ordem deve ser "crescente", "decrescente", "asc" ou "desc"',
      );
    }

    // Mapear para ASC/DESC do TypeORM
    let direction: 'ASC' | 'DESC' = 'ASC';

    if (normalizedOrder === 'decrescente' || normalizedOrder === 'desc') {
      direction = 'DESC';
    }

    queryBuilder.orderBy(`recipe.${orderBy}`, direction);
  }
}
