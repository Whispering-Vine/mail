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
        .wv-newsletter-input {
            z-index: 1; /* Ensure input is interactive */
        }
        
        .wv-newsletter-button {
            z-index: 2; /* Ensure button is on top and clickable */
        }
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
    
            // Function to update placeholder based on container width
            function updatePlaceholder() {
                newsletterInput.placeholder = newsletterContainer.offsetWidth <= 350 ? 'Sign up' : 'Sign up for exclusive deals!';
            }
    
            // Initial call to set placeholder
            updatePlaceholder();
    
            // Add resize observer to update placeholder when container size changes
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
            console.log(form); // Check if this logs the form element
    
            div.querySelector('#wv-newsletter-form').addEventListener('submit', function(e) {
                e.preventDefault();
    
                var form = this;
                var url = form.action;
                var formData = new FormData(form);
                var container = form.closest('.wv-newsletter-container');
                var message = container.querySelector('.wv-subscription-message');
    
                fetch(url, {
                    method: 'POST',
                    body: formData,
                    mode: 'no-cors'
                })
                .then(response => {
                    form.style.display = 'none';
                    message.classList.add('show');
                    setCookie("mailchimp_subscribed", "true", 365);
                    
                    setTimeout(() => {
                        message.classList.remove('show');
                        setTimeout(() => {
                            form.style.display = 'flex';
                            form.reset();
                        }, 300);
                    }, 3000);
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('There was an error. Please try again later.');
                });
            });
        });
    });
})();
