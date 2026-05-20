<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 左侧 Rive 动画插画 -->
      <div class="illustration-section">
        <canvas ref="riveCanvasRef" width="900" height="800" class="rive-canvas"></canvas>
      </div>

      <!-- 右侧表单 -->
      <div class="form-section">
        <div class="form-wrapper">
          <!-- Logo 和标题 -->
          <div class="header-group">
            <div class="decorations">
              <img src="/svg/logo.svg" alt="Logo" class="logo-icon" />
            </div>
            <img src="/svg/welcome back.svg" alt="Welcome back!" class="welcome-title" />
            <p class="subtitle">{{ isLogin ? '请输入账号密码登录' : '请填写信息注册账号' }}</p>
          </div>

          <!-- 登录表单 -->
          <form v-if="isLogin" class="login-form" @submit.prevent="handleLogin">
            <div class="input-group" :class="{ 'input-focused': usernameFocused }">
              <input v-model="loginForm.username" type="text" placeholder=" " maxlength="11"
                @focus="onInputFocus" @blur="onInputBlur" />
              <label class="floating-label">用户名</label>
            </div>

            <div class="input-group" :class="{ 'input-focused': passwordFocused }" id="passwordGroup">
              <input v-model="loginForm.password" :type="passwordType" placeholder=" "
                @focus="onInputFocus" @blur="onInputBlur" />
              <label class="floating-label">密码</label>
              <button type="button" class="toggle-password" @mousedown.prevent @click="togglePassword">
                <canvas ref="eyeCanvasRef" width="24" height="24" class="eye-icon"></canvas>
              </button>
            </div>

            <div class="form-options">
              <label class="checkbox-label">
                <input type="checkbox" v-model="checked" />
                <span class="checkbox-custom"></span>
                记住密码
              </label>
            </div>

            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? '登录中...' : '登 录' }}
            </button>

            <button type="button" class="btn-secondary" @click="toggleForm">
              还没有账号？去注册
            </button>
          </form>

          <!-- 注册表单 -->
          <form v-else class="login-form register-form" @submit.prevent="handleRegister">
            <div class="input-group">
              <input v-model="addForm.username" type="text" placeholder=" " maxlength="11"
                @focus="onInputFocus" @blur="onInputBlur" />
              <label class="floating-label">用户名</label>
            </div>
            <div class="input-group">
              <input v-model="addForm.mail" type="email" placeholder=" "
                @focus="onInputFocus" @blur="onInputBlur" />
              <label class="floating-label">邮箱</label>
            </div>
            <div class="input-group">
              <input v-model="addForm.phone" type="text" placeholder=" " maxlength="11"
                @focus="onInputFocus" @blur="onInputBlur" />
              <label class="floating-label">手机号</label>
            </div>
            <div class="input-group">
              <input v-model="addForm.realName" type="text" placeholder=" "
                @focus="onInputFocus" @blur="onInputBlur" />
              <label class="floating-label">姓名</label>
            </div>
            <div class="input-group">
              <input v-model="addForm.password" :type="passwordType" placeholder=" "
                @focus="onInputFocus" @blur="onInputBlur" />
              <label class="floating-label">密码</label>
              <button type="button" class="toggle-password" @mousedown.prevent @click="togglePassword">
                <canvas ref="eyeCanvasRef2" width="24" height="24" class="eye-icon"></canvas>
              </button>
            </div>

            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? '注册中...' : '注 册' }}
            </button>

            <button type="button" class="btn-secondary" @click="toggleForm">
              已有账号？去登录
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { setToken, setUsername } from '@/core/auth.js'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCurrentInstance } from 'vue'
import { Rive, Layout, Fit, Alignment, RuntimeLoader } from '@rive-app/canvas'

const { proxy } = getCurrentInstance()
const API = proxy.$API
const router = useRouter()

// Rive canvas refs
const riveCanvasRef = ref(null)
const eyeCanvasRef = ref(null)
const eyeCanvasRef2 = ref(null)

// Rive instances
let riveInstance = null
let eyeRiveInstance = null

// State machine inputs
let statusInput = null
let correctTrigger = null
let wrongTrigger = null
let displayInput = null

// Form state
const loading = ref(false)
const checked = ref(true)
const isLogin = ref(true)
const usernameFocused = ref(false)
const passwordFocused = ref(false)
const passwordType = ref('password')

const loginForm = reactive({
  username: 'admin',
  password: 'admin123456',
})

const addForm = reactive({
  username: '',
  password: '',
  realName: '',
  phone: '',
  mail: '',
})

// Focus/blur 处理 — 更新 Rive 角色状态
const onInputFocus = () => {
  updateStatus()
}

const onInputBlur = () => {
  setTimeout(() => updateStatus(), 100)
}

const updateStatus = () => {
  if (!statusInput) return
  const activeEl = document.activeElement
  const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
  if (!isInput) {
    if (typeof statusInput.value === 'number') statusInput.value = 0
    return
  }
  const type = activeEl.getAttribute('type')
  if (type === 'password' && passwordType.value === 'text') {
    if (typeof statusInput.value === 'number') statusInput.value = 2
  } else {
    if (typeof statusInput.value === 'number') statusInput.value = 1
  }
}

// 密码可见性切换
const togglePassword = () => {
  passwordType.value = passwordType.value === 'password' ? 'text' : 'password'
  if (displayInput && typeof displayInput.value === 'boolean') {
    displayInput.value = (passwordType.value === 'password')
  }
  updateStatus()
}

// 登录/注册切换
const toggleForm = () => {
  isLogin.value = !isLogin.value
}

// Helper: fire Rive trigger (compatible with both APIs)
const fireTrigger = (t) => {
  if (!t) return
  if (typeof t.trigger === 'function') {
    t.trigger()
  } else if (typeof t.fire === 'function') {
    t.fire()
  }
}

// 登录
const handleLogin = async () => {
  if (!loginForm.username) {
    fireTrigger(wrongTrigger)
    ElMessage.warning('请输入用户名')
    return
  }
  if (!loginForm.password) {
    fireTrigger(wrongTrigger)
    ElMessage.warning('请输入密码')
    return
  }
  if (loginForm.password.length < 8) {
    fireTrigger(wrongTrigger)
    ElMessage.warning('密码长度至少8位')
    return
  }

  loading.value = true
  try {
    const res = await API.user.login(loginForm)
    if (res.data.code === '0') {
      fireTrigger(correctTrigger)
      const token = res?.data?.data?.token
      if (token) {
        setToken(token)
        setUsername(loginForm.username)
        localStorage.setItem('token', token)
        localStorage.setItem('username', loginForm.username)
      }
      ElMessage.success('登录成功！')
      router.push('/home')
    } else if (res.data.message === '用户已登录') {
      fireTrigger(correctTrigger)
      ElMessage.success('登录成功！')
      router.push('/home')
    } else if (res.data.message === '用户不存在') {
      fireTrigger(wrongTrigger)
      ElMessage.error('请输入正确的账号密码!')
    }
  } catch (e) {
    fireTrigger(wrongTrigger)
    ElMessage.error('登录失败，请重试')
  } finally {
    loading.value = false
  }
}

// 注册
const handleRegister = async () => {
  if (addForm.username.length < 1) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/.test(addForm.mail)) {
    ElMessage.warning('请输入正确的邮箱')
    return
  }
  if (!/^1[3|5|7|8|9]\d{9}$/.test(addForm.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  if (addForm.password.length < 8) {
    ElMessage.warning('密码长度至少8位')
    return
  }

  loading.value = true
  try {
    const res1 = await API.user.hasUsername({ username: addForm.username })
    if (res1.data.success !== false) {
      const res2 = await API.user.addUser({ ...addForm })
      if (res2.data.success === false) {
        ElMessage.warning(res2.data.message)
        loading.value = false
        return
      }
      const res3 = await API.user.login({ username: addForm.username, password: addForm.password })
      const token = res3?.data?.data?.token
      if (token) {
        setToken(token)
        setUsername(addForm.username)
        localStorage.setItem('token', token)
        localStorage.setItem('username', addForm.username)
      }
      ElMessage.success('注册登录成功！')
      router.push('/home')
    } else {
      ElMessage.warning('用户名已存在！')
    }
  } catch (e) {
    ElMessage.error('注册失败，请重试')
  } finally {
    loading.value = false
  }
}

// 鼠标移动转发到 Rive canvas
const onMouseMove = (e) => {
  if (!e.isTrusted) return
  const riveCanvas = riveCanvasRef.value
  const eyeCanvas = eyeCanvasRef.value
  const eyeCanvas2 = eyeCanvasRef2.value
  if (riveCanvas) {
    riveCanvas.dispatchEvent(new MouseEvent('mousemove', {
      clientX: e.clientX, clientY: e.clientY, bubbles: false
    }))
  }
  if (eyeCanvas) {
    eyeCanvas.dispatchEvent(new MouseEvent('mousemove', {
      clientX: e.clientX, clientY: e.clientY, bubbles: false
    }))
  }
  if (eyeCanvas2) {
    eyeCanvas2.dispatchEvent(new MouseEvent('mousemove', {
      clientX: e.clientX, clientY: e.clientY, bubbles: false
    }))
  }
}

// 初始化 Rive 动画
onMounted(async () => {
  await nextTick()

  try {
    // 设置 WASM 路径
    const wasmUrl = new URL('@rive-app/canvas/rive.wasm', import.meta.url).href
    RuntimeLoader.setWasmUrl(wasmUrl)

    // 主插画动画
    const riveCanvas = riveCanvasRef.value
    if (riveCanvas) {
      const illustrationSrc = new URL('/riv/smallpeople.riv', import.meta.url).href
      riveInstance = new Rive({
        src: illustrationSrc,
        canvas: riveCanvas,
        stateMachines: 'State Machine 1',
        autoplay: true,
        autoBind: true,
        layout: new Layout({
          fit: Fit.Cover,
          alignment: Alignment.Center,
        }),
        onLoad: () => {
          riveInstance.resizeDrawingSurfaceToCanvas()

          // ViewModel API
          const viewModel = riveInstance.viewModelByName('Login')
          if (viewModel) {
            const instance = viewModel.defaultInstance()
            riveInstance.bindViewModelInstance(instance)
            statusInput = instance.number('status')
            correctTrigger = instance.trigger('correct')
            wrongTrigger = instance.trigger('wrong')
          }

          // Fallback: State Machine inputs API
          const inputs = riveInstance.stateMachineInputs('State Machine 1')
          if (inputs) {
            if (!statusInput) statusInput = inputs.find(i => i.name === 'status')
            if (!correctTrigger) correctTrigger = inputs.find(i => i.name === 'correct')
            if (!wrongTrigger) wrongTrigger = inputs.find(i => i.name === 'wrong')
          }
        },
        onLoadError: (err) => {
          console.error('Rive illustration load error:', err)
        },
      })
    }

    // 眼睛图标动画
    const initEyeRive = (canvasRef) => {
      const eyeCanvas = canvasRef.value
      if (!eyeCanvas) return
      const eyesSrc = new URL('/riv/eyes.riv', import.meta.url).href
      const r = new Rive({
        src: eyesSrc,
        canvas: eyeCanvas,
        stateMachines: 'State Machine 1',
        autoplay: true,
        autoBind: true,
        onLoad: () => {
          r.resizeDrawingSurfaceToCanvas()
          const viewModel = r.viewModelByName('Eyes')
          if (viewModel) {
            const instance = viewModel.defaultInstance()
            r.bindViewModelInstance(instance)
            displayInput = instance.boolean('display')
            if (displayInput) {
              displayInput.value = (passwordType.value === 'password')
            }
          }
        },
      })
      return r
    }

    eyeRiveInstance = initEyeRive(eyeCanvasRef)
    initEyeRive(eyeCanvasRef2)
  } catch (e) {
    console.error('Rive init error:', e)
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('resize', onResize)
})

const onResize = () => {
  if (riveInstance) riveInstance.resizeDrawingSurfaceToCanvas()
  if (eyeRiveInstance) eyeRiveInstance.resizeDrawingSurfaceToCanvas()
}

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('resize', onResize)
  if (riveInstance) {
    riveInstance.cleanup()
    riveInstance = null
  }
  if (eyeRiveInstance) {
    eyeRiveInstance.cleanup()
    eyeRiveInstance = null
  }
})
</script>

<style lang="less" scoped>
.login-page {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.login-container {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: #14141E;
}

// 左侧插画区
.illustration-section {
  flex: 50%;
  max-width: 60%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1C1C28;
  position: relative;
  overflow: hidden;
}

.rive-canvas {
  width: 100%;
  height: 100%;
}

// 右侧表单区
.form-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background-color: #14141E;
  position: relative;
}

.form-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 360px;
}

.header-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 40px;
}

.decorations {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.logo-icon {
  width: 48px;
  height: auto;
  filter: invert(1);
}

.welcome-title {
  width: 260px;
  height: auto;
  margin-bottom: 16px;
  filter: invert(1);
}

.subtitle {
  color: #8888AA;
  font-size: 14px;
  font-weight: 500;
}

// 表单
.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;

  &.register-form {
    gap: 8px;
    .input-group {
      height: 56px;
    }
  }
}

// 底部边框风格输入框 + 浮动标签
.input-group {
  display: flex;
  align-items: flex-end;
  width: 100%;
  height: 64px;
  position: relative;
  border-bottom: 1px solid #2A2A3C;
  transition: border-color 0.3s ease;

  &.input-focused,
  &:focus-within {
    border-bottom-color: #00EEA6;
  }

  input {
    color: #E8E8ED;
    background: transparent;
    border: none;
    outline: none;
    width: 100%;
    height: 40px;
    padding-bottom: 8px;
    padding-right: 40px;
    font-size: 16px;
    font-weight: 500;
    position: relative;
    z-index: 1;
  }

  input::placeholder {
    color: transparent;
  }

  // Autofill 样式修复
  input:-webkit-autofill {
    transition: background-color 5000s ease-in-out 0s;
    -webkit-text-fill-color: #E8E8ED !important;
    -webkit-box-shadow: 0 0 0 30px #1C1C28 inset !important;
  }
}

.floating-label {
  color: #666688;
  pointer-events: none;
  z-index: 0;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease-out;
  position: absolute;
  bottom: 14px;
  left: 0;
}

.input-group input:focus ~ .floating-label,
.input-group input:not(:placeholder-shown) ~ .floating-label {
  color: #00EEA6;
  font-size: 12px;
  bottom: 42px;
}

// 密码切换按钮
.toggle-password {
  cursor: pointer;
  background: none;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  position: absolute;
  bottom: 4px;
  right: 0;
  z-index: 2;
}

.eye-icon {
  pointer-events: none;
  width: 24px;
  height: 24px;
}

// 记住密码
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 12px;
  margin-bottom: 24px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #8888AA;

  input {
    display: none;
  }
}

.checkbox-custom {
  width: 14px;
  height: 14px;
  border: 1.2px solid #666688;
  display: inline-block;
  position: relative;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.checkbox-label input:checked + .checkbox-custom {
  border-color: #00EEA6;
  background-color: #00EEA6;
}

.checkbox-label input:checked + .checkbox-custom::after {
  content: '';
  width: 4px;
  height: 8px;
  border: 1.5px solid #14141E;
  border-width: 0 1.5px 1.5px 0;
  position: absolute;
  top: 1px;
  left: 3px;
  transform: rotate(45deg);
}

// 主按钮
.btn-primary {
  color: #14141E;
  cursor: pointer;
  background-color: #00EEA6;
  border: none;
  border-radius: 999px;
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  margin-top: 12px;

  &:hover:not(:disabled) {
    background-color: #00CC90;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 238, 166, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// 次级按钮
.btn-secondary {
  color: #8888AA;
  cursor: pointer;
  background-color: #1C1C2E;
  border: 1px solid #2A2A3C;
  border-radius: 999px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 48px;
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;

  &:hover {
    background-color: #222236;
    border-color: #00EEA6;
    color: #00EEA6;
  }
}

// 响应式
@media (max-width: 900px) {
  .login-container {
    flex-direction: column;
  }
  .illustration-section {
    display: none;
  }
  .form-section {
    flex: 1;
    padding: 60px 20px;
  }
}

// 抖动动画
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  50% { transform: translateX(6px); }
  75% { transform: translateX(-6px); }
}
</style>
