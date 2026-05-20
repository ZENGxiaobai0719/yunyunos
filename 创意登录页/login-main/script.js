// script.js
import { Rive, Layout, Fit, Alignment, RuntimeLoader } from '@rive-app/canvas';
import wasmUrl from '@rive-app/canvas/rive.wasm?url';

// 关键：设置本地 WASM 路径，避免依赖 unpkg CDN（国内网络无法访问）
RuntimeLoader.setWasmUrl(wasmUrl);

// 使用 import.meta.url 确保路径在开发和生产环境都能正确解析
const illustrationSrc = new URL('/riv/smallpeople.riv', import.meta.url).href;
const eyesSrc = new URL('/riv/eyes.riv', import.meta.url).href;

document.addEventListener('DOMContentLoaded', function () {
    // Initialize Rive animation
    const canvas = document.getElementById('riveCanvas');
    let statusInput = null;
    let correctTrigger = null;
    let wrongTrigger = null;

    function updateIllustrationStatus() {
        if (!statusInput) return;
        const passwordInputType = document.getElementById('password').getAttribute('type');
        const activeElement = document.activeElement;
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        if (passwordInputType === 'text') {
            statusInput.value = 2;
        } else if (activeElement === emailInput || activeElement === passwordInput) {
            statusInput.value = 1;
        } else {
            statusInput.value = 0;
        }
    }

    function validateEmailFormat(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    const r = new Rive({
        src: illustrationSrc,
        canvas: canvas,
        stateMachines: 'State Machine 1',
        autoplay: true,
        autoBind: true,
        layout: new Layout({
            fit: Fit.Cover,
            alignment: Alignment.Center,
        }),
        onLoad: () => {
            r.resizeDrawingSurfaceToCanvas();

            const viewModel = r.viewModelByName('Login');
            if (viewModel) {
                const instance = viewModel.defaultInstance();
                r.bindViewModelInstance(instance);

                statusInput = instance.number('status');
                correctTrigger = instance.trigger('correct');
                wrongTrigger = instance.trigger('wrong');
            }

            // Fallback: state machine inputs
            const inputs = r.stateMachineInputs('State Machine 1');
            if (inputs) {
                if (!statusInput) statusInput = inputs.find(i => i.name === 'status');
                if (!correctTrigger) correctTrigger = inputs.find(i => i.name === 'correct');
                if (!wrongTrigger) wrongTrigger = inputs.find(i => i.name === 'wrong');
            }

            console.log('Rive variables loaded:', {
                status: !!statusInput,
                correct: !!correctTrigger,
                wrong: !!wrongTrigger
            });

            updateIllustrationStatus();
        },
        onLoadError: (err) => {
            console.error('Failed to load main Rive animation:', err);
        },
    });

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const rememberCheckbox = document.getElementById('remember');

    function fireTrigger(t) {
        if (!t) return;
        if (typeof t.trigger === 'function') {
            t.trigger();
        } else if (typeof t.fire === 'function') {
            t.fire();
        }
    }

    emailInput.addEventListener('focus', updateIllustrationStatus);

    emailInput.addEventListener('input', () => {
        const email = emailInput.value.trim();

        if (validateEmailFormat(email)) {
            fireTrigger(correctTrigger);
        }
    });

    emailInput.addEventListener('blur', () => {
        updateIllustrationStatus();
    });

    passwordInput.addEventListener('focus', updateIllustrationStatus);
    passwordInput.addEventListener('blur', updateIllustrationStatus);

    // Initialize Eyes Rive animation
    const eyeCanvas = document.getElementById('eyeCanvas');
    let displayInput = null;
    const eyeRive = new Rive({
        src: eyesSrc,
        canvas: eyeCanvas,
        stateMachines: 'State Machine 1',
        autoplay: true,
        autoBind: true,
        onLoad: () => {
            eyeRive.resizeDrawingSurfaceToCanvas();

            const viewModel = eyeRive.viewModelByName('Eyes');
            if (viewModel) {
                const instance = viewModel.defaultInstance();
                eyeRive.bindViewModelInstance(instance);

                displayInput = instance.boolean('display');

                if (displayInput) {
                    const type = passwordInput.getAttribute('type');
                    displayInput.value = (type === 'password');
                }
            }
        },
        onLoadError: (err) => {
            console.error('Failed to load eyes Rive animation:', err);
        },
    });

    // Handle window resize (moved after both Rive instances are defined)
    window.addEventListener('resize', () => {
        if (r) {
            r.resizeDrawingSurfaceToCanvas();
        }
        if (eyeRive) {
            eyeRive.resizeDrawingSurfaceToCanvas();
        }
    });

    // 监听全局鼠标移动，传递给 eyeCanvas 和主插画 canvas
    window.addEventListener('mousemove', (e) => {
        if (!e.isTrusted) return;

        if (eyeCanvas) {
            const fakeEventEye = new MouseEvent('mousemove', {
                clientX: e.clientX,
                clientY: e.clientY,
                bubbles: false
            });
            eyeCanvas.dispatchEvent(fakeEventEye);
        }

        if (canvas) {
            const fakeEventMain = new MouseEvent('mousemove', {
                clientX: e.clientX,
                clientY: e.clientY,
                bubbles: false
            });
            canvas.dispatchEvent(fakeEventMain);
        }
    });

    togglePassword.addEventListener('mousedown', function (e) {
        e.preventDefault();
    });

    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        const length = passwordInput.value.length;

        passwordInput.setAttribute('type', type);

        if (displayInput) {
            displayInput.value = (type === 'password');
        }

        updateIllustrationStatus();

        passwordInput.focus();

        setTimeout(function () {
            passwordInput.setSelectionRange(length, length);
        }, 0);
    });

    passwordInput.addEventListener('input', function () {
        const passwordGroup = document.getElementById('passwordGroup');
        if (passwordGroup && passwordGroup.classList.contains('error-state')) {
            passwordGroup.classList.remove('error-state', 'shake-animation');
        }
    });

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const isEmailValid = validateEmailFormat(email);

        if (!email || !isEmailValid) {
            fireTrigger(wrongTrigger);
            alert('Please enter a valid email (e.g., example@qq.com or example@gmail.com)');
            return;
        }

        if (!password) {
            fireTrigger(wrongTrigger);
            alert('Please enter your password');
            return;
        }

        const passwordGroup = document.getElementById('passwordGroup');

        passwordGroup.classList.remove('shake-animation');

        void passwordGroup.offsetWidth;

        passwordGroup.classList.add('error-state', 'shake-animation');

        fireTrigger(wrongTrigger);

        return;

        if (rememberCheckbox.checked) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('email', email);
        } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('email');
        }

        simulateLogin(email);
    });

    function simulateLogin(email) {
        const submitBtn = document.querySelector('.btn-primary');
        const originalText = submitBtn.textContent;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;

            alert(`Welcome back, ${email}!`);
            loginForm.reset();
        }, 1000);
    }

    if (localStorage.getItem('rememberMe') === 'true') {
        const savedEmail = localStorage.getItem('email');
        if (savedEmail) {
            emailInput.value = savedEmail;
            rememberCheckbox.checked = true;
        }
    }
});