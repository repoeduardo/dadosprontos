import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Seeder } from './seeder';
import 'dotenv/config';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // importante: manter false para seeds
});

async function runSeeder() {
  try {
    console.log('🟡 Tentando conexão ao banco de dados\n');
    await dataSource.initialize();
    console.log('🟢 Conexão estabelecida!\n');

    const seeder = new Seeder();
    await seeder.run(dataSource);

    await dataSource.destroy();
    console.log('🔴 Conexão fechada.');
    process.exit(0);
  } catch (error) {
    console.error('🔴 Erro durante o seeding:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

runSeeder();
