import roomSystems from './roomSystems';
import { getRootSpawn } from 'utils/game';
// import { ErrorMapper } from 'utils/ErrorMapper';

export const loop = () => {
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
};

//
// FAZER LÓGICA MELHORADA DE SAFE MODE / DEFENSE!!!
// - Considerar UNDER_ATTACK se encontrar creeps inimigas ( de outros players) na sala
// - Em mode defesa, alguns creeps fogem de atacantes (tipo harvester)
// - Maiioria da lógica de ataque deve focar outras creeps. Criar uma creep que fica fugindo? (garantir sempre 4 de distância)
// - Distributors e transferes focam mais em mandar energia pra torres
// - Parar upgrade de controller (upgraders vão pra cima dos inimigos pra atrasar eles)
// - Ativar só alguns sistemas se tiver inimigos

// CONTINUAR AQUI!
//  - A partir do lvl3, fazer roads entre todos blueprints com entrances (principalmente por causa dos swamps)
//  - Permitir forçar um scan em situações específicas (construção terminada, feito upgrade do controller, após ataque inimigo, saiu do safe mode, etc)
//  - Métodos getSource e getTarget estão sempre retornando uma structure do tipo Source. Corrigir isso pro tipo correto (ou nem usar mais esses métodos)
//  - Definir prioridades de creeps que o spawn deve criar (defense > basic > harvest1 > collector1 > distributor > harvester2 > collector2 > builder > upgrader)
//  - Melhorar estratégia de urgent do spawn. Avaliar se realmente precisa fazer o creep com qualquer energia que tiver ou se pode esperar um pouco (alguns ticks)
//  - Fazer lógica para fechar sala com walls/ramparts (melhores lugares para colocar, etc)
//  - Fazer lógica de defesa melhorada
//     - Checar em menos ticks (atualmente é de 5 em 5)
//     - Se torres não estiverem dando conta de matar rapidamente os inimigos, ativar safe mode
//     - Não ativar safe mode para neutrals
