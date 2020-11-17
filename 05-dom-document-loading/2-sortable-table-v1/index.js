export default class SortableTable {
  subElements = {};
  orderValue = '';

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
      return `<div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" ${this.getOrder()}>
                <span>${item.title}</span>
            </div>`;
    }).join('');
  }

  getOrder() {
    switch (this.orderValue) {
    case 'asc':
      return `data-order="asc"`;
    case 'desc':
      return `data-order="desc"`;
    default: return '';
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
  }

  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.element = this.element.firstElementChild;

    this.subElements = this.getSubElements();
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

