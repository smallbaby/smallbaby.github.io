const CACHE_NAME = 'products-cache-v1';
const PRODUCT_API = 'https://114.132.189.203:5000/api/products';

// 检查是否在线
function isOnline() {
  return navigator.onLine;
}

// 从缓存或网络获取商品
async function fetchProducts() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

  try {
    if (isOnline()) {
      const res = await fetch(PRODUCT_API, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('Network response not ok');
      const data = await res.json();
      // 保存到缓存
      const cache = await caches.open(CACHE_NAME);
      cache.put(PRODUCT_API, new Response(JSON.stringify(data)));
      return { data, fromCache: false };
    } else {
      throw new Error('Offline');
    }
  } catch (err) {
    console.warn('Using cached products:', err.message);
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(PRODUCT_API);
    if (cachedResponse) {
      const data = await cachedResponse.json();
      return { data, fromCache: true };
    } else {
      throw new Error('No network and no cache');
    }
  }
}

// 渲染商品
function renderProducts(products, fromCache = false) {
  const grid = document.getElementById('product-grid');
  const loading = document.getElementById('loading');
  const offlineTip = document.getElementById('offline-tip');

  loading.style.display = 'none';
  if (fromCache) {
    offlineTip.style.display = 'block';
  }

  grid.innerHTML = products.slice(0, 8).map(p => `
    <div class="product-card">
      <img class="product-image" src="${p.image}" alt="${p.name}" onerror="this.style.backgroundColor='#ddd'">
      <h3>${p.name}</h3>
      <p class="price">¥${p.price}</p>
    </div>
  `).join('');
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const { data, fromCache } = await fetchProducts();
    renderProducts(data, fromCache);
  } catch (err) {
    document.getElementById('loading').textContent = '加载失败，请稍后重试 ' + err;
    console.error(err);
  }

  // 注册 Service Worker（用于缓存静态资源）
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registered:', reg))
        .catch(err => console.log('SW registration failed:', err));
    });
  }
});
