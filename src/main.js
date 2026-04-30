import './scss/main.scss'
import { initHeroBackground } from './hero'
import { initFormHandler } from './formHandler'

// Hero background (desktop only, handled inside initHeroBackground)
initHeroBackground()

// Contact form (mask, validation, security, submission)
initFormHandler()

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