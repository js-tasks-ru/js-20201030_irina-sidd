import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};

  onSortColumn = event => {
    const toggle = {
      asc: 'desc',
      desc: 'asc'
    }

    const column = event.target.closest('[data-sortable="true"]');
    const {id, order} = column.dataset;

    column.dataset.order = toggle[order];
    column.append(this.arrow);

    if(this.isSortLocally) {
      this.sort(id, toggle[order]);
    } else {
      this.sortOnServer(id, toggle[order], this.start, this.end);
    }
  }

  get template() {
    return `<div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
              ${this.getHeader()}
          </div>
          <div data-element="body" class="sortable-table__body">
          </div>
        </div>
    </div>`;
  }

  getHeader() {
    return this.header.map((item) => {
      return `<div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order="asc">
                <span>${item.title}</span>
            </div>`;
    }).join('');
  }

  addArrow() {
    const defaultSortColumn =
      [...this.subElements.header.children].find(item => item.dataset.sortable == "true");

    if(defaultSortColumn) {
      defaultSortColumn.innerHTML += `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`;

      this.arrow = this.element.querySelector('.sortable-table__sort-arrow');
    }
  }

  getBody(data = []) {
    const result = [...data].map((product) => {
      const productRows = this.header.map((column) => {
        if(column.template) {
          return column.template(product.images);
        }

        if(product.hasOwnProperty(column.id)) {
          return `<div class="sortable-table__cell">${product[column.id]}</div>`;
        }
      }).join('');

      return `<a href="/products/${product.id}" class="sortable-table__row">${productRows}</a>`;
    }).join('');

    return result;
  }

  constructor(header = [], {
    url = '',
    isSortLocally = false,
    step = 20,
    start = 1,
    end = start + step
  } = {}) {
    this.url = new URL(url, BACKEND_URL);

    this.isSortLocally = isSortLocally;
    this.start = start;
    this.end = end;

    this.header = header;
    this.id = header.find(item => item.sortable).id;
    this.render();
  }

  async render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.element = this.element.firstElementChild;

    this.subElements = this.getSubElements();

    this.addArrow();

    const data = await this.loadData(this.id, this.order, this.start, this.end);
    this.subElements.body.innerHTML = this.getBody(data);

    this.initEventListeners();
  }

  async sortOnServer(id, order, start, end) {
    const data = await this.loadData(id, order, start, end);
    this.subElements.body.innerHTML = this.getBody(data);
  }

  async loadData(id, order, start, end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    this.element.classList.add('sortable-table_loading');

    const data = await fetchJson(this.url);

    this.element.classList.remove('sortable-table_loading');

    return data;
  }

  sort(id, orderValue) {
    const order = orderValue === 'asc' ? 1 : -1;
    const column = this.header.find(item => item.id == id);

    const data = [...this.data].sort((a, b) => {
      switch (column.sortType) {
      case 'number':
        return (a[id] - b[id]) * order;
      case 'string':
        return a[id].localeCompare(b[id], ['ru-RU', 'en-En'], {caseFirst: 'upper'}) * order;
      default:
        return (a[id] - b[id]) * order;
      }
    });

    this.element.body.innerHTML = this.getBody(data);
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {})
  }

  initEventListeners () {
    this.subElements.header.addEventListener('pointerdown', this.onSortColumn);
  }

  remove() {
    if(this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
