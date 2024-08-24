const elementValidChecker = (element) => {
  if (typeof element === 'string') {
    return Get(element);
  }
  if (typeof element === 'number') {
    return Get();
  } else {
    return element;
  }
};

function Get(selector = 'body') {
  return document.querySelector(`${selector}`);
}

function GetAll(selector = 'body') {
  return document.querySelectorAll(`${selector}`);
}

function Style(selector = 0, style = {}) {
  const element = elementValidChecker(selector);
  Object.entries(style).forEach(([property, value]) => {
    if (property !== 'id' && property !== 'class') {
      element.style[property] = value;
    }
    if (property === 'id') {
      element.id = value;
    }
    if (property === 'class') {
      element.classList.add(value);
    }
    if (property === 'content') {
      element.innerText = value;
    }
    if (property === 'context') {
      element.innerHTML = value;
    }
  });
  if (typeof selector === 'number') {
    const stackTrace = new Error().stack;
    const lineNumber = stackTrace.split('\n')[2].trim().split('scripts/')[1];
    console.warn(`Warning: Selector hasn't been specified at ${lineNumber}`);
  }
}

function Create(elementTag, style = {}) {
  const element = document.createElement(`${elementTag}`);
  Style(element, style);
  return element;
}

const event = {
  click: (selector, run_function) => {
    const element = elementValidChecker(selector);
    element.addEventListener('click', run_function);
  },
  remclick: (selector, run_function) => {
    const element = elementValidChecker(selector);
    element.removeEventListener('click', run_function);
  },
};

const display = {
  show: async (
    selector,
    transition = 200,
    display = 'block',
    opacity = '1'
  ) => {
    const element = elementValidChecker(selector);
    Style({ transition: `${transition}ms`, display: display }, element);
    setTimeout(() => {
      Style({ opacity: opacity }, element);
    }, 10);
  },
  hide: (selector, transition = 200, display = 'none', opacity = '0') => {
    const element = elementValidChecker(selector);
    Style({ transition: `${transition}ms` }, element);
    setTimeout(() => {
      Style({ opacity: opacity }, element);
      setTimeout(() => {
        Style({ display: display }, element);
      }, transition);
    }, 10);
  },
};

function Append(child, parent) {
  const parentElement = elementValidChecker(parent);
  const childElement = elementValidChecker(child);
  parentElement.appendChild(childElement);
}
