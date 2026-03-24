// Backend API configuration
// This project is served as plain static files, so browser-side env injection is not available.
const API_BASE_URL = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://aaina-landing-page-backend.vercel.app';

// API client helper function
async function callAPI(endpoint, payload) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

// Cute popup function
function showCutePopup(title, message, type = 'success') {
    // Remove existing popup if any
    const existingPopup = document.querySelector('.cute-popup-overlay');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.className = 'cute-popup-overlay';
    
    // Create popup container
    const popup = document.createElement('div');
    popup.className = `cute-popup ${type}`;
    
    // Add sparkle animations
    const sparkles = ['✨', '💖', '🌟', '💕', '🦋', '🌸'];
    const randomSparkle = sparkles[Math.floor(Math.random() * sparkles.length)];
    
    popup.innerHTML = `
        <div class="popup-sparkle">${randomSparkle}</div>
        <div class="popup-header">
            <h3 class="popup-title">${title}</h3>
        </div>
        <div class="popup-body">
            <p class="popup-message">${message}</p>
        </div>
        <div class="popup-footer">
            <button class="popup-close-btn" onclick="closeCutePopup()">Got it! 💕</button>
        </div>
        <div class="floating-hearts">
            <div class="heart">💕</div>
            <div class="heart">💖</div>
            <div class="heart">💗</div>
        </div>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Animate in
    setTimeout(() => {
        overlay.classList.add('show');
    }, 10);
    
    // Auto close after 4 seconds for success messages
    // if (type === 'success') {
    //     setTimeout(() => {
    //         closeCutePopup();
    //     }, 4000);
    // }
}

function closeCutePopup() {
    const overlay = document.querySelector('.cute-popup-overlay');
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
}

// Handle email signup (Join button)
async function handleEmailSignup() {
    const emailInput = document.querySelector('.email-input');
    const joinButton = document.querySelector('.join-button');
    const email = emailInput.value.trim();

    if (!email) {
        showCutePopup('💌 Oops!', 'Please enter your email address, beautiful! ✨', 'warning');
        return;
    }

    if (!isValidEmail(email)) {
        showCutePopup('💌 Almost there!', 'Please enter a valid email address, gorgeous! 💕', 'warning');
        return;
    }

    // Disable button and show loading state
    joinButton.disabled = true;
    joinButton.textContent = 'Joining...';

    try {
        // Call backend API instead of Supabase directly
        const response = await callAPI('/api/signup', { email });

        if (response.success) {
            showCutePopup('🎉 Welcome to Aaina!', response.message, response.type);
            emailInput.value = ''; // Clear the input
        } else {
            showCutePopup('💌 ' + response.message.split('!')[0] + '!', response.message, response.type);
        }
    } catch (error) {
        console.error('Network error:', error);
        showCutePopup('📶 Connection Issue', 'Please check your connection and try again, sweetie! 💕', 'error');
    } finally {
        // Reset button state
        joinButton.disabled = false;
        joinButton.textContent = 'Join';
    }
}

// Handle preferences submission (Send Your Idea button)
async function handlePreferencesSubmission() {
    const sendButton = document.querySelector('.join-early-access-btn');
    const customIdeaInput = document.querySelector('.idea-input');
    const preferenceCards = document.querySelectorAll('.preference-card');
    
    // Get selected preferences
    const selectedPreferences = [];
    preferenceCards.forEach(card => {
        if (card.classList.contains('selected')) {
            const preferenceText = card.querySelector('.preference-text').textContent;
            selectedPreferences.push(preferenceText);
        }
    });

    const customIdea = customIdeaInput.value.trim();

    // Check if user has selected at least one preference or entered a custom idea
    if (selectedPreferences.length === 0 && !customIdea) {
        showCutePopup('💭 Tell us more!', 'Please select at least one preference or share your amazing idea with us! ✨', 'warning');
        return;
    }

    // Disable button and show loading state
    sendButton.disabled = true;
    sendButton.textContent = 'Sending...';

    try {
        // Call backend API instead of Supabase directly
        const response = await callAPI('/api/preferences', {
            selectedPreferences,
            customIdea: customIdea || null
        });

        if (response.success) {
            showCutePopup('💎 Amazing!', response.message, response.type);
            // Reset form
            customIdeaInput.value = '';
            preferenceCards.forEach(card => {
                card.classList.remove('selected');
            });
        } else {
            showCutePopup('😊 Oops!', response.message, response.type);
        }
    } catch (error) {
        console.error('Network error:', error);
        showCutePopup('📶 Connection Issue', 'Please check your connection and try again, beautiful! 💕', 'error');
    } finally {
        // Reset button state
        sendButton.disabled = false;
        sendButton.textContent = 'Send Your Idea';
    }
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Make preference cards selectable
function initializePreferenceCards() {
    const preferenceCards = document.querySelectorAll('.preference-card');
    
    preferenceCards.forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize preference card selection
    initializePreferenceCards();
    
    // Email signup button event listener
    const joinButton = document.querySelector('.join-button');
    if (joinButton) {
        joinButton.addEventListener('click', handleEmailSignup);
    }
    
    // Email input enter key event listener
    const emailInput = document.querySelector('.email-input');
    if (emailInput) {
        emailInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleEmailSignup();
            }
        });
    }
    
    // Preferences submission button event listener
    const sendButton = document.querySelector('.join-early-access-btn');
    if (sendButton) {
        sendButton.addEventListener('click', handlePreferencesSubmission);
    }
    
    // Custom idea input enter key event listener
    const customIdeaInput = document.querySelector('.idea-input');
    if (customIdeaInput) {
        customIdeaInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handlePreferencesSubmission();
            }
        });
    }
});
