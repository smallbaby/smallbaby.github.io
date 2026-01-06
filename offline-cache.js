// offline-cache.js —— 主逻辑：缓存 + 渲染

const CACHE_KEY = 'flightContent_v1';
const HAS_CACHED_KEY = 'hasCached';

function render(data) {
  document.getElementById('title').textContent = data.title;
  document.getElementById('content').innerHTML = 
    data.body.replace(/\n/g, '<br>') +
    (data.image ? `<img src="${data.image}" alt="内容配图">` : '');
  document.getElementById('hint').textContent = '✅ 内容已缓存，飞行中可离线阅读';
}

async function fetchAndCache() {
  try {
    // 强制获取最新内容（加时间戳）
    const res = await fetch(`content-data.json?t=${Date.now()}`);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(HAS_CACHED_KEY, '1');
    render(data);
  } catch (err) {
    console.warn('Fetch failed, trying cache:', err);
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      render(JSON.parse(cached));
      document.getElementById('hint').textContent = '⚠️ 当前无网络，显示缓存内容';
    } else {
      document.getElementById('content').innerHTML = '❌ 无法加载内容。请在有网络时打开此页面进行缓存。';
    }
  }
}

// 检查是否已有缓存
const hasCached = localStorage.getItem(HAS_CACHED_KEY);
if (hasCached) {
  // 优先从缓存读取（快速展示）
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) render(JSON.parse(cached));
}

// 尝试获取最新内容（即使有缓存也后台更新）
fetchAndCache();

// 注册 Service Worker（安卓微信可能支持）
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(console.warn);
  });
}
