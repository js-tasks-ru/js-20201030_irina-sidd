export default class ColumnChart {
  value = '';
  label = '';
  data = [];
  chartHeight = 50;

  constructor(params) {
    if(params) {
      for (const [param, value] of Object.entries(params)) {
        this[param] = value;
      }
    }

    this.render();
    this.initEventListeners();
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = `
    <div class="column-chart">
      <div class="column-chart__title">
        Total ${this.label}
        <a href="/sales" class="column-chart__link">View all</a>
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

    if(this.data.length !== 0) {
      const chartElement = element.getElementsByClassName('column-chart__chart')[0];
      this.renderChart(chartElement);
    } else {
      this.element.classList.add('column-chart_loading');
    }
  }

  update(newData) {
    this.data = newData;
    const chartElement = this.element.getElementsByClassName('column-chart__chart')[0];
    while (chartElement.firstChild) {
      chartElement.removeChild(chartElement.firstChild);
    }

    this.renderChart(chartElement);
  }

  renderChart(chartElement) {
    const columnProps = this.getColumnProps(this.data);
    columnProps.forEach((item) => {
      const column = document.createElement('div');
      column.innerHTML = `<div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`;
      chartElement.append(column.firstElementChild);
    });
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

  initEventListeners () {
    // NOTE: в данном методе добавляем обработчики событий, если они есть
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
  }
}
