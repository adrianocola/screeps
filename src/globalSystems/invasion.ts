// 1 informar sala alvo
// 2 decidir por onde entrar na sala (ver posição das torres, caminho até elas, se tem rampart ou não, etc)
// 3 decidir quais das minhas salas vão ajudar (até uns 5 de distância da sala alvo?). Parar upgrade nessas salas.
// 4 spawnar creeps (tamanho e quantidade de creeps baseado na quantidade de inimigos/sala/torres)
// 5 agrupar creeps, na formação do squad, ao lado da sala alvo (de acordo com escolha no passo 2)
// 6 invadir sala, priorizar creeps defensoras ou torres
//   6.1 tomar cuidado com creeps que só fogem, levando para longe das torres
//   6.2 tomar cuidado posição ao lado da torre, para que as creeps não se amontoem (creeps devem andarr e atacar em volta da torre)
//   6.3 tomar cuidado com creeps do squad que perdem partes de movimento (ficam paradas atrapalhando as outras)
// 7 coletar informações sobre a invasão:
//   7.1 qual tipo de creep foi atacado primeiro? Sempre a mais próxima? A que tem mais attack ou heal? A que tem menos vida?
//   7.2 registrar o tempo que durou a invasão do squad (até todas as creeps morrerem)
//   7.3 registar o dano feito e a distância percorrida na sala
// 8 decidir se faz um novo ataque (talvez aumentando número de creeps) ou aborta a invasão
//   8.1 se não houve progresso na invasão após X tentativas, abortar
//   8.2 verificar informações coletadas e tentar uma nova abordagem (entrar por outro lado da sala, deixar creep parada tomando dado, etc)
//
// FICAR ESPERTO SE A SALA NÃO ENTRA EM SAFE MODE!
