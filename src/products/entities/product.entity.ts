import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  titulo: string;

  @Column('text')
  descricao: string;

  @Column({ length: 50 })
  categoria: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  preco: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  porcentagem_desconto: number;

  @Column({ type: 'decimal', precision: 3, scale: 1 })
  avaliacao: number;

  @Column('smallint')
  estoque: number;

  @Column('text', { array: true })
  tags: string[];

  @Column({ length: 50 })
  marca: string;

  @Column({ length: 50 })
  sku: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  peso: number;

  @Column({ type: 'jsonb' })
  dimensoes: {
    largura: number;
    altura: number;
    profundidade: number;
  };

  @Column({ length: 50 })
  garantia: string;

  @Column({ length: 100 })
  envio: string;

  @Column({ length: 50 })
  status_disponibilidade: string;

  @Column({ type: 'jsonb' })
  avaliacoes: {
    avaliacao: number;
    comentario: string;
    data: string;
    nome_avaliador: string;
    email_avaliador: string;
  }[];

  @Column({ length: 100 })
  politica_reembolso: string;

  @Column('smallint')
  ordem_pedido_minima: number;

  @Column({ type: 'jsonb' })
  metadados: {
    criado_em: string;
    atualizado_em: string;
    codigo_barra: string;
  };
}
