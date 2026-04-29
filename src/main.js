import './scss/main.scss'
import { initHeroBackground } from './hero'
import { initFooterEffect } from './footerEffect'
import Swal from 'sweetalert2'

// Hero background (desktop only, handled inside initHeroBackground)
initHeroBackground()

// Footer CTA background effect (autonomous animation)
initFooterEffect()


const currentYear = new Date().getFullYear().toString();

// Footer year
const footerYear = document.getElementById('footer-year');
if (footerYear) {
  footerYear.textContent = currentYear;
  footerYear.setAttribute('datetime', currentYear);
}

// Header scroll state
const header = document.querySelector('.header')

window.addEventListener('scroll', () => {
  if (!header) return
  header.classList.toggle('scrolled', window.scrollY > 30)
})

// Mobile navigation
const mobileToggle = document.querySelector('.header__mobile-toggle')
const mobileNav = document.querySelector('.header__mobile-nav')

const closeMobileMenu = () => {
  mobileToggle?.classList.remove('active')
  mobileToggle?.setAttribute('aria-expanded', 'false')
  mobileNav?.classList.remove('active')
  document.body.style.overflow = ''
}

mobileToggle?.addEventListener('click', () => {
  const willOpen = !mobileNav?.classList.contains('active')
  mobileToggle.classList.toggle('active', willOpen)
  mobileToggle?.setAttribute('aria-expanded', willOpen ? 'true' : 'false')
  mobileNav?.classList.toggle('active', willOpen)
  document.body.style.overflow = willOpen ? 'hidden' : ''
})

mobileNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMobileMenu)
})

window.addEventListener('resize', () => {
  if (window.innerWidth >= 1024) closeMobileMenu()
})

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const href = anchor.getAttribute('href')
    if (!href || href === '#') return

    const target = document.querySelector(href)
    if (!target) return

    event.preventDefault()
    target.scrollIntoView({ behavior: 'smooth' })
  })
})

// Phone mask (XX) XXXXX-XXXX
const phoneInput = document.getElementById('contact-phone')
if (phoneInput) {
  const formatPhone = (digits) => {
    if (digits.length <= 2) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

  phoneInput.addEventListener('input', (e) => {
    const input = e.target
    const digits = input.value.replace(/\D/g, '').slice(0, 11)
    input.value = formatPhone(digits)
  })
}

// Fade-in on scroll
const animateElements = document.querySelectorAll('[data-animate]')

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('animate-in')
        currentObserver.unobserve(entry.target)
      })
    },
    {
      threshold: 0.08,
      rootMargin: '0px 0px -5% 0px',
    },
  )

  animateElements.forEach((element) => observer.observe(element))

  requestAnimationFrame(() => {
    animateElements.forEach((element) => {
      const rect = element.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.95) {
        element.classList.add('animate-in')
        observer.unobserve(element)
      }
    })
  })
} else {
  animateElements.forEach((element) => element.classList.add('animate-in'))
}

const sendForm = () => {
  const form = document.querySelector('.footer__form')
  if (!form) return

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const formData = new FormData(form)

    let userIp = 'não identificado'
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json')
      if (ipResponse.ok) {
        const ipData = await ipResponse.json()
        userIp = ipData?.ip || userIp
      }
    } catch (_) {
    }

    formData.append('ip', userIp)

    await fetch('https://script.google.com/macros/s/AKfycbwfXBjQXG0sTEuA3Xks9K_3voUCmrivlxZLhe9Y-HOLBNT5rcQ9hz-7yO9aeqnjuMOYGw/exec', {
      method: 'POST',
      body: formData,
    })

    Swal.fire({
      theme: 'dark',
      title: 'Formulário enviado!',
      text: 'Obrigado por entrar em contato. Responderemos em breve.',
      icon: 'success',
      confirmButtonColor: '#44bccd',
      confirmButtonText: 'Fechar',
    })

    form.reset()
  })
}

sendForm()
