import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements = {};

  defaultProduct = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  };

  onSubmit = event => {
    event.preventDefault();

    this.save();
  };

  uploadImage = () => {
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.hidden = true;

    fileInput.addEventListener('change', (event) => {
      const { imageListContainer } = this.subElements;
      this.uploadImgFile(event.target, imageListContainer, this.product.images);
    });

    document.body.appendChild(fileInput);
    fileInput.click();
  };

  get template() {
    return `<div class="product-form">
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input id="title" data-element="title" required="" type="text" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea id="description" data-element="productDescription" required="" class="form-control" name="description" placeholder="Описание товара"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer"></div>
        <button data-element="uploadImage" type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select id="subcategory" data-element="subcategory" class="form-control" name="subcategory">
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input id="price" data-element="price" required="" type="number" name="price" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input id="discount" data-element="discount" required="" type="number" name="discount" class="form-control" placeholder="0">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input id="quantity" data-element="quantity" required="" type="number" class="form-control" name="quantity" placeholder="1">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select id="status" class="form-control" name="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>
    </form>
  </div>`;
  }

  getImageList(images) {
    const imageList = [...images].map(item => {
      return `<li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="${item.url}">
          <input type="hidden" name="source" value="${item.source}">
          <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${item.url}">
        <span>${item.source}</span>
      </span>
      <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button></li>`;
    }).join('');

    return `<ul class="sortable-list">${imageList}</ul>`;
  }

  addImageItem(image) {
;
  }

  getCategoriesList () {
    return [...this.categories].map(category => {
     return [...category.subcategories].map(sub => {
       return `<option value="${sub.id}">${category.title} > ${sub.title}</option>`
      }).join('')
    }).join('');
  }

  constructor (productId) {
    this.productId = productId;
  }

  async render () {
    this.fields = Object.keys(this.defaultProduct).filter(item => item !== 'images');

    await this.loadData();

    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.element = this.element.firstElementChild;
    this.subElements = this.getSubElements();

    this.fillForm();

    this.initEventListeners();

    return this.element;
  }

  async loadData() {
    const categoriesPromise = this.loadCategories();

    const productPromise = this.productId
      ? this.loadProducts(this.productId)
      : [this.defaultProduct];

    const [categories, productResponse] = await Promise.all([categoriesPromise, productPromise]);

    const [product] = productResponse;

    this.product = product;
    this.categories = categories;
  }

  async loadProducts(productId) {
    return await fetchJson(`${BACKEND_URL}/api/rest/products?id=${productId}`);
  }

  async loadCategories() {
    return await fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  async save() {
    const product = this.getProductData();

    const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
      method: this.productId ? 'PATCH' : 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    });

    this.dispatchEvent(result.id);
  }

  async uploadImgFile(fileInput, imgConteiner, productImages) {
    const [file] = fileInput.files;

    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      const result = await fetchJson('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        body: formData
      });

      productImages.push({ url: result.data.link, source: file.name });
      imgConteiner.innerHTML = this.getImageList(productImages);

      fileInput.remove();
    }
  }

  fillForm() {
    const { productForm, imageListContainer, subcategory } = this.subElements;

    this.fields.forEach(item => {
      const element = productForm.querySelector(`#${item}`);

      element.value = this.product[item] || this.defaultProduct[item];
    });

    imageListContainer.innerHTML = this.getImageList(this.product.images);

    subcategory.innerHTML = this.getCategoriesList();
  }

  getProductData () {
    const { productForm, imageListContainer } = this.subElements;
    const product = { id: this.productId, images: [] };

    this.fields.forEach(item => {
      product[item] = productForm.querySelector(`#${item}`).value;
    });

    const imageList = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    imageList.forEach( img => {
      product.images.push({
        url: img.src,
        source: img.alt
      });
    })

    return product;
  }

  dispatchEvent (id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id })
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {})
  }

  initEventListeners () {
    const { productForm, uploadImage, imageListContainer } = this.subElements;

    productForm.addEventListener('submit', this.onSubmit);
    uploadImage.addEventListener('click', this.uploadImage);

    imageListContainer.addEventListener('click', event => {
      if ('deleteHandle' in event.target.dataset) {
        event.target.closest('li').remove();
      }
    });
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
