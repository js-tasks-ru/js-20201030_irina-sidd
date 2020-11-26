export default class DoubleSlider {
  element;
  subElements;
  currentThumb;

  thumbs = {
    right: 'right',
    left: 'left'
  }

  get template() {
    return `<div class="range-slider">
    <span data-element="from">${this.formatValue(this.selected.from)}</span>
    <div data-element="inner" class="range-slider__inner">
      <span data-element="progress" class="range-slider__progress"></span>
      <span data-element="thumbLeft" class="range-slider__thumb-left" data-left="true"></span>
      <span data-element="thumbRight" class="range-slider__thumb-right" data-right="true"></span>
    </div>
    <span data-element="to">${this.formatValue(this.selected.to)}</span>
  </div>`;
  }

  onMouseDown = event => {
    event.preventDefault();

    this.currentThumb = event.target;

    if (this.currentThumb === this.subElements.thumbLeft) {
      this.shiftX = this.currentThumb.getBoundingClientRect().right - event.clientX;
    } else {
      this.shiftX = this.currentThumb.getBoundingClientRect().left - event.clientX;
    }

    this.element.classList.add('range-slider_dragging');

    document.addEventListener('pointermove', this.onMouseMove);
    document.addEventListener('pointerup', this.onMouseUp);
  }

  onMouseMove = event => {
    event.preventDefault();

    const { left, right, width } = this.subElements.inner.getBoundingClientRect();

    if (this.currentThumb === this.subElements.thumbLeft) {
      let newLeft = (event.clientX - left + this.shiftX) / width;
      newLeft = this.getNewValue(newLeft, this.thumbs.right);

      this.updateThumb(newLeft, this.thumbs.left);

      this.subElements.from.innerHTML = this.formatValue(this.getValue().from);
    }

    if (this.currentThumb === this.subElements.thumbRight) {
      let newRight = (right - event.clientX - this.shiftX) / width;
      newRight = this.getNewValue(newRight, this.thumbs.left);

      this.updateThumb(newRight, this.thumbs.right);

      this.subElements.to.innerHTML = this.formatValue(this.getValue().to);
    }
  };

  onMouseUp = () => {
    this.element.classList.remove('range-slider_dragging');

    document.removeEventListener('pointermove', this.onMouseMove);
    document.removeEventListener('pointerup', this.onMouseUp);

    this.element.dispatchEvent(new CustomEvent('range-select', {
      detail: this.getValue(),
      bubbles: true
    }));
  };

  constructor({
    min = 10,
    max = 100,
    selected = {
      from: min,
      to: max
    },
    formatValue = value => '$' + value } = {}) {
    this.min = min;
    this.max = max;
    this.selected = selected;
    this.formatValue = formatValue;

    this.rangeTotal = this.max - this.min;

    this.render();
    this.initEventListeners();
  }

  initEventListeners() {
    this.subElements.thumbLeft.addEventListener('pointerdown', this.onMouseDown);
    this.subElements.thumbRight.addEventListener('pointerdown', this.onMouseDown);
  }

  render () {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    this.updateSlider();
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {})
  }

  updateSlider() {
    this.currentThumb = this.subElements.thumbLeft;
    this.updateThumb(
      Math.floor((this.selected.from - this.min) / this.rangeTotal * 100), this.thumbs.left);

    this.currentThumb = this.subElements.thumbRight;
    this.updateThumb(
      Math.floor((this.max - this.selected.to) / this.rangeTotal * 100), this.thumbs.right);
  }

  updateThumb(value, thumb) {
    this.subElements.progress.style[thumb] = this.currentThumb.style[thumb] = value + '%';
  }

  getNewValue(newValue, thumb) {
    const otherThumbName = thumb === this.thumbs.left ? this.thumbs.right : this.thumbs.left;
    if (newValue < 0) {
      newValue = 0;
    }
    newValue *= 100;

    let otherThumbValue = parseFloat(this.currentThumb.style[otherThumbName]);

    if (otherThumbValue + newValue > 100) {
      newValue = 100 - otherThumbValue;
    }

    return newValue;
  }

  getValue() {
    const { left } = this.subElements.thumbLeft.style;
    const { right } = this.subElements.thumbRight.style;

    const from = Math.round(this.min + parseFloat(left) / this.rangeTotal * 100);
    const to = Math.round(this.max - parseFloat(right) / this.rangeTotal * 100);

    return { from, to };
  }

  remove () {
    this.element.remove();
  }

  removeListeners () {
    document.removeEventListener('pointerup', this.onMouseUp);
    document.removeEventListener('pointermove', this.onMouseMove);
  }

  destroy() {
    this.remove();
    this.removeListeners();
  }
}
