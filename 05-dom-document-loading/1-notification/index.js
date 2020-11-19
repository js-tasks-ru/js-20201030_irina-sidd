export default class NotificationMessage {
  static currentElement;

  get template() {
    return `
  <div class="notification ${this.type}" style="--value:20s">
    <div class="timer"></div>
    <div class="inner-wrapper">
      <div class="notification-header">success</div>
      <div class="notification-body">
        ${this.message}
      </div>
    </div>
  </div>
`
}
  constructor(message, {duration = 2000, type = 'success'} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    if(NotificationMessage.currentElement) {
      NotificationMessage.currentElement.remove();
    }

    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.element = this.element.firstElementChild;
    NotificationMessage.currentElement = this;
  }

  show(parentElement) {
    if(parentElement) {
      parentElement.append(this.element);
    } else {
      document.body.append(this.element);
    }

    setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  remove () {
    if(this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
  }
}
