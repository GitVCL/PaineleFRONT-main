/**
 * Utilitário para verificação de versão e cache busting
 */

let currentVersion = null;
let checkInterval = null;

/**
 * Busca a versão atual do servidor
 */
async function fetchCurrentVersion() {
  try {
    const response = await fetch('/version.json?' + Date.now());
    if (!response.ok) {
      throw new Error('Falha ao buscar versão');
    }
    return await response.json();
  } catch (error) {
    console.warn('Erro ao verificar versão:', error);
    return null;
  }
}

/**
 * Verifica se há uma nova versão disponível
 */
async function checkForUpdates() {
  const newVersion = await fetchCurrentVersion();
  
  if (!newVersion) return false;
  
  // Se é a primeira verificação, apenas armazena a versão atual
  if (!currentVersion) {
    currentVersion = newVersion;
    return false;
  }
  
  // Verifica se a versão ou hash mudou
  const hasUpdate = (
    newVersion.version !== currentVersion.version ||
    newVersion.hash !== currentVersion.hash ||
    newVersion.buildTime !== currentVersion.buildTime
  );
  
  if (hasUpdate) {
    console.log('Nova versão detectada:', newVersion);
    return true;
  }
  
  return false;
}

/**
 * Força o reload da página limpando o cache
 */
function forceReload() {
  // Limpa todos os caches possíveis
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  
  // Limpa localStorage e sessionStorage
  localStorage.clear();
  sessionStorage.clear();
  
  // Força reload com bypass de cache
  window.location.reload(true);
}

/**
 * Inicia a verificação automática de versão
 */
export function startVersionCheck(intervalMinutes = 5) {
  // Verificação inicial
  checkForUpdates();
  
  // Configura verificação periódica
  if (checkInterval) {
    clearInterval(checkInterval);
  }
  
  checkInterval = setInterval(async () => {
    const hasUpdate = await checkForUpdates();
    if (hasUpdate) {
      // Mostra notificação ao usuário
      const shouldReload = confirm(
        'Uma nova versão da aplicação está disponível. Deseja recarregar a página para aplicar as atualizações?'
      );
      
      if (shouldReload) {
        forceReload();
      }
    }
  }, intervalMinutes * 60 * 1000);
}

/**
 * Para a verificação automática
 */
export function stopVersionCheck() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}

/**
 * Verifica manualmente por atualizações
 */
export async function manualVersionCheck() {
  const hasUpdate = await checkForUpdates();
  if (hasUpdate) {
    const shouldReload = confirm(
      'Uma nova versão da aplicação está disponível. Deseja recarregar a página para aplicar as atualizações?'
    );
    
    if (shouldReload) {
      forceReload();
    }
    return true;
  } else {
    alert('Você já está usando a versão mais recente da aplicação.');
    return false;
  }
}

/**
 * Obtém a versão atual
 */
export function getCurrentVersion() {
  return currentVersion;
}