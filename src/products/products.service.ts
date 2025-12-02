import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
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

    const queryBuilder = this.productRepository.createQueryBuilder('product');
    if (select) {
      const fields = this.validateAndGetFields(select);
      queryBuilder.select(fields.map((field) => `product.${field}`));
    }

    if (ordenarPor) {
      this.applyOrdering(queryBuilder, ordenarPor, ordem);
    }

    if (limit === 0) {
      const products = await queryBuilder.getMany();
      if (!products) {
        throw new NotFoundException();
      }

      return {
        produtos: products,
        total: products.length,
        limite: 0,
        pulo: 0,
      };
    }

    const secureLimit = Math.min(limit, MAX_LIMIT);
    const total = await queryBuilder.getCount();
    queryBuilder.skip(skip).take(secureLimit);
    const products = await queryBuilder.getMany();

    return {
      produtos: products,
      total_de_registros: total,
      limite: secureLimit,
      pulo: skip,
      paginas: Math.ceil(total / secureLimit),
      pagina_atual: Math.floor(skip / secureLimit) + 1,
    };
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!product) {
      throw new NotFoundException();
    }
    return product;
  }

  async findRandom(limit: number = 5) {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();

    if (!products) {
      throw new NotFoundException();
    }
    return products;
  }

  async search(query: string, limit: number = 3) {
    if (!query || query.trim() === '') {
      throw new BadRequestException('Query de busca não pode estar vazia');
    }
    const products = await this.productRepository
      .createQueryBuilder('product')
      .where('LOWER(product.titulo) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .limit(limit)
      .getMany();

    if (!products) {
      throw new NotFoundException();
    }

    return products;
  }

  async findAllCategories() {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.categoria', 'categoria')
      .getRawMany();
    return result.map((item) => item.categoria);
  }

  async findByCategory(category: string) {
    const categories = await this.productRepository.find({
      where: { categoria: category },
    });

    if (categories.length === 0) {
      throw new NotFoundException();
    }

    return categories;
  }

  private validateAndGetFields(select: string): string[] {
    const fields = select.split(',').map((field) => field.trim());
    const metadata = this.productRepository.metadata;
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
    const metadata = this.productRepository.metadata;
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

    queryBuilder.orderBy(`product.${orderBy}`, direction);
  }
}
