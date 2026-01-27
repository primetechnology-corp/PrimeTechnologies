document.addEventListener('DOMContentLoaded', function() {

    const header = document.querySelector('header');
    const contactForm = document.getElementById('contact-form');
    const teamSwiper = document.querySelector('.team-swiper');

    // Adiciona fundo ao header no scroll (apenas na página inicial)
    if (header && !document.body.classList.contains('contact-page')) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Lógica do formulário de contato
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            alert('Obrigado por sua mensagem! Entraremos em contato em breve.');
        });
    }

    // Lógica do carrossel Swiper
    if (teamSwiper) {
        var swiper = new Swiper('.team-swiper', {
            slidesPerView: 1,
            spaceBetween: 10,
            loop: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                },
            }
        });
    }

});