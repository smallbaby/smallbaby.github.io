const API_URL = 'https://jsonplaceholder.typicode.com/posts?_limit=5';
const CACHE_KEY = 'cachedProducts';
const CACHE_TIME_KEY = 'cachedProductsTime';
const CACHE_EXPIRE_MS = 24 * 60 * 60 * 1000; // 缓存有效期：24小时

const productListEl = document.getElementById('product-list');
const loadingEl = document.getElementById('loading');

// 检查是否在线
function isOnline() {
  return navigator.onLine;
}

// 获取缓存数据（带过期检查）
function getCachedData() {
  const cached = localStorage.getItem(CACHE_KEY);
  const cacheTime = localStorage.getItem(CACHE_TIME_KEY);
  if (!cached || !cacheTime) return null;

  if (Date.now() - parseInt(cacheTime) > CACHE_EXPIRE_MS) {
    // 过期，清除缓存
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIME_KEY);
    return null;
  }

  try {
    return JSON.parse(cached);
  } catch (e) {
    return null;
  }
}

// 保存数据到缓存
function saveToCache(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
}

// 从接口获取商品
async function fetchProducts() {
  try {
    const res = await fetch(API_URL);
    console.log(res)
    if (!res.ok) throw new Error('请求失败');
    const data = await res.json();
    saveToCache(data);
    return data;
  } catch (err) {
    console.error('获取商品失败:', err);
    return null;
  }
}

// 渲染商品列表
function renderProducts(products) {
  loadingEl.style.display = 'none';
  productListEl.innerHTML = products.map(p => `
    <li>
      <h3>${p.title}</h3>
      <p>¥${p.body}</p>
    </li>
  `).join('');
}

// 主逻辑
async function init() {
  let products = null;

  if (isOnline()) {
    // 有网：优先拉新数据
    products = await fetchProducts();
    if (products) {
      renderProducts(products);
      return;
    }
    // 如果拉取失败，尝试用缓存兜底
    products = getCachedData();
    if (products) {
      renderProducts(products);
      // 可选：提示“当前显示缓存数据”
      console.log('网络异常，正在显示缓存数据');
    } else {
      loadingEl.textContent = '加载失败，请稍后重试';
    }
  } else {
    // 无网：直接读缓存
    products = getCachedData();
    if (products) {
      renderProducts(products);
      alert('当前处于离线状态，显示缓存数据');
    } else {
      loadingEl.textContent = '无网络且无缓存数据';
    }
  }
}

// 页面加载时执行
window.addEventListener('load', init);

// 可选：监听网络变化，自动刷新
window.addEventListener('online', () => {
  // 可选：重新拉取最新数据
  // init();
});
