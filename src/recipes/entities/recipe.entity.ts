import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Recipe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  nome: string;

  @Column('text', { array: true })
  ingredientes: string[];

  @Column('text', { array: true })
  instrucoes: string[];

  @Column()
  tempo_preparo_minutos: number;

  @Column()
  tempo_cozimento_minutos: number;

  @Column()
  porcoes: number;

  @Column({ length: 50 })
  dificuldade: string;

  @Column({ length: 50 })
  culinaria: string;

  @Column()
  calorias_por_porcao: number;

  @Column('text', { array: true })
  tags: string[];

  @Column()
  usuario_id: number;

  @Column({ type: 'decimal', precision: 3, scale: 1 })
  avaliacao: number;

  @Column()
  revisoes: number;

  @Column('text', { array: true })
  tipo_refeicao: string[];
}
