async function fetchAndRenderProducts() {
  try {
    const res = await fetch('content-data.json');
    const data = await res.json();
    renderProducts(data.products);
  } catch (err) {
    console.warn('Failed to load products:', err);
  }
}

function renderProducts(products) {
  const productListDiv = document.getElementById('product-list');
  productListDiv.innerHTML = ''; // 清空原有内容

  products.slice(0, 20).forEach((product, index) => { // 只渲染前20个商品
    const productDiv = document.createElement('div');
    productDiv.classList.add('product-item');

    productDiv.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h2>${product.name}</h2>
      <p>${product.description}</p>
    `;

    productListDiv.appendChild(productDiv);
  });
}

// 确保在DOM加载完成后调用此函数
document.addEventListener('DOMContentLoaded', () => {
  fetchAndRenderProducts();
});
