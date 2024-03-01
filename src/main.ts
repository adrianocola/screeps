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

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  roomSystems();

  if (Game.rooms.sim) {
    console.log('DURATION:', Date.now() - start);
    if (!Game.rooms.sim.memory.visuals) Game.rooms.sim.memory.visuals = { blueprint: true };
  } else {
    console.log(Game.cpu.getUsed());
  }
});

// MUDAR BLUEPRINT PARA IGNORAR SWAMPS PARA DECIDIR DISTÂNCIAS! (vou colocar roads em cima mesmo)

// CRIAR LÓGICA PARA EXPANSÃO!
//  - Criar score de expansão da sala
//    - se cabe blueprint na sala (sem gastar muita CPU)
//    - quantidade sources
//    - distância entre blueprint, sources, controller e mineral
//    - minério que ainda não tenho
//    - quantidade de inimigos adjacentes
//    - level de inimigos adjacentes
//    - se tem estruturas inimigas (ramparts e outras estruturas)
//    - se tem muitas constructed walls (podem atrapalhar posicionamento do blueprint)
//    - talvez fazer score de blueprint desconsiderando constructed wall (E aí ter uma opção pra destruir algumas constructed walls que fiquem no caminho)
//    - quantidade de swamps
//    - quantidade de saídas (espaços de saída, mais difícil de defender)
//    - quantidade de salas adjacentes
//    - se é adjacente a highway (com saída pra ela)
//    - se tem invader core (acho que pode desconsiderar, já que é temporário ou posso destruir)
//  - criar lógica central, que controla se deve expandir (se tem GPL), salas boas, etc
//  - sala tem que conseguir uma permissão pra expandir do controlador central
//  - Forçar scan e blueprint quando controller for tomado ( no geral, devem sempre execugar quando subir de level
//  - scout (passa por salas adjacentes, faz scan, pega score de expansão da sala)
//    - Passa pelas 8 salas em volta da sala alvo (a atual ou alguma outra), registrando estado das salas
//    - Manter algum tipo de memória entre creeps, caso o explorador morra explorando. O próximo explorador deve seguir de onde o primeiro parou
//      - Criar uma exploration queue na memória da sala, que o explorador se guia por ela e vai removendo as salas exploradas
//  - cleaner (limpa estrutura inimigas e invader cores)
//  - claimer (ataca controller reservado ou reserva. Depois que cleaner terminar, faz CLAIM)
//  - X basic (mineram, constroem spawn, etc)
//    - sala de origem vai ajudando até a sala chegar no lvl 3 ou 4

//
// FAZER LÓGICA MELHORADA DE SAFE MODE / DEFENSE!!!
// - Considerar UNDER_ATTACK se encontrar creeps inimigas ( de outros players) na sala
// - Em mode defesa, alguns creeps fogem de atacantes (tipo harvester)
// - Maiioria da lógica de ataque deve focar outras creeps. Criar uma creep que fica fugindo? (garantir sempre 4 de distância)
// - Distributors e transferes focam mais em mandar energia pra torres
// - Parar upgrade de controller (upgraders vão pra cima dos inimigos pra atrasar eles)
// - Ativar só alguns sistemas se tiver inimigos

// CONTINUAR AQUI!
//  - Forçar execução de scan e blueprint quando a sala subir de level (manter último level na memory e comparar)
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
