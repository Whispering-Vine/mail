(function() {
    // CSS styles
    var styles = `
        .newsletter-container {
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
        .newsletter-container:hover {
            background-color: rgba(26, 26, 26);
        }
        .newsletter-container.focused {
            box-shadow: inset 0 0 0 2px #bcbcbc;
        }
        .newsletter-form {
            display: flex;
            align-items: center;
            height: 56px;
            position: relative;
        }
        .newsletter-icon {
            padding: 0px 0 0px 20px;
            height: 56px;
            z-index: 1;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .newsletter-icon img {
            width: 24px;
            height: 24px;
            filter: brightness(0) saturate(100%) invert(100%);
        }
        .newsletter-input {
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
        .newsletter-input::placeholder {
            color: rgba(255, 255, 255, 0.7);
            transition: opacity 0.5s ease;
        }
        .newsletter-button {
            background: none;
            border: none;
            color: #ffffff;
            font-size: 20px;
            padding: 16px;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.5s ease;
        }
        .newsletter-button:hover {
            opacity: 1;
        }
        .subscription-message {
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
        .subscription-message.show {
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
    `;

    // Create style element and append to head
    var styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    // HTML template for the newsletter signup form
    var template = `
        <div class="newsletter-container">
            <form id="newsletter-form" action="https://whisperingvinewine.us22.list-manage.com/subscribe/post?u=841ac5f1d95f2aff901de9613&amp;id=bea241e703" method="POST" class="newsletter-form">
                <input type="hidden" name="id" value="bea241e703">
                <input type="hidden" name="u" value="841ac5f1d95f2aff901de9613">
                <div class="newsletter-icon">
                    <img src="https://mail.wvwine.co/img/email.svg" alt="Email icon">
                </div>
                <input type="email" name="MERGE0" placeholder="Sign up for exclusive deals!" aria-label="Newsletter Email" required class="newsletter-input" autocomplete="email">
                <button type="submit" class="newsletter-button" aria-label="Sign up for newsletter">→</button>
            </form>
            <div class="subscription-message">Thanks for Subscribing!</div>
        </div>
    `;

    // Find all divs with class "email-signup" and replace them with the newsletter form
    var signupDivs = document.querySelectorAll('.email-signup');
    signupDivs.forEach(function(div) {
        div.innerHTML = template;

        var newsletterInput = div.querySelector('.newsletter-input');
        var newsletterContainer = div.querySelector('.newsletter-container');

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

        div.querySelector('#newsletter-form').addEventListener('submit', function(e) {
            e.preventDefault();

            var form = this;
            var url = form.action;
            var formData = new FormData(form);
            var container = form.closest('.newsletter-container');
            var message = container.querySelector('.subscription-message');

            fetch(url, {
                method: 'POST',
                body: formData,
                mode: 'no-cors'
            })
            .then(response => {
                form.style.display = 'none';
                message.classList.add('show');
                
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
})();
