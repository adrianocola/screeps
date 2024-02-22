import roomSystems from './roomSystems';
import { getRootSpawn } from 'utils/game';
import { ErrorMapper } from 'utils/ErrorMapper';

export const loop = ErrorMapper.wrapLoop(() => {
  if (!Memory.rootSpawn) {
    console.log('Set the property "rootSpawn" with the root Spawn name in the Memory to start');
    return;
  }
  if (!Memory.username) {
    Memory.username = getRootSpawn().owner.username;
  }

  // TODO only do this evey X ticks
  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  roomSystems();
  // console.log(Game.cpu.getUsed());
});

// FAZER transferer colocar energia na TOWER se precisar. Talvez remover essa responsabilidade do distributer
//
// FAZER LÓGICA MELHORADA DE SAFE MODE / DEFENSE!!!
// - Considerar UNDER_ATTACK se encontrar creeps inimigas ( de outros players) na sala
// - Em mode defesa, alguns creeps fogem de atacantes (tipo harvester)
// - Maiioria da lógica de ataque deve focar outras creeps. Criar uma creep que fica fugindo? (garantir sempre 4 de distância)
// - Distributors e transferes focam mais em mandar energia pra torres
// - Parar upgrade de controller (upgraders vão pra cima dos inimigos pra atrasar eles)
// - Ativar só alguns sistemas se tiver inimigos

// CONTINUAR AQUI!
//  - Permitir forçar um scan em situações específicas (construção terminada, feito upgrade do controller, após ataque inimigo, saiu do safe mode, etc)
//  - Revisar lógica de spawn e upgrader-emergency (tá criando mais do que um). Não lembro como funciona demanda de spawn
//  - Alterar lógica de direções possíveis para um spawn. Olhar lugares em volta (tipo wall e outras contruções e também o blueprint), para decidir os lugares possíveis ( ver blueprint da sala W42S55, Spawn3, pra entender)
//  - Alterar para que primeiro link criado seja o do controller (tem sido o gargalo)
//  - Mudar regra de criação de upgraders, olhar também pra quantidade de energia no storage/link do upgrader pra decidir se spawna mais ou não
//  - Alterar blueprint para deletar estruturas quando necessário (se tiver outra estrutura criada). (Importante para deletar containers que ficam inúteis depois que links são criados)
//  - Métodos getSource e getTarget estão sempre retornando uma structure do tipo Source. Corrigir isso pro tipo correto (ou nem usar mais esses métodos)
//  - Definir prioridades de creeps que o spawn deve criar (defense > basic > harvest1 > collector1 > distributor > harvester2 > collector2 > builder > upgrader)
//  - Melhorar estratégia de urgent do spawn. Avaliar se realmente precisa fazer o creep com qualquer energia que tiver ou se pode esperar um pouco (alguns ticks)
//  - Otimizar collectors, estão muito grandes (muito CARRY) sendo que os harvesters nem estão conseguindo tanta energia (pelo menos foi o que vi no lvl3, com sources pertos)
//  - Fazer lógica para fechar sala com walls/ramparts (melhores lugares para colocar, etc)
//  - Fazer lógica para colocar roads (a partir do lvl4, entre storage x controller, storage x spawns)
//  - Fazer lógica de defesa melhorada
//     - Checar em menos ticks (atualmente é de 5 em 5)
//     - Se torres não estiverem dando conta de matar rapidamente os inimigos, ativar safe mode
//     - Não ativar safe mode para neutrals
