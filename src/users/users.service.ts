import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
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

    // Limite máximo - questões de segurança
    const MAX_LIMIT = 50;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Se passar select, aplica os campos específicos
    if (select) {
      const fields = this.validateAndGetFields(select);
      queryBuilder.select(fields.map((field) => `user.${field}`));
    }

    if (ordenarPor) {
      this.applyOrdering(queryBuilder, ordenarPor, ordem);
    }

    // Retorna todos se limite = 0
    if (limit === 0) {
      const users = await queryBuilder.getMany();
      if (!users) {
        throw new NotFoundException();
      }

      return {
        usuarios: users,
        total: users.length,
        limite: 0,
        pulo: 0,
      };
    }

    const secureLimit = Math.min(limit, MAX_LIMIT);
    const total = await queryBuilder.getCount();
    queryBuilder.skip(skip).take(secureLimit);
    const users = await queryBuilder.getMany();

    return {
      usuarios: users,
      total_de_registros: total,
      limite: secureLimit,
      pulo: skip,
      paginas: Math.ceil(total / secureLimit),
      pagina_atual: Math.floor(skip / secureLimit) + 1,
    };
  }

  async filterBy(
    key: string,
    value: string,
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
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Aplicar seleção de campos se fornecido
    if (select) {
      const fields = this.validateAndGetFields(select);
      queryBuilder.select(fields.map((field) => `user.${field}`));
    }

    if (ordenarPor) {
      this.applyOrdering(queryBuilder, ordenarPor, ordem);
    }

    // Lógica do Filtro Dinâmico
    const parts = key.split('.');

    if (parts.length === 1) {
      // Campo simples: WHERE user.nome = :value
      const metadata = this.userRepository.metadata;
      const validFields = metadata.columns.map((col) => col.propertyName);

      if (!validFields.includes(key)) {
        throw new BadRequestException(`Campo inválido: ${key}`);
      }

      queryBuilder.where(`user.${key} = :value`, { value });
    } else if (parts.length === 2) {
      // Campo aninhado JSON: WHERE user.cabelo->>'cor' = :value
      const [parentField, childField] = parts;

      const metadata = this.userRepository.metadata;
      const validFields = metadata.columns.map((col) => col.propertyName);

      if (!validFields.includes(parentField)) {
        throw new BadRequestException(`Campo inválido: ${parentField}`);
      }

      // Verifica se o campo é do tipo JSON
      const column = metadata.columns.find(
        (col) => col.propertyName === parentField,
      );

      if (!column || (column.type !== 'json' && column.type !== 'jsonb')) {
        throw new BadRequestException(
          `O campo ${parentField} não é do tipo JSON`,
        );
      }

      // Usando operador JSON do PostgreSQL/MySQL
      queryBuilder.where(`user.${parentField} ->> :childField = :value`, {
        childField,
        value,
      });
    } else {
      throw new BadRequestException(
        'Formato de chave inválido. Use "campo" ou "campo.subcampo"',
      );
    }

    const total = await queryBuilder.getCount();

    // Retornar todos se limite = 0
    if (limit === 0) {
      const users = await queryBuilder.getMany();
      return {
        usuarios: users,
        total_de_registros: total,
        limite: 0,
        pulo: 0,
        filtro: { chave: key, valor: value },
      };
    }

    const secureLimit = Math.min(limit, MAX_LIMIT);
    const users = await queryBuilder.skip(skip).take(secureLimit).getMany();

    return {
      usuarios: users,
      total_de_registros: total,
      limite: secureLimit,
      pulo: skip,
      paginas: Math.ceil(total / secureLimit),
      pagina_atual: Math.floor(skip / secureLimit) + 1,
      filtro: { chave: key, valor: value },
    };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  async findRandom(limit: number = 5) {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();
    if (!users) {
      throw new NotFoundException();
    }
    return users;
  }

  async search(query: string, limit: number = 3) {
    if (!query || query.trim() === '') {
      throw new BadRequestException('Query de busca não pode estar vazia');
    }
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.nome) LIKE LOWER(:query)', { query: `%${query}%` })
      .orWhere('LOWER(user.sobrenome) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .orWhere('LOWER(user.nome_usuario) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .limit(limit)
      .getMany();

    if (!users) {
      throw new NotFoundException();
    }
    return users;
  }

  private validateAndGetFields(select: string): string[] {
    const fields = select.split(',').map((field) => field.trim());
    const metadata = this.userRepository.metadata;
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
    const metadata = this.userRepository.metadata;
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

    queryBuilder.orderBy(`user.${orderBy}`, direction);
  }
}
