import Swal from 'sweetalert2'

// ── Constants ──

const RATE_LIMIT_KEY = 'pt_form_last_submit'
const RATE_LIMIT_MS = 30_000 // 30 seconds cooldown
const FORM_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbwfXBjQXG0sTEuA3Xks9K_3voUCmrivlxZLhe9Y-HOLBNT5rcQ9hz-7yO9aeqnjuMOYGw/exec'

// ── Helpers ──

const sanitize = (str) => {
  const div = document.createElement('div')
  div.appendChild(document.createTextNode(str))
  return div.innerHTML.trim()
}

const setFieldError = (id, msg) => {
  const el = document.getElementById(id)
  const input =
    el?.previousElementSibling?.previousElementSibling ||
    el?.closest('.footer__form-group')?.querySelector('.footer__form-input')
  if (el) el.textContent = msg
  if (input) input.classList.toggle('has-error', !!msg)
}

const clearErrors = () => {
  document.querySelectorAll('.footer__form-error').forEach((el) => (el.textContent = ''))
  document
    .querySelectorAll('.footer__form-input.has-error')
    .forEach((el) => el.classList.remove('has-error'))
}

// ── Validation ──

const validateForm = (name, email, phone, message) => {
  let valid = true

  // Name: 2-100 chars, no dangerous chars
  if (!name || name.length < 2) {
    setFieldError('error-name', 'Informe seu nome (mínimo 2 caracteres).')
    valid = false
  } else if (/[<>{}\[\]\\\/]/.test(name)) {
    setFieldError('error-name', 'Nome contém caracteres inválidos.')
    valid = false
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  if (!email || !emailRegex.test(email)) {
    setFieldError('error-email', 'Informe um e-mail válido.')
    valid = false
  }

  // Phone: 10-11 digits
  const phoneDigits = phone.replace(/\D/g, '')
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    setFieldError('error-phone', 'Informe um telefone válido com DDD.')
    valid = false
  }

  // Message: optional, but max 1000 chars
  if (message && message.length > 1000) {
    setFieldError('error-message', 'Mensagem muito longa (máximo 1000 caracteres).')
    valid = false
  }

  return valid
}

// ── Phone Mask (XX) XXXXX-XXXX ──

const initPhoneMask = () => {
  const phoneInput = document.getElementById('contact-phone')
  if (!phoneInput) return

  const formatPhone = (digits) => {
    if (digits.length <= 2) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 10)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

  phoneInput.addEventListener('input', (e) => {
    const input = e.target
    const digits = input.value.replace(/\D/g, '').slice(0, 11)
    input.value = formatPhone(digits)
  })
}

// ── Form Submission ──

const initFormSubmit = () => {
  const form = document.querySelector('.footer__form')
  if (!form) return

  const submitBtn = form.querySelector('.footer__form-btn')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    clearErrors()

    // 1. Honeypot check
    const honeypot = form.querySelector('[name="website"]')
    if (honeypot && honeypot.value) return // bot detected, silently reject

    // 2. Rate limiting
    const lastSubmit = parseInt(localStorage.getItem(RATE_LIMIT_KEY) || '0', 10)
    if (Date.now() - lastSubmit < RATE_LIMIT_MS) {
      Swal.fire({
        theme: 'dark',
        title: 'Aguarde um momento',
        text: 'Você já enviou uma mensagem recentemente. Tente novamente em alguns segundos.',
        icon: 'warning',
        confirmButtonColor: '#44bccd',
        confirmButtonText: 'Entendi',
      })
      return
    }

    // 3. Get & sanitize values
    const rawName = form.name.value
    const rawEmail = form.email.value.trim()
    const rawPhone = form.phone.value
    const rawMessage = form.message.value

    const name = sanitize(rawName)
    const email = sanitize(rawEmail)
    const phone = sanitize(rawPhone)
    const message = sanitize(rawMessage)

    // 4. Validate
    if (!validateForm(name, email, phone, message)) return

    // 5. Disable button during submission
    if (submitBtn) {
      submitBtn.disabled = true
      submitBtn.textContent = 'Enviando...'
    }

    try {
      // 6. Get user IP
      let userIp = 'não identificado'
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json')
        if (ipRes.ok) {
          const ipData = await ipRes.json()
          userIp = ipData?.ip || userIp
        }
      } catch (_) {}

      // 7. Build FormData with sanitized values
      const formData = new FormData()
      formData.append('name', name)
      formData.append('email', email)
      formData.append('phone', phone)
      formData.append('message', message)
      formData.append('ip', userIp)

      // 8. Send
      await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: formData,
      })

      // 9. Mark submission time for rate limiting
      localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString())

      Swal.fire({
        theme: 'dark',
        title: 'Formulário enviado!',
        text: 'Obrigado por entrar em contato. Responderemos em breve.',
        icon: 'success',
        confirmButtonColor: '#44bccd',
        confirmButtonText: 'Fechar',
      })

      form.reset()
    } catch (err) {
      Swal.fire({
        theme: 'dark',
        title: 'Erro ao enviar',
        text: 'Ocorreu um problema. Tente novamente mais tarde.',
        icon: 'error',
        confirmButtonColor: '#44bccd',
        confirmButtonText: 'Fechar',
      })
    } finally {
      // 10. Re-enable button
      if (submitBtn) {
        submitBtn.disabled = false
        submitBtn.innerHTML = `Enviar <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>`
      }
    }
  })
}

// ── Public Init ──

export const initFormHandler = () => {
  initPhoneMask()
  initFormSubmit()
}