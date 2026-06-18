import { CircuitBreaker } from '../src/lib/circuit-breaker';

// Cria um disjuntor de teste que desarma após 3 falhas e espera 5 segundos (5000ms) para testar de novo
const breaker = new CircuitBreaker({ failureThreshold: 3, resetTimeout: 5000 });

// Função que simula a API da Stripe. Vai falhar (dar erro) de propósito!
async function simularStripe() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Stripe Offline! (Erro de Conexão)'));
    }, 100);
  });
}

// Função auxiliar para esperar
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function runTest() {
  console.log('=== TESTE DO DISJUNTOR (CIRCUIT BREAKER) ===\n');

  // Vamos tentar fazer 5 requisições seguidas (simulando 5 usuários clicando em comprar ao mesmo tempo)
  for (let i = 1; i <= 5; i++) {
    console.log(`[Usuário ${i}] Tentando acessar a Stripe...`);
    try {
      await breaker.execute(() => simularStripe());
    } catch (e: any) {
      if (e.message === 'CircuitBreaker is OPEN') {
        console.log(`❌ [Usuário ${i}] Bloqueado! O Disjuntor DESARMOU para proteger o servidor.`);
      } else {
        console.log(`⚠️ [Usuário ${i}] Falha na Stripe: ${e.message}`);
      }
    }
  }

  console.log(`\nStatus atual do Disjuntor: ${breaker.getState()}`);
  
  console.log('\n⌛ Aguardando 6 segundos para a auto-recuperação (esfriar o disjuntor)...');
  await sleep(6000);

  console.log('\n[Usuário 6] Tentando acessar a Stripe novamente (Disjuntor vai testar a conexão)...');
  try {
    await breaker.execute(() => simularStripe());
  } catch (e: any) {
    if (e.message === 'CircuitBreaker is OPEN') {
        console.log(`❌ [Usuário 6] Bloqueado! O Disjuntor continua desarmado.`);
    } else {
        console.log(`⚠️ [Usuário 6] A Stripe ainda está com problema. O Disjuntor vai desarmar novamente! (${e.message})`);
    }
  }

  console.log(`\nStatus final do Disjuntor: ${breaker.getState()}`);
  console.log('=== FIM DO TESTE ===\n');
}

runTest();
