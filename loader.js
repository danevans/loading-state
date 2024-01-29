const STATES = {
  NOT_STARTED: 'not_started',
  LOADING: 'loading',
  SUCCESS: 'success',
  FAILURE: 'failure',
};

const LOADING_SPIN_SPEED = 1250;

class Loader extends HTMLElement {
  _state = STATES.NOT_STARTED;

  animateSpin(svg) {
    if (this._state === STATES.LOADING) {
      svg.animate(
        [
          { transform: 'rotate(-90deg)' },
          { transform: 'rotate(270deg)' },
        ], 
        { duration: LOADING_SPIN_SPEED, iterations: 1 }
      );
      this.cbid = window.setTimeout(() => {
        this.animateSpin(svg);
      }, LOADING_SPIN_SPEED);
    } else if (this._state === STATES.SUCCESS) {
      const circle = svg.querySelector('circle');
      circle.style.strokeDashoffset = 0;
      circle.style.stroke = 'var(--success-color)';

      const check = svg.querySelector('path');
      check.style.strokeDashoffset = 0;
      check.style.stroke = 'var(--success-color)';

      window.setTimeout(() => {
        this.dispatchEvent(new CustomEvent('success'));
      }, 1500);
    } else if (this._state === STATES.FAILURE) {
      const circle = svg.querySelector('circle');
      circle.style.strokeDashoffset = 0;
      circle.style.stroke = 'var(--failure-color)';

      const lines = svg.querySelectorAll('line');
      lines[0].style.transition = '1.5s ease-out';
      lines[0].style.strokeDashoffset = 0;
      lines[0].style.stroke = 'var(--failure-color)';
      lines[1].style.transition = '1.5s ease-out 0.5s';
      lines[1].style.strokeDashoffset = 0;
      lines[1].style.stroke = 'var(--failure-color)';

      window.setTimeout(() => {
        this.dispatchEvent(new CustomEvent('failure'));
      }, 1500);
    }
  }

  clear() {
    this.shadow.querySelectorAll('div').forEach(div => {
      this.shadow.removeChild(div);
    });
  }

  renderNotStarted() {
    const content = document.createElement('div');
    content.textContent = 'Not started';
    this.shadow.appendChild(content);
  }

  static get observedAttributes() { return ['state']; }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'state':
        if (!oldValue && newValue === STATES.LOADING) {
          this.clear();
          const svg = document.createElement('div');
          svg.innerHTML = `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45"/>
              <path d="M20 55 L45 75 L75 30"/>
              <line x1="30" y1="30" x2="70" y2="70" />
              <line x1="70" y1="30" x2="30" y2="70" />
            </svg>
          `;
          this.shadow.appendChild(svg);
          this._state = STATES.LOADING;
          this.animateSpin(svg.querySelector('svg'));
        } else if (!newValue) {
          this._state = STATES.NOT_STARTED;
          window.clearTimeout(this.cbid);
          this.clear();
          this.renderNotStarted();
        } else if (oldValue === STATES.LOADING) {
          if (newValue === STATES.SUCCESS) {
            this._state = STATES.SUCCESS;
          } else if (newValue === STATES.FAILURE) {
            this._state = STATES.FAILURE;
          }
        }
        break;
    }
  }

  constructor(...args) {
    super(...args);
    this.shadow = this.attachShadow({ mode: 'closed' });
  }

  connectedCallback() {
    if (!this.css) {
      this.css = document.createElement('style');
      this.css.textContent = `
        svg {
          height: 100px;
          transform: rotate(-90deg);
        }

        circle {
          display: block;
          transition: 1.5s ease-out;
          fill: transparent;
          stroke: var(--spinner-color);
          stroke-linecap: round;
          stroke-dasharray: 283;
          stroke-dashoffset: 240;
          stroke-width: 5px;
          transform-origin: 50% 50%;
        }

        path {
          transform: rotate(90deg);
          transform-origin: 50% 50%;
          transition: 1.5s ease-out;
          fill: transparent;
          stroke: var(--spinner-color);
          stroke-linecap: round;
          stroke-dasharray: 87;
          stroke-dashoffset: 87;
          stroke-width: 5px;
        }

        line {
          transform: rotate(90deg);
          transform-origin: 50% 50%;
          stroke: var(--spinner-color);
          stroke-linecap: round;
          stroke-dasharray: 57;
          stroke-dashoffset: 57;
          stroke-width: 5px;
        }
      `;
      this.shadow.appendChild(this.css);
    }

    if (this._state === STATES.NOT_STARTED) {
      this.renderNotStarted();
    }
  }

  disconnectedCallback() {
    window.clearTimeout(this.cbid);
  }
}

customElements.define('loading-state', Loader);
