(function() {
    // CSS styles
    var styles = `
        .wv-newsletter-container {
            background-color: #2c2c2e;
            border-radius: 12px;
            overflow: hidden;
            transition: background-color 0.2s ease;
            height: 56px;
            position: relative;
            width: 100%;
            font-family: 'Montserrat', sans-serif;
            color: #ffffff;
        }
        .wv-newsletter-container:hover {
            background-color: rgba(26, 26, 26);
        }
        .wv-newsletter-container.focused {
            box-shadow: inset 0 0 0 2px #bcbcbc;
        }
        .wv-newsletter-form {
            display: flex;
            align-items: center;
            height: 56px;
            position: relative;
        }
        .wv-newsletter-icon {
            padding: 0px 0 0px 20px;
            height: 56px;
            z-index: 1;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .wv-newsletter-icon img {
            width: 24px;
            height: 24px;
            filter: brightness(0) saturate(100%) invert(100%);
        }
        .wv-newsletter-input {
            flex-grow: 1;
            background: none;
            border: none;
            color: #ffffff;
            padding: 16px 12px;
            font-size: 16px;
            font-family: 'Montserrat', sans-serif;
            outline: none;
            position: relative;
            z-index: 1;
            transition: all 0.5s ease;
            width: 100%;
        }
        .wv-newsletter-input::placeholder {
            color: rgba(255, 255, 255, 0.7);
            transition: opacity 0.5s ease;
        }
        .wv-newsletter-button {
            background: none;
            border: none;
            color: #ffffff;
            font-size: 20px;
            padding: 16px;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.5s ease;
        }
        .wv-newsletter-button:hover {
            opacity: 1;
        }
        .wv-subscription-message {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            width: 100%;
            font-weight: 500;
            opacity: 0;
            transform: translateX(-40px);
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .wv-subscription-message.show {
            opacity: 1;
            transform: translateX(0);
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        textarea:-webkit-autofill,
        textarea:-webkit-autofill:hover,
        textarea:-webkit-autofill:focus,
        select:-webkit-autofill,
        select:-webkit-autofill:hover,
        select:-webkit-autofill:focus {
            -webkit-background-clip: text;
            -webkit-text-fill-color: #ffffff;
            transition: background-color 5000s ease-in-out 0s;
        }
        .wv-newsletter-input { z-index: 1; }
        .wv-newsletter-button { z-index: 2; }
    `;

    // Create style element and append to head
    var styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    // HTML template for the newsletter signup form
    var template = `
        <div class="wv-newsletter-container">
            <form id="wv-newsletter-form" action="https://whisperingvinewine.us22.list-manage.com/subscribe/post?u=841ac5f1d95f2aff901de9613&amp;id=bea241e703" method="POST" class="wv-newsletter-form">
                <input type="hidden" name="id" value="bea241e703">
                <input type="hidden" name="u" value="841ac5f1d95f2aff901de9613">
                <div class="wv-newsletter-icon">
                    <img src="https://mail.wvwine.co/img/email.svg" alt="Email icon">
                </div>
                <input type="email" name="MERGE0" placeholder="Sign up for exclusive deals!" aria-label="Newsletter Email" required class="wv-newsletter-input" autocomplete="email">
                <button type="submit" class="wv-newsletter-button" aria-label="Sign up for newsletter">→</button>
            </form>
            <div class="wv-subscription-message">Thanks for Subscribing!</div>
        </div>
    `;

    // Function to set cookie
    function setCookie(name, value, days) {
      let expires = "";
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    document.addEventListener('DOMContentLoaded', function() {
        // Find all divs with class "email-signup" and replace them with the newsletter form
        var signupDivs = document.querySelectorAll('.email-signup');
        signupDivs.forEach(function(div) {
            div.innerHTML = template;

            var newsletterInput = div.querySelector('.wv-newsletter-input');
            var newsletterContainer = div.querySelector('.wv-newsletter-container');

            function updatePlaceholder() {
                newsletterInput.placeholder = newsletterContainer.offsetWidth <= 350 ? 'Sign up' : 'Sign up for exclusive deals!';
            }
            updatePlaceholder();
            var resizeObserver = new ResizeObserver(updatePlaceholder);
            resizeObserver.observe(newsletterContainer);

            newsletterInput.addEventListener('focus', function() {
                this.placeholder = 'Enter your email';
                newsletterContainer.classList.add('focused');
            });
            newsletterInput.addEventListener('blur', function() {
                updatePlaceholder();
                newsletterContainer.classList.remove('focused');
            });

            var form = div.querySelector('#wv-newsletter-form');
            var message = div.querySelector('.wv-subscription-message');

            form.addEventListener('submit', function(e) {
                e.preventDefault();

                // Build FormData explicitly so we control exactly what gets sent
                var fd = new FormData();

                // Mailchimp required fields
                var u  = form.querySelector('input[name="u"]').value;
                var id = form.querySelector('input[name="id"]').value;
                var email = (form.querySelector('input[name="MERGE0"]')?.value || '').trim();

                fd.append('u', u);
                fd.append('id', id);

                // Send both EMAIL and MERGE0 (Mailchimp accepts either)
                fd.append('MERGE0', email);
                fd.append('EMAIL',  email);

                // Force all interest groups (category 256)
                ['1','2','4','8','16'].forEach(function(v){
                    fd.append('group[256][' + v + ']', '1');
                });

                // Post directly to list-manage (opaque response due to no-cors is expected)
                fetch('https://whisperingvinewine.us22.list-manage.com/subscribe/post', {
                    method: 'POST',
                    body: fd,
                    mode: 'no-cors'
                })
                .then(function() {
                    form.style.display = 'none';
                    message.classList.add('show');
                    setCookie("mailchimp_subscribed", "true", 365);

                    setTimeout(function() {
                        message.classList.remove('show');
                        setTimeout(function() {
                            form.style.display = 'flex';
                            form.reset();
                        }, 300);
                    }, 3000);
                })
                .catch(function(error) {
                    console.error('Error:', error);
                    alert('There was an error. Please try again later.');
                });
            });
        });
    });
})();
