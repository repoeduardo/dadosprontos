import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll() {
    const products = await this.productRepository.find();
    if (!products) {
      throw new NotFoundException();
    }
    return products;
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
}
