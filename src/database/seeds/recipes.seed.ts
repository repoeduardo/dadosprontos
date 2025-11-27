import { DataSource } from 'typeorm';
import { Seed } from './seed.interface';
import { Recipe } from 'src/recipes/entities/recipe.entity';
import recipesData from '../data/receitas.json';

export class RecipesSeed implements Seed {
  async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(Recipe);

    const data = Array.isArray(recipesData)
      ? recipesData
      : (recipesData as any).default;

    const count = await repository.count();
    if (count > 0) {
      console.log('🔴 Receitas já existem no banco. Pulando seed...');
      return;
    }

    const allRecipes = data.map((r) => {
      const recipe = repository.create({
        nome: r.nome,
        ingredientes: r.ingredientes,
        instrucoes: r.instrucoes,
        tempo_preparo_minutos: r.tempo_preparo_minutos,
        tempo_cozimento_minutos: r.tempo_cozimento_minutos,
        porcoes: r.porcoes,
        dificuldade: r.dificuldade,
        culinaria: r.culinária,
        calorias_por_porcao: r.calorias_por_porcao,
        tags: r.tags,
        usuario_id: r.usuario_id,
        avaliacao: r.avaliacao,
        revisoes: r.revisoes,
        tipo_refeicao: r.tipo_refeicao,
      });
      return recipe;
    });

    await repository.save(allRecipes);

    console.log(
      `🟢 Receitas criadas com sucesso!\n Total de registros: ${allRecipes.length} \n`,
    );
  }
}
