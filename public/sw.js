const CACHE_NAME = 'painele-v1.0.0';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/painele.svg',
  '/fundo.png',
  '/demo-painele.svg',
  '/static/js/bundle.js',
  '/static/css/main.css',
  // Páginas principais
  '/login',
  '/cadastro',
  '/home',
  '/products',
  '/selling',
  '/despesas',
  '/relatorio',
  '/usuarios',
  '/assinatura'
];

// Instalar o Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Erro ao adicionar ao cache:', error);
      })
  );
  // Força a ativação imediata do novo service worker
  return self.skipWaiting();
});

// Ativar o Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Toma controle de todas as abas abertas
  return self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  // Ignorar requisições que não são GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorar requisições para APIs externas
  if (event.request.url.includes('api') || 
      event.request.url.includes('chrome-extension') ||
      event.request.url.includes('localhost:3001')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se encontrou no cache, retorna
        if (response) {
          return response;
        }

        // Se não encontrou no cache, busca na rede
        return fetch(event.request)
          .then((response) => {
            // Verifica se a resposta é válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona a resposta para adicionar ao cache
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Se falhou na rede, retorna página offline para navegação
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// Lidar com mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Sincronização em background
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Executando sincronização em background');
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Aqui você pode implementar lógica para sincronizar dados offline
  return Promise.resolve();
}

// Notificações push (para futuras implementações)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Notificação push recebida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do Painelé',
    icon: '/painele.svg',
    badge: '/painele.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir Painelé',
        icon: '/painele.svg'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/painele.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Painelé', options)
  );
});

// Lidar com cliques em notificações
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Clique na notificação');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('Service Worker: Painelé SW carregado com sucesso!');