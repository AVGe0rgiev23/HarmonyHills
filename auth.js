// Authentication JavaScript with Firebase
import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail,
    sendEmailVerification,
    onAuthStateChanged,
    signOut
} from 'firebase/auth';
import { 
    doc, 
    setDoc, 
    getDoc, 
    serverTimestamp 
} from 'firebase/firestore';

// Global variables
let currentUser = null;

// Initialize GSAP animations
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeFormValidation();
    initializeAuthStateListener();
});

// GSAP Animations
function initializeAnimations() {
    // Animate floating shapes
    gsap.to('.shape-1', {
        y: -30,
        rotation: 360,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
    });

    gsap.to('.shape-2', {
        y: -20,
        rotation: -360,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        delay: 1
    });

    gsap.to('.shape-3', {
        y: -25,
        rotation: 360,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        delay: 2
    });

    gsap.to('.shape-4', {
        y: -35,
        rotation: -360,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        delay: 3
    });

    gsap.to('.shape-5', {
        y: -15,
        rotation: 360,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        delay: 4
    });

    // Initial form animation
    gsap.from('.auth-container', {
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.7)"
    });
}

// Form Validation
function initializeFormValidation() {
    // Real-time email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('input', validateEmail);
        input.addEventListener('blur', validateEmail);
    });

    // Real-time password validation
    const passwordInput = document.getElementById('signup-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePassword);
    }

    // Confirm password validation
    const confirmPasswordInput = document.getElementById('signup-confirm-password');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validateConfirmPassword);
    }

    // Form submissions
    document.getElementById('login-form-element').addEventListener('submit', handleLogin);
    document.getElementById('signup-form-element').addEventListener('submit', handleSignup);
    document.getElementById('forgot-password-form-element').addEventListener('submit', handleForgotPassword);
}

// Email validation
function validateEmail(event) {
    const input = event.target;
    const email = input.value.trim();
    const errorElement = document.getElementById(input.id + '-error');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email === '') {
        showFieldError(input, errorElement, '');
        return false;
    } else if (!emailRegex.test(email)) {
        showFieldError(input, errorElement, 'Please enter a valid email address');
        return false;
    } else {
        showFieldSuccess(input, errorElement);
        return true;
    }
}

// Password validation
function validatePassword(event) {
    const input = event.target;
    const password = input.value;
    const errorElement = document.getElementById('signup-password-error');
    const strengthElement = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (password === '') {
        showFieldError(input, errorElement, '');
        updatePasswordStrength('', strengthElement, strengthText);
        return false;
    }
    
    const strength = calculatePasswordStrength(password);
    updatePasswordStrength(strength, strengthElement, strengthText);
    
    if (strength === 'weak') {
        showFieldError(input, errorElement, 'Password is too weak');
        return false;
    } else if (password.length < 6) {
        showFieldError(input, errorElement, 'Password must be at least 6 characters');
        return false;
    } else {
        showFieldSuccess(input, errorElement);
        return true;
    }
}

// Confirm password validation
function validateConfirmPassword(event) {
    const input = event.target;
    const confirmPassword = input.value;
    const password = document.getElementById('signup-password').value;
    const errorElement = document.getElementById('signup-confirm-password-error');
    
    if (confirmPassword === '') {
        showFieldError(input, errorElement, '');
        return false;
    } else if (confirmPassword !== password) {
        showFieldError(input, errorElement, 'Passwords do not match');
        return false;
    } else {
        showFieldSuccess(input, errorElement);
        return true;
    }
}

// Calculate password strength
function calculatePasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score < 2) return 'weak';
    if (score < 3) return 'fair';
    if (score < 4) return 'good';
    return 'strong';
}

// Update password strength indicator
function updatePasswordStrength(strength, strengthElement, strengthText) {
    strengthElement.className = 'strength-fill';
    
    if (strength) {
        strengthElement.classList.add(strength);
        strengthText.textContent = `Password strength: ${strength}`;
    } else {
        strengthText.textContent = 'Password strength';
    }
}

// Show field error
function showFieldError(input, errorElement, message) {
    input.classList.remove('success');
    input.classList.add('error');
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

// Show field success
function showFieldSuccess(input, errorElement) {
    input.classList.remove('error');
    input.classList.add('success');
    errorElement.textContent = '';
    errorElement.classList.remove('show');
}

// Toggle password visibility
window.togglePassword = function(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.innerHTML = '<span class="eye-icon">🙈</span>';
    } else {
        input.type = 'password';
        button.innerHTML = '<span class="eye-icon">👁️</span>';
    }
}

// Switch between forms
window.switchToSignup = function() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    gsap.to(loginForm, {
        x: -50,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
            gsap.fromTo(signupForm, 
                { x: 50, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.3 }
            );
        }
    });
}

window.switchToLogin = function() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const forgotForm = document.getElementById('forgot-password-form');
    
    const currentForm = !signupForm.classList.contains('hidden') ? signupForm : forgotForm;
    
    gsap.to(currentForm, {
        x: 50,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            currentForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            gsap.fromTo(loginForm, 
                { x: -50, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.3 }
            );
        }
    });
}

window.showForgotPassword = function() {
    const loginForm = document.getElementById('login-form');
    const forgotForm = document.getElementById('forgot-password-form');
    
    gsap.to(loginForm, {
        y: -30,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            loginForm.classList.add('hidden');
            forgotForm.classList.remove('hidden');
            gsap.fromTo(forgotForm, 
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.3 }
            );
        }
    });
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    const submitButton = event.target.querySelector('button[type="submit"]');
    
    // Validate inputs
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    setButtonLoading(submitButton, true);
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Store remember me preference
        if (rememberMe) {
            localStorage.setItem('rememberUser', 'true');
        }
        
        // Update user's last login
        await updateUserLastLogin(user.uid);
        
        showSuccessModal('Welcome Back!', 'You have successfully signed in.');
        
        // Redirect after success
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification(getFirebaseErrorMessage(error.code), 'error');
    } finally {
        setButtonLoading(submitButton, false);
    }
}

// Handle signup
async function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const termsAgreed = document.getElementById('terms-agreement').checked;
    const submitButton = event.target.querySelector('button[type="submit"]');
    
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (!termsAgreed) {
        showNotification('Please agree to the Terms & Conditions', 'error');
        return;
    }
    
    setButtonLoading(submitButton, true);
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create user document in Firestore
        await createUserDocument(user.uid, {
            name: name,
            email: email,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            emailVerified: false,
            role: 'user'
        });
        
        // Send email verification
        await sendEmailVerification(user);
        
        showSuccessModal('Account Created!', 'Please check your email to verify your account.');
        
        // Redirect after success
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
        
    } catch (error) {
        console.error('Signup error:', error);
        showNotification(getFirebaseErrorMessage(error.code), 'error');
    } finally {
        setButtonLoading(submitButton, false);
    }
}

// Handle forgot password
async function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('forgot-email').value.trim();
    const submitButton = event.target.querySelector('button[type="submit"]');
    
    if (!email) {
        showNotification('Please enter your email address', 'error');
        return;
    }
    
    setButtonLoading(submitButton, true);
    
    try {
        await sendPasswordResetEmail(auth, email);
        showSuccessModal('Reset Link Sent!', 'Please check your email for password reset instructions.');
        
        setTimeout(() => {
            switchToLogin();
        }, 2000);
        
    } catch (error) {
        console.error('Password reset error:', error);
        showNotification(getFirebaseErrorMessage(error.code), 'error');
    } finally {
        setButtonLoading(submitButton, false);
    }
}

// Create user document in Firestore
async function createUserDocument(uid, userData) {
    try {
        await setDoc(doc(db, 'users', uid), userData);
    } catch (error) {
        console.error('Error creating user document:', error);
        throw error;
    }
}

// Update user's last login
async function updateUserLastLogin(uid) {
    try {
        await setDoc(doc(db, 'users', uid), {
            lastLogin: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error('Error updating last login:', error);
    }
}

// Auth state listener
function initializeAuthStateListener() {
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        if (user) {
            console.log('User is signed in:', user.email);
        } else {
            console.log('User is signed out');
        }
    });
}

// Set button loading state
function setButtonLoading(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Show success modal
function showSuccessModal(title, message) {
    const modal = document.getElementById('success-modal');
    const titleElement = document.getElementById('success-title');
    const messageElement = document.getElementById('success-message');
    
    titleElement.textContent = title;
    messageElement.textContent = message;
    modal.classList.remove('hidden');
    
    // Animate modal appearance
    gsap.fromTo('.success-content', 
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
    );
}

// Close success modal
window.closeSuccessModal = function() {
    const modal = document.getElementById('success-modal');
    gsap.to('.success-content', {
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            modal.classList.add('hidden');
        }
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    notification.querySelector('button').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Get user-friendly Firebase error messages
function getFirebaseErrorMessage(errorCode) {
    const errorMessages = {
        'auth/user-not-found': 'No account found with this email address.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/requires-recent-login': 'Please sign in again to complete this action.'
    };
    
    return errorMessages[errorCode] || 'An error occurred. Please try again.';
}