export default class SortableTable {
  subElements = {};
  orderValue = '';

  onSortColumn = event => {
    const toggle = {
      asc: 'desc',
      desc: 'asc'
    }

    const column = event.target.closest('[data-sortable="true"]');
    const {id, order} = column.dataset;

    this.sort(id, toggle[order]);

    column.dataset.order = toggle[order];
    column.append(this.arrow);
  }

  get template() {
    return `<div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
              ${this.getHeader()}
          </div>
          <div data-element="body" class="sortable-table__body">
              ${this.getBody()}
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

  getBody() {
    const result = [...this.data].map((product) => {
      const productRows =  this.header.map((column) => {
        if(column.template){
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

  constructor(header = [], {data = []} = {}) {
    this.header = header;
    this.data = data;

    this.render();
    this.initEventListeners();
  }

  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.element = this.element.firstElementChild;

    this.subElements = this.getSubElements();
    this.addArrow();
  }

  sort(field, orderValue) {
    const order = orderValue === 'asc' ? 1 : -1;
    const column = this.header.find(item => item.id == field);

    this.data = [...this.data].sort((a, b) => {
      switch (column.sortType) {
      case 'number':
        return (a[field] - b[field]) * order;
      case 'string':
        return a[field].localeCompare(b[field], ['ru-RU', 'en-En'], {caseFirst: 'upper'}) * order;
      default:
        return (a[field] - b[field]) * order;
      }
    });

    this.subElements.body.innerHTML = this.getBody();
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
