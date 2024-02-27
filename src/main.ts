import roomSystems from './roomSystems';
import { getRootSpawn } from 'utils/game';
import { ErrorMapper } from 'utils/ErrorMapper';

export const loop = ErrorMapper.wrapLoop(() => {
  const start = Date.now();
  if (!Memory.rootSpawn) {
    console.log('Set the property "rootSpawn" with the root Spawn name in the Memory to start');
    return;
  }
  if (!Memory.username) {
    Memory.username = getRootSpawn().owner.username;
  }

  // TODO make this run only every X ticks
  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  roomSystems();
  // console.log(Game.cpu.getUsed());

  if (Game.rooms.sim) {
    console.log('DURATION:', Date.now() - start);
    if (!Game.rooms.sim.memory.visuals) Game.rooms.sim.memory.visuals = { blueprint: true };
  }
});

// CRIAR LÓGICA PARA EXPANSÃO!
//  - IMPORTANTE: criar variação do scan para expansão (não precisa de tudo, só de algumas coisas)
//  - scout (passa por salas adjacentes, faz scan, pega score de expansão da sala)
//  - cleaner (limpa estruturar inimigas, invader cores)
//  - claimer (ataca controller reservado ou reserva. Depois que cleaner terminar, faz CLAIM)
//  - X basic (mineram, constroem spawn, etc)

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
//  - Deixar lógica do BlueprintScanner rodar por um pouco mais de tempo, tentar fazer um mapa mais otimizado e "fechado"
//  - Fazer lógica para fechar sala com walls/ramparts (melhores lugares para colocar, etc)
//  - Usar energia das expansions mais pertas do Spawn central (uma ordem de EXT_PACK deve resolver)
//  - Verificar o que acontece com o blueprint se não couber base em um sala (provavelmente zerar score da sala pra não ser escolhida pra expandir)
//  - Verificar o que acontece com o blueprint scanner se não couber todas extension em uma sala (ex: W42S29) (provavelmente baixar bem score da sala pra não ser escolhida pra expandir)
//  - Criar score da sala pra expansão (baseado em distância entre pontos de interesse, quantidade de saídas, custo pra proteger, etc)
//  - Fazer lógica de defesa melhorada
//     - Checar em menos ticks (atualmente é de 5 em 5)
//     - Se torres não estiverem dando conta de matar rapidamente os inimigos, ativar safe mode
//     - Não ativar safe mode para neutrals
