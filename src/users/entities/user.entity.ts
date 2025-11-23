import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  nome: string;

  @Column({ length: 100 })
  sobrenome: string;

  @Column()
  idade: number;

  @Column({ length: 20 })
  sexo: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 20 })
  telefone: string;

  @Column({ unique: true, length: 50 })
  nome_usuario: string;

  @Column({ length: 255 })
  senha: string;

  @Column({ type: 'date' })
  data_nascimento: Date;

  @Column({ length: 5 })
  tipo_sanguineo: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  altura: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  peso: number;

  @Column({ length: 20 })
  cor_olho: string;

  @Column({ type: 'jsonb' })
  cabelo: {
    cor: string;
    tipo: string;
  };

  @Column({ type: 'jsonb' })
  endereco: {
    rua: string;
    cidade: string;
    estado: string;
    sigla_estado: string;
    cep: string;
    coordenadas: {
      latitude: number;
      longitude: number;
    };
    pais: string;
  };

  @Column({ length: 50, name: 'endereco_mac' })
  enderecoMac: string;

  @Column({ length: 150 })
  faculdade: string;

  @Column({ type: 'jsonb' })
  banco: {
    cartao_expiracao: string;
    cartao_numero: string;
    cartao_tipo: string;
    moeda: string;
    iban: string;
  };

  @Column({ type: 'jsonb' })
  empresa: {
    departamento: string;
    nome: string;
    cargo: string;
    endereco: {
      rua: string;
      cidade: string;
      estado: string;
      sigla_estado: string;
      cep: string;
      coordenadas: {
        lat: number;
        lng: number;
      };
      pais: string;
    };
  };

  @Column({ length: 20 })
  ein: string;

  @Column({ length: 20 })
  ssn: string;

  @Column({ type: 'text', name: 'user_agent' })
  userAgent: string;

  @Column({ type: 'jsonb' })
  cripto: {
    moeda: string;
    carteira: string;
    rede: string;
  };

  @Column({ length: 50 })
  funcao: string;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
