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

            // INÍCIO DA LÓGICA DO EMAILJS
            // Substitua com suas próprias chaves do EmailJS
            const serviceID = 'SEU_SERVICE_ID';
            const templateID = 'SEU_TEMPLATE_ID';
            const publicKey = 'SUA_PUBLIC_KEY';

            emailjs.init(publicKey);

            const templateParams = {
                name: contactForm.querySelector('input[name="name"]').value,
                email: contactForm.querySelector('input[name="email"]').value,
                message: contactForm.querySelector('textarea[name="message"]').value,
            };

            emailjs.send(serviceID, templateID, templateParams)
                .then(function(response) {
                   console.log('SUCCESS!', response.status, response.text);
                   alert('Obrigado por sua mensagem! Entraremos em contato em breve.');
                   contactForm.reset(); // Limpa o formulário após o envio
                }, function(error) {
                   console.log('FAILED...', error);
                   alert('Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente mais tarde.');
                });
            // FIM DA LÓGICA DO EMAILJS
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