class Tooltip {
  static instance;

  onPointerOver = event => {
    if(event.target.dataset.tooltip) {
      this.render(event.target.dataset.tooltip);
      this.toolTipMove(event);
      document.addEventListener('pointermove', this.toolTipMove);
    }
  }

  toolTipMove = event => {
    this.element.style.left = `${event.clientX + 10}px`;
    this.element.style.top = `${event.clientY + 10}px`;
  }

  onPointerOut = event => {
    document.removeEventListener('pointermove', this.toolTipMove);
    this.remove();
  }

  constructor() {
    if(Tooltip.instance) {
      return;
    }

    Tooltip.instance = this;
  }

  render(text) {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = text;

    document.body.append(this.element);
  }

  initialize() {
    document.addEventListener('pointerover', this.onPointerOver);
    document.addEventListener('pointerout', this.onPointerOut);
  }

  remove() {
    if(this.element) {
      this.element.remove();
    }
  }

  destroy() {
    document.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('pointerout', this.onPointerOut);

    this.remove();
  }
}

const tooltip = new Tooltip();

export default tooltip;
