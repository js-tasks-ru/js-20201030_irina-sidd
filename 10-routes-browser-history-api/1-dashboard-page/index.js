import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  components = {};

  get template() {
    return `<div class="dashboard">
      <div class="content__top-panel"><h2 class="page-title">Панель управления</h2>
        <div data-element="rangePicker"></div>
      </div>
    <div data-element="chartsRoot" class="dashboard__charts">
    <div data-element="ordersChart" class="dashboard__chart_orders"></div>
    <div data-element="salesChart" class="dashboard__chart_sales"></div>
    <div data-element="customersChart" class="dashboard__chart_customers"></div>
   </div>
<h3 class="block-title">Лидеры продаж</h3>\t
<div data-element="sortableTable" class="sortable-table"></div>
</div>`;
  }

  async render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.element = this.element.firstElementChild;

    this.subElements = this.getSubElements();

    this.initComponents();

    const { ordersChart, salesChart, customersChart } = this.subElements;

    this.subElements.rangePicker.append(this.components.rangePicker.element);

    ordersChart.append(this.components.ordersChart.element);
    salesChart.append(this.components.salesChart.element);
    customersChart.append(this.components.customersChart.element);

    this.subElements.sortableTable.append(this.components.sortableTable.element);

    this.initEventListeners();
    return this.element;
  }

  initComponents() {
    const to = new Date();
    const from = new Date(to.getTime() - (30 * 24 * 60 * 60 * 1000));

    this.components.rangePicker = new RangePicker({ from, to });

    this.components.ordersChart = new ColumnChart({
      url: `api/dashboard/orders`,
      range: {
        from: from,
        to: to
      },
      label: 'orders'
    });

    this.components.salesChart = new ColumnChart({
      url: `api/dashboard/sales`,
      range: {
        from: from,
        to: to
      },
      label: 'sales'
    });

    this.components.customersChart = new ColumnChart({
      url: `api/dashboard/customers`,
      range: {
        from: from,
        to: to
      },
      label: 'customers'
    });

    this.components.sortableTable = new SortableTable(header, {
      url: `/api/dashboard/bestsellers`,
      range: {
        from: from,
        to: to
      },
      isSortLocally: false
    });
  }

  async updateComponents(from, to) {
    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
    this.components.sortableTable.update(from, to);
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {})
  }

  initEventListeners () {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    });
  }

  remove() {
    if(this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    for (const component of Object.values(this.components)) {
      component.destroy();
    }

    this.components = null;
  }
}
