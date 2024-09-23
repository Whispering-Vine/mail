// Mailchimp Popup Script

// Create and append CSS styles
const style = document.createElement('style');
style.textContent = `
  .mailchimp-modal {
    display: flex;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    backdrop-filter: blur(5px);
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.5s ease, visibility 0.5s ease;
  }
  .mailchimp-modal.active {
    opacity: 1;
    visibility: visible;
  }
  .mailchimp-modal-content {
    background-color: #2c2c2e;
    border-radius: 12px;
    width: 90%;
    max-width: 800px;
    display: flex;
    position: relative;
    opacity: 0;
    transition: opacity 0.5s ease;
    overflow: hidden;
  }
  .mailchimp-modal.active .mailchimp-modal-content {
    opacity: 1;
  }
  .mailchimp-left-column {
    flex: 1;
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .mailchimp-right-column {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #1a1a1a;
  }
  .mailchimp-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .mailchimp-close {
    color: #000;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    position: absolute;
    top: 10px;
    right: 15px;
    transition: color 0.2s ease;
    z-index: 1;
    background-color: rgba(255, 255, 255, 0.81);
    border-radius: 100%;
    height: 28px;
    width: 28px;
    -webkit-backdrop-filter: blur(100px);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .mailchimp-close:hover,
  .mailchimp-close:focus {
    color: #4a4a4c;
  }
  .mailchimp-form {
    display: flex;
    align-items: center;
    background-color: #3a3a3c;
    border-radius: 12px;
    overflow: hidden;
    transition: background-color 0.2s ease;
    height: 56px;
    margin-top: 20px;
  }
  .mailchimp-form:hover {
    background-color: #4a4a4c;
  }
  .mailchimp-form.focused {
    box-shadow: inset 0 0 0 2px #bcbcbc;
  }
  .mailchimp-icon {
    padding: 16px 0 16px 20px;
    height: 24px;
  }
  .mailchimp-icon img {
    width: 24px;
    height: 24px;
    filter: brightness(0) saturate(100%) invert(100%);
  }
  .mailchimp-input {
    flex-grow: 1;
    background: none;
    border: none;
    color: #ffffff;
    padding: 16px 12px;
    font-size: 16px;
    font-family: 'Montserrat', sans-serif;
    outline: none;
  }
  .mailchimp-input::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  .mailchimp-button {
    background: none;
    border: none;
    color: #ffffff;
    font-size: 20px;
    padding: 16px;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.5s ease;
  }
  .mailchimp-button:hover {
    opacity: 1;
  }
  .subscription-message {
    display: none;
    color: #ffffff;
    text-align: center;
    margin-top: 20px;
  }
  
  @media (max-width: 768px) {
    .mailchimp-modal-content {
      flex-direction: column;
    }
    .mailchimp-right-column {
      display: none;
    }
    .mailchimp-left-column {
      width: 100%;
    }
  }
`;
document.head.appendChild(style);

// Create modal HTML
const modalHTML = `
  <div id="mailchimpModal" class="mailchimp-modal">
    <div class="mailchimp-modal-content">
      <span class="mailchimp-close">&times;</span>
      <div class="mailchimp-left-column">
        <h2 style="color: #ffffff; font-family: 'Montserrat', sans-serif;">Subscribe to Our Newsletter</h2>
        <form id="mailchimpForm" action="https://whisperingvinewine.us22.list-manage.com/subscribe/post?u=841ac5f1d95f2aff901de9613&amp;id=bea241e703" method="POST" class="mailchimp-form">
          <input type="hidden" name="u" value="841ac5f1d95f2aff901de9613">
          <input type="hidden" name="id" value="bea241e703">
          <div class="mailchimp-icon">
            <img src="img/email.svg" alt="Email icon">
          </div>
          <input type="email" name="MERGE0" placeholder="Sign up for exclusive deals!" required class="mailchimp-input">
          <button type="submit" class="mailchimp-button">→</button>
        </form>
        <div class="subscription-message">Thanks for Subscribing!</div>
      </div>
      <div class="mailchimp-right-column">
        <img src="img/wine_bottles.jpg" alt="Artistic image" class="mailchimp-image">
      </div>
    </div>
  </div>
`;

// Append modal to body
document.body.insertAdjacentHTML('beforeend', modalHTML);

// Get modal elements
const modal = document.getElementById("mailchimpModal");
const closeBtn = document.getElementsByClassName("mailchimp-close")[0];
const form = document.getElementById("mailchimpForm");
const input = form.querySelector('input[type="email"]');
const message = document.querySelector('.subscription-message');

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

// Function to get cookie
function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// Function to show modal
function showModal() {
  modal.classList.add('active');
}

// Function to hide modal
function hideModal() {
  modal.classList.remove('active');
}

// Close modal when clicking on close button or outside the modal
closeBtn.onclick = hideModal;
window.onclick = function(event) {
  if (event.target == modal) {
    hideModal();
  }
}

// Handle form submission
form.addEventListener('submit', function(e) {
  e.preventDefault();
  var url = this.action;
  var formData = new FormData(this);

  fetch(url, {
    method: 'POST',
    body: formData,
    mode: 'no-cors'
  })
  .then(response => {
    // Since we're using 'no-cors', we can't access the response content
    // We'll just assume it was successful
    form.style.display = 'none';
    message.style.display = 'block';
    
    setTimeout(() => {
      message.style.display = 'none';
      setTimeout(() => {
        form.style.display = 'flex';
        form.reset(); // Clear the form
      }, 300); // Wait for fade out animation to complete
      hideModal();
    }, 2000); // Show message for 2 seconds

    // Set cookie to remember subscription
    setCookie("mailchimp_subscribed", "true", 365);
  })
  .catch(error => {
    console.error('Error:', error);
    alert('There was an error. Please try again later.');
  });
});

// Show modal after 15 seconds if user hasn't subscribed
setTimeout(function() {
  if (!getCookie("mailchimp_subscribed")) {
    showModal();
    setCookie("mailchimp_last_shown", new Date().toUTCString(), 5);
  }
}, 1000);

// Check on page load if it's time to show the modal again
window.onload = function() {
  const lastShown = getCookie("mailchimp_last_shown");
  if (lastShown) {
    const fiveDaysAgo = new Date(new Date().getTime() - (5 * 24 * 60 * 60 * 1000));
    if (new Date(lastShown) < fiveDaysAgo && !getCookie("mailchimp_subscribed")) {
      showModal();
      setCookie("mailchimp_last_shown", new Date().toUTCString(), 5);
    }
  }
}

// Add focus and blur events to input
input.addEventListener('focus', function() {
  this.placeholder = 'Enter your email';
  form.classList.add('focused');
});

input.addEventListener('blur', function() {
  this.placeholder = 'Sign up for exclusive deals!';
  form.classList.remove('focused');
});
