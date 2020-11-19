export default class ColumnChart {
  chartHeight = 50;

  constructor({
    data = [],
    label = '',
    value = 0,
    link = ''
  } = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;

    this.render();
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = `
    <div class="column-chart">
      <div class="column-chart__title">
        Total ${this.label}
        ${this.getLink()}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.value}</div>
        <div data-element="body" class="column-chart__chart">
        </div>
      </div>
    </div>
    `;
    this.element = element.firstElementChild;
    this.element.style = `--chart-height: ${this.chartHeight}`;
    this.chartElement = this.element.getElementsByClassName('column-chart__chart')[0];
    this.renderChartElement();
  }

  update(newData) {
    if(!newData) return;

    this.data = newData;
    while (this.chartElement.firstChild) {
      this.chartElement.removeChild(this.chartElement.firstChild);
    }
    this.renderChartElement();
  }

  renderChartElement() {
    if(this.data.length !== 0) {
      this.chartElement.innerHTML = this.getChartColumns();
    } else {
      this.element.classList.add('column-chart_loading');
    }
  }

  getChartColumns() {
    const columnProps = this.getColumnProps(this.data);
    return columnProps.map((item) => {
      return `<div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`;
    }).join('');
  }

  getLink() {
    return this.link ? `<a href="/sales" class="column-chart__link">View all</a>` : '';
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = 50 / maxValue;

    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
