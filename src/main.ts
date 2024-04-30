import roomSystems from './roomSystems';
import globalSystems from './globalSystems';
import { getRootSpawn } from 'utils/game';
import { ErrorMapper } from 'utils/ErrorMapper';
import { EXPANSION_START_COUNTDOWN, ROOM_MAX_TICKS_IN_MEMORY } from 'consts';

// adicionar MemHack (https://wiki.screepspl.us/index.php/MemHack)
export const loop = ErrorMapper.wrapLoop(() => {
  const start = Date.now();
  if (!Memory.rootSpawn) {
    console.log('Set the property "rootSpawn" with the root Spawn name in the Memory to start');
    return;
  }
  if (!Memory.global)
    Memory.global = { minerals: {}, lastRuns: {}, duration: 0, expansionCountdown: EXPANSION_START_COUNTDOWN };
  if (!Memory.username) Memory.username = getRootSpawn().owner.username;

  // Automatically delete memory of missing creeps
  if (Game.time % 10 === 0) {
    for (const name in Memory.creeps) {
      if (!(name in Game.creeps)) {
        delete Memory.creeps[name];
      }
    }
  }
  if (Game.time % 100 === 0) {
    // Automatically delete memory of rooms scaned a long time ago
    for (const roomName in Memory.rooms) {
      const roomMemory = Memory.rooms[roomName];
      if (!roomMemory?.scan?.tick || Game.time - roomMemory.scan.tick > ROOM_MAX_TICKS_IN_MEMORY) {
        delete Memory.rooms[roomName];
      }
    }
  }

  roomSystems();
  globalSystems();

  if (Game.rooms.sim) {
    console.log('DURATION:', Date.now() - start);
    if (!Game.rooms.sim.memory.visuals) Game.rooms.sim.memory.visuals = { blueprint: true };
  } else {
    console.log(Game.cpu.getUsed().toFixed(2));
  }
});

// Revisar calculo de blueprint:
//    Se usar maxCount grande (100+) está demorando muito.
//    O que está pesando sãos os cálculos de path. Ver se é possível excluir localizações ruins antes de fazer esses cálculos
//    Talvez só executar se bucket estiver cheio?
// Arrumar erro:
//    Script execution timed out: CPU time limit reached
//    at fromWorldPosition (<runtime>:20366:31)
//    at search (<runtime>:20432:29)
// Criar um outro sistema de status de sala que não dependa de scan (tipo se está expandindo)
// Melhorar lógica de movimentação entre salas pra evitar salas de outros players.
//   - Melhorar tb a movimentaçõa DENTRO da sala, já que as vezes o creep pode sair para outra sala e voltar por outro caminha (rota menor), ver sala shard3/W46S59
// Implementar logo lógica que limita expansão pela quantidade de CPU. E também lógica que abandona salas com 1 source
// Não spawnar defender sew tiver outra creep de defesa na sala (caso esteja expandindo, por exemplo)
// Collector -> Se tiver tombstone ou energy perto do main spawn, pegar e colocar no storage
// Mudar regra do scavenger -> se for in invader com recursos, já spawnar scavenger
// Ao expandir, verificar se caminho entre as salas é seguro (não passar por salas de outros players)
// Considerar ignorar outras creeps ao se movimentar dentro da sala (pelo menos para distributor e collector)
// no lvl7, fazer uma road entre os 2 sources (para sala com 2 sources). Ajuda muito o harvesterWalker.
// mover lógica de scavenger de dentro de defense. É meio estranho estar lá.
// considerar construir extensions antes de roads, pois se tiver roads na pedra demora muito pra fazer (e as extensions produzem creeps melhores, principalemente em lvls mais baixos)
// Em vez de executar lógica inteira da sala, executar cada sistema de cada sala antes de seguir para o próximo sistema
//   - Isso garante que os sistemas mais importantes serão executados em todas salas (caso alguma sala consuma muita CPU ou crash)
// Depois de terminar de construir uma road na room, setar scanPaths=true para que próximo scan avalie "paved"

// Manter storage ao lado do spawn. Usar ele como lugar para as screeps reciclarem (recursos caem lá)
//     Fazer distributor pegar recurso de lá primeiro (se tiver ou se passar por lá)
// Ajustar remove harvester para cancelar harvest se tiver inimigos fortes na sala (de player). Tentar só depois de um tempo
// Ou então mandar cleaners melhores pra matar os inimigos
// Ordenar body parts (ou intercalar, sei lá)

// Não construir algumas estruturas em salas com apenas 1 source (tipo factory, labs, nuker, etc). Talvez nem precise de muitas extensions tb
// - MINERAR SOURCES COM SOURCE KEEPER!
// - MUDAR LÓGICA DE EXPANSÃO, não considerar inimigos na sala para o score. Só considerar os inimigos na sala na hora de expandir (aí ve a condição real da sala)
// - CRIAR LÓGICA PARA CERCAR SALA COM WALLS/RAMPARTS

//
// FAZER LÓGICA MELHORADA DE SAFE MODE / DEFENSE!!!
// - Considerar UNDER_ATTACK se encontrar creeps inimigas ( de outros players) na sala
// - Em mode defesa, alguns creeps fogem de atacantes (tipo harvester)
// - Maiioria da lógica de ataque deve focar outras creeps. Criar uma creep que fica fugindo? (garantir sempre 4 de distância)
// - Distributors e transferes focam mais em mandar energia pra torres
// - Parar upgrade de controller (upgraders vão pra cima dos inimigos pra atrasar eles)
// - Ativar só alguns sistemas se tiver inimigos

//  - Ao detectar que uma construção foi concluída, verificar e atualizar blueprint (colocar o id da strutura do blueprint no request de build?)
//  - Usar energia das expansions mais pertas do Spawn central (uma ordem de EXT_PACK deve resolver)
//  - Verificar o que acontece com o blueprint se não couber base em um sala (provavelmente zerar score da sala pra não ser escolhida pra expandir)
//  - Verificar o que acontece com o blueprint scanner se não couber todas extension em uma sala (ex: W42S29) (provavelmente baixar bem score da sala pra não ser escolhida pra expandir)
//  - Criar score da sala pra expansão (baseado em distância entre pontos de interesse, quantidade de saídas, custo pra proteger, etc)
//  - Fazer lógica de defesa melhorada
//     - Checar em menos ticks (atualmente é de 5 em 5)
//     - Se torres não estiverem dando conta de matar rapidamente os inimigos, ativar safe mode
//     - Não ativar safe mode para neutrals

// TIPOS DE ATAQUES
//   - depletion: se o jogador estiver spawnando uma creep pra outra sala, ficar matando essa creep pra ele gastar energia a toa
//   - force safe mode: forçar o safe mode em um sala do jogador pra atacar outra (só pode ter 1 safe mode ativado por vez)

// TÁTICAS DE DEFESA
//   - criar um creep com MOVE, ATTACK e HEAL que fica fugindo do inimigos (pra atrasar eles enquanto as torres matam)
//      - É importante ter ATTACK e HEAL para que as creeps inimigas identifiquem-o como uma ameaça e tentem matar ele (senão podem ignorá-lo)
