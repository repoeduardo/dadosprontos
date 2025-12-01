import { DataSource } from 'typeorm';
import { Seed } from './seed.interface';
import { Product } from 'src/products/entities/product.entity';
import productsData from '../data/produtos.json';

export class ProductsSeed implements Seed {
  async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(Product);

    const data = Array.isArray(productsData)
      ? productsData
      : (productsData as any).default;

    const count = await repository.count();

    if (count > 0) {
      console.log('🔴 Produtos já existem no banco. Pulando seed...');
      return;
    }

    const allProducts = data.map((p) => {
      const product = repository.create({
        titulo: p.titulo,
        descricao: p.descricao,
        categoria: p.categoria,
        preco: p.preco,
        porcentagem_desconto: p.porcentagem_desconto,
        avaliacao: p.avaliacao,
        estoque: p.estoque,
        tags: p.tags,
        marca: p.marca,
        sku: p.sku,
        peso: p.peso,
        dimensoes: p.dimensoes,
        garantia: p.garantia,
        envio: p.envio,
        status_disponibilidade: p.status_disponibilidade,
        avaliacoes: p.avaliacoes,
        politica_reembolso: p.politica_reembolso,
        ordem_pedido_minima: p.ordem_pedido_minima,
        metadados: p.metadados,
      });
      return product;
    });

    await repository.save(allProducts);

    console.log(
      `🟢 Produtos criados com sucesso!\n Total de registros: ${allProducts.length} \n`,
    );
  }
}
