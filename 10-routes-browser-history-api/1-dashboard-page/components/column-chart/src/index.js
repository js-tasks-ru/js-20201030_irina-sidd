import fetchJson from '../../../utils/fetch-json.js';

const SERVICE_BASE_URL = 'https://course-js.javascript.ru/';

export default class ColumnChart {
  constructor({
                url = '',
                range = {
                  from: new Date('2020-04-01'),
                  to: new Date('2020-06-01')
                },
                label = '',
                value = 0,
                link = '',
                formatHeading = data => data
              } = {}) {
    this.url = new URL(url, SERVICE_BASE_URL);
    this.range = range;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
    this.loadData(this.range.from, this.range.to);
  }

  chartHeight = 50;

  render() {
    const element = document.createElement('div');

    element.innerHTML = `
    <div class="column-chart" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        Total ${this.label}
        ${this.getLink()}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header"></div>
        <div data-element="body" class="column-chart__chart">
        </div>
      </div>
    </div>
    `;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
  }

  renderChartElement(data) {
    if(data) {
      this.element.classList.remove('column-chart_loading');
      this.subElements.header.textContent = this.getHeaderValue(data);
      this.subElements.body.innerHTML = this.getChartColumns(data);
    } else {
      this.element.classList.add('column-chart_loading');
    }
  }

  getChartColumns(data) {
    const columnProps = this.getColumnProps(data);
    return columnProps.map((item) => {
      return `<div style="--value: ${item.value}" data-tooltip="${item.tooltip}"></div>`;
    }).join('');
  }

  getHeaderValue(data) {
    return this.formatHeading(Object.values(data).reduce((accum, item) => (accum + item), 0));
  }

  async loadData(from, to) {
    this.element.classList.add('column-chart_loading');
    this.subElements.header.textContent = '';
    this.subElements.body.innerHTML = '';

    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());
    const data = await fetchJson(this.url);
    this.renderChartElement(data);
  }

  async update(from, to) {
    await this.loadData(from, to);
  }

  getLink() {
    return this.link ? `<a href="/sales" class="column-chart__link">View all</a>` : '';
  }

  getColumnProps(data) {
    const maxValue = Math.max(...Object.values(data));
    const scale = this.chartHeight / maxValue;

    return Object.entries(data).map(([key, value]) => {
      const percent = (value / maxValue * 100).toFixed(0);
      const tooltip = `<span>
        <small>${key.toLocaleString('default', {dateStyle: 'medium'})}</small>
        <br>
        <strong>${percent}</strong>
      </span>`;

      return {
        value: Math.floor(value * scale),
        tooltip: tooltip
      };
    });
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {})
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
