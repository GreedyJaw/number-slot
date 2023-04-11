let isAnimated = false;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min) + min);
}

function scrollToNumber(viewport, number = 0, speed = 1000) {
    isAnimated = true;

    const viewportHeight = viewport.clientHeight;
    const el = viewport.children[0];
    const target = el.querySelector(`[data-number="${number}"]`);
    const index = Array.from(el.children).indexOf(target);

    el.style.transitionDuration = `${speed}ms`;
    el.style.transform = `translateY(-${viewportHeight * index}px)`;

    setTimeout(() => {
        isAnimated = false;
    }, speed);
}

function spin(viewport, direction = 1, speed = 1000, target = 0) {
    const viewportHeight = viewport.clientHeight;
    const el = viewport.children[0];

    if (!isAnimated && parseInt(el.children[0].innerText) === parseInt(target)) {
        return;
    }

    if (direction > 0) {
        el.style.transform = `translateY(-${viewportHeight}px)`;
        el.insertBefore(el.children[el.children.length - 1], el.children[0]);
    }

    setTimeout(() => {
        el.style.transitionDuration = `${speed}ms`;

        if (direction > 0) {
            el.style.transform = 'translateY(0px)';
        } else {
            el.style.transform = `translateY(-${viewportHeight}px)`;
        }
    }, 0);

    setTimeout(() => {
        el.style.transitionDuration = '0ms';

        if (direction < 0) {
            el.style.transform = 'translateY(0px)';
            el.append(el.children[0]);
        }

        requestAnimationFrame(() => spin(viewport, direction, speed, target));
    }, speed);
}

function init() {
    let oldNumber = '0';

    const start = document.getElementById('start');
    const value = document.getElementById('value');
    const number = document.getElementById('number');

    const mask = number.dataset.mask;
    const maskLength = mask.split('').length;
    const digits = mask.split('');

    number.innerHTML = '';

    digits.forEach(() => {
        const viewport = document.createElement('div');
        viewport.classList.add('viewport');

        const slider = document.createElement('div');
        slider.classList.add('slider');
        slider.style.transform = 'translateY(0px)';

        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(digit => {
            const digitEl = document.createElement('div');
            digitEl.innerText = digit;
            digitEl.dataset.number = digit;

            slider.append(digitEl);
        });

        viewport.append(slider);
        number.append(viewport);
    });

    number.scrollTo = function(num) {
        const viewports = number.children;
        let digits = num.toString().split('');
        let oldDigits = oldNumber.toString().split('');
    
        if (digits.length < maskLength) {
            digits = [
                ...(new Array(maskLength - digits.length).fill('0')),
                ...digits
            ];
        }

        if (oldDigits.length < maskLength) {
            oldDigits = [
                ...(new Array(maskLength - oldDigits.length).fill('0')),
                ...oldDigits,
            ];
        }

        let skipIndex = -1;

        digits.forEach((digit, index) => {
            if (oldDigits[index] === digit && Math.abs(skipIndex - index) === 1) {
                skipIndex++;
            }
        });

        const firstDigit = parseInt(digits[skipIndex + 1]);
        const oldFirstDigit = parseInt(oldDigits[skipIndex + 1]);
        const diff = Math.abs(oldFirstDigit - firstDigit);
        const speed = diff * 1000;

        Array.from(viewports).forEach((viewport, index) => {
            if (index > skipIndex) {
                const direction = getRandomInt(-1, 1);

                if (!(skipIndex - (index - 1))) {
                    scrollToNumber(
                        viewport,
                        digits[index],
                        speed,
                    );
                }
                
                if ((skipIndex - (index - 1)) && oldDigits[index] !== digits[index]) {
                    requestAnimationFrame(() => spin(viewport, !direction ? 1 : -1, 50, digits[index]));
                }
            }
        });

        oldNumber = num;
    }

    start.addEventListener('click', e => {
        e.preventDefault();

        number.scrollTo(value.value);
    });
}

document.addEventListener('DOMContentLoaded', init);