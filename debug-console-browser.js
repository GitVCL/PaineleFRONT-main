// Script para testar o Console de Movimentações no navegador
// Execute este script no console do navegador na página /resultados

console.log('🔍 Iniciando debug do Console de Movimentações...');

// Verificar se há usuário logado
const usuario = localStorage.getItem('usuario');
console.log('👤 Usuário no localStorage:', usuario ? JSON.parse(usuario) : 'Não encontrado');

// Verificar se há token
if (usuario) {
  const userData = JSON.parse(usuario);
  console.log('🔑 Token presente:', !!userData.token);
  console.log('🔑 Token (primeiros 20 chars):', userData.token ? userData.token.substring(0, 20) + '...' : 'Não encontrado');
}

// Testar chamadas da API manualmente
async function testarAPI() {
  try {
    console.log('🌐 Testando API...');
    
    // Simular chamada para vendas
    const response = await fetch('http://localhost:3001/api/vendas', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('usuario')).token}`
      }
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Vendas retornadas:', data.length, data);
    } else {
      const errorText = await response.text();
      console.error('❌ Erro na API:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error);
  }
}

// Executar teste
testarAPI();

console.log('✅ Debug script executado. Verifique os logs acima.');