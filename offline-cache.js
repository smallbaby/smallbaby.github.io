function toBase64(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function() {
    const reader = new FileReader();
    reader.onloadend = function() {
      callback(reader.result);
    };
    reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
}

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

document.addEventListener('DOMContentLoaded', () => {
  fetchAndRenderProducts();
});
