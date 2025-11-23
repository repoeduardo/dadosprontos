import { DataSource } from 'typeorm';
import { Seed } from './seed.interface';
import { User } from 'src/users/entities/user.entity';
import usersData from '../data/usuarios.json';

export class UsersSeed implements Seed {
  async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(User);

    // await repository.clear();  Remove todos os registros
    const data = Array.isArray(usersData)
      ? usersData
      : (usersData as any).default;

    const count = await repository.count();
    if (count > 0) {
      console.log('🔴 Usuários já existem no banco. Pulando seed...');
      return;
    }

    const allUsers = data.map((user) => {
      // Converte "dd-mm-yyyy" para Date
      const [day, month, year] = user.data_nascimento.split('-');
      const dataNascimento = new Date(`${year}-${month}-${day}`);

      const usuario = repository.create({
        nome: user.nome,
        sobrenome: user.sobrenome,
        idade: user.idade,
        sexo: user.sexo,
        email: user.email,
        telefone: user.telefone,
        nome_usuario: user.nome_usuario,
        senha: user.senha,
        data_nascimento: dataNascimento,
        tipo_sanguineo: user.tipo_sanguineo,
        altura: user.altura,
        peso: user.peso,
        cor_olho: user.cor_olho,
        cabelo: user.cabelo,
        ip: user.ip,
        endereco: user.endereco,
        enderecoMac: user.enderecoMac,
        faculdade: user.faculdade,
        banco: user.banco,
        empresa: user.empresa,
        ein: user.ein,
        ssn: user.ssn,
        userAgent: user.userAgent,
        cripto: user.cripto,
        funcao: user.funcao,
      });
      return usuario;
    });

    await repository.save(allUsers);

    console.log(
      `🟢 Usuários criados com sucesso!\n Total de registros: ${allUsers.length} \n`,
    );
  }
}
