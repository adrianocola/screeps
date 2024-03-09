import roomSystems from './roomSystems';
import globalSystems from './globalSystems';
import { getRootSpawn } from 'utils/game';
import { ErrorMapper } from 'utils/ErrorMapper';
import { ROOM_MAX_TICKS_IN_MEMORY } from 'consts';

// adicionar MemHack (https://wiki.screepspl.us/index.php/MemHack)
export const loop = ErrorMapper.wrapLoop(() => {
  const start = Date.now();
  if (!Memory.rootSpawn) {
    console.log('Set the property "rootSpawn" with the root Spawn name in the Memory to start');
    return;
  }
  if (!Memory.global) Memory.global = { minerals: {}, lastRuns: {}, duration: 0 };
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
    console.log(Game.cpu.getUsed());
  }
});

// considerar expandir para até 2 de distância de uma sala controlada (senão nunca vou atravessar highways, ou posso perder salas boas)
// revisar se vou expandir a cada 50k ticks mesmo. Talvez só expandir em 50k ticks se a sala for boa (200+ de score). Senão só expandir a cada 100k
// talvez não construir algumas estruturas se a sala só tiver 1 source (ex: labs, terminal, nuke, etc)
// quando acabar de expandir, setar tick da global.expansion como o tick atual do jogo. PRa só começar a expandir depois de 50k ticks de TERMINAR a expansão
// Arrumar harvester walker, as vezes ele nasce e vai pro source errado (o que não tem energy, por exemplo)

// - CRIAR LÓGICA PARA MINERAR SALA NEUTRAL
// - CRIAR LÓGICA PARA CERCAR SALA COM WALLS/RAMPARTS

//
// FAZER LÓGICA MELHORADA DE SAFE MODE / DEFENSE!!!
// - Considerar UNDER_ATTACK se encontrar creeps inimigas ( de outros players) na sala
// - Em mode defesa, alguns creeps fogem de atacantes (tipo harvester)
// - Maiioria da lógica de ataque deve focar outras creeps. Criar uma creep que fica fugindo? (garantir sempre 4 de distância)
// - Distributors e transferes focam mais em mandar energia pra torres
// - Parar upgrade de controller (upgraders vão pra cima dos inimigos pra atrasar eles)
// - Ativar só alguns sistemas se tiver inimigos

// CONTINUAR AQUI!
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
