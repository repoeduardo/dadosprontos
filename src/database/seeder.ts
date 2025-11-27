import { DataSource } from 'typeorm';
import { Seed } from './seeds/seed.interface';
import { UsersSeed } from './seeds/users.seed';
import { RecipesSeed } from './seeds/recipes.seed';

export class Seeder {
  private seeds: Seed[] = [new UsersSeed(), new RecipesSeed()];

  async run(dataSource: DataSource): Promise<void> {
    console.log('Iniciando seeding do banco de dados\n');

    for (const seed of this.seeds) {
      try {
        await seed.run(dataSource);
      } catch (error) {
        console.error(
          `🔴 Erro ao executar a seed ${seed.constructor.name}:`,
          error,
        );
        throw error;
      }
    }

    console.log('\n🟢 Seeding concluído!');
  }
}
