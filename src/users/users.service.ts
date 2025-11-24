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

  async findAll(limit: number = 10, skip: number = 0, select?: string) {
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
      const fields = select.split(',').map((field) => field.trim());

      // Pega os campos válidos do metadata da entidade
      const metadata = this.userRepository.metadata;
      const validFields = metadata.columns.map((col) => col.propertyName);

      // Valida campos
      const invalidFields = fields.filter(
        (field) => !validFields.includes(field),
      );
      if (invalidFields.length > 0) {
        throw new BadRequestException(
          `Campos inválidos: ${invalidFields.join(', ')}`,
        );
      }

      /* Campos sensíveis que não podem ser selecionados -> verificar depois se faz sentido ativar esse:
      const camposSensiveis = ['senha'];
      const camposProibidos = campos.filter((campo) =>
        camposSensiveis.includes(campo),
      );

      if (camposProibidos.length > 0) {
        throw new BadRequestException(
          `Não é permitido selecionar campos sensíveis: ${camposProibidos.join(', ')}`,
        );
      }
        */

      // Sempre incluir o ID
      if (!fields.includes('id')) {
        fields.unshift('id');
      }

      queryBuilder.select(fields.map((field) => `user.${field}`));
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
}
