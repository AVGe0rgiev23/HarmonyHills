// Admin Dashboard JavaScript with Firebase
import { auth, db } from './firebase-config.js';
import { 
    onAuthStateChanged, 
    signOut 
} from 'firebase/auth';
import { 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    orderBy, 
    limit, 
    where,
    serverTimestamp 
} from 'firebase/firestore';

// Global variables
let currentUser = null;
let allUsers = [];
let allApartments = [];
let allInquiries = [];

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    initializeEventListeners();
});

// Initialize authentication
function initializeAuth() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            
            // Check if user is admin
            const isAdmin = await checkAdminStatus(user.uid);
            if (isAdmin) {
                document.getElementById('admin-name').textContent = user.displayName || user.email;
                await loadDashboardData();
            } else {
                // Redirect non-admin users
                alert('Access denied. Admin privileges required.');
                window.location.href = 'index.html';
            }
        } else {
            // Redirect to login if not authenticated
            window.location.href = 'auth.html';
        }
    });
}

// Check if user has admin privileges
async function checkAdminStatus(uid) {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            return userData.role === 'admin';
        }
        return false;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.nav-item a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });

    // Apartment form submission
    document.getElementById('apartment-form').addEventListener('submit', handleAddApartment);
}

// Load all dashboard data
async function loadDashboardData() {
    showLoadingOverlay(true);
    
    try {
        await Promise.all([
            loadUsers(),
            loadApartments(),
            loadInquiries()
        ]);
        
        updateDashboardStats();
        loadRecentActivity();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading dashboard data', 'error');
    } finally {
        showLoadingOverlay(false);
    }
}

// Load users from Firestore
async function loadUsers() {
    try {
        const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(usersQuery);
        
        allUsers = [];
        querySnapshot.forEach((doc) => {
            allUsers.push({ id: doc.id, ...doc.data() });
        });
        
        renderUsersTable();
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Load apartments from Firestore
async function loadApartments() {
    try {
        const apartmentsQuery = query(collection(db, 'apartments'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(apartmentsQuery);
        
        allApartments = [];
        querySnapshot.forEach((doc) => {
            allApartments.push({ id: doc.id, ...doc.data() });
        });
        
        renderApartmentsGrid();
    } catch (error) {
        console.error('Error loading apartments:', error);
    }
}

// Load inquiries from Firestore
async function loadInquiries() {
    try {
        const inquiriesQuery = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(inquiriesQuery);
        
        allInquiries = [];
        querySnapshot.forEach((doc) => {
            allInquiries.push({ id: doc.id, ...doc.data() });
        });
        
        renderInquiriesList();
    } catch (error) {
        console.error('Error loading inquiries:', error);
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    document.getElementById('total-users').textContent = allUsers.length;
    document.getElementById('total-apartments').textContent = allApartments.length;
    document.getElementById('total-inquiries').textContent = allInquiries.filter(inquiry => !inquiry.read).length;
}

// Load recent activity
function loadRecentActivity() {
    // Recent users
    const recentUsers = allUsers.slice(0, 5);
    const recentUsersContainer = document.getElementById('recent-users');
    
    if (recentUsers.length === 0) {
        recentUsersContainer.innerHTML = '<p>No recent registrations</p>';
    } else {
        recentUsersContainer.innerHTML = recentUsers.map(user => `
            <div class="user-info">
                <div class="user-avatar">${user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                <div class="user-details">
                    <h4>${user.name || 'Unknown'}</h4>
                    <p>${user.email}</p>
                </div>
            </div>
        `).join('');
    }
    
    // Recent inquiries
    const recentInquiries = allInquiries.slice(0, 5);
    const recentInquiriesContainer = document.getElementById('recent-inquiries');
    
    if (recentInquiries.length === 0) {
        recentInquiriesContainer.innerHTML = '<p>No recent inquiries</p>';
    } else {
        recentInquiriesContainer.innerHTML = recentInquiries.map(inquiry => `
            <div class="inquiry-item">
                <h5>${inquiry.name}</h5>
                <p>${inquiry.message.substring(0, 100)}...</p>
                <small>${formatDate(inquiry.createdAt)}</small>
            </div>
        `).join('');
    }
}

// Render users table
function renderUsersTable() {
    const tbody = document.getElementById('users-table-body');
    
    if (allUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = allUsers.map(user => `
        <tr>
            <td>
                <div class="user-info">
                    <div class="user-avatar">${user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                    <div class="user-details">
                        <h4>${user.name || 'Unknown'}</h4>
                        <p>${user.email}</p>
                    </div>
                </div>
            </td>
            <td>${user.email}</td>
            <td><span class="role-badge ${user.role || 'user'}">${user.role || 'user'}</span></td>
            <td><span class="status-badge ${user.emailVerified ? 'verified' : 'unverified'}">${user.emailVerified ? 'Verified' : 'Unverified'}</span></td>
            <td>${formatDate(user.createdAt)}</td>
            <td>${formatDate(user.lastLogin)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editUser('${user.id}')">✏️</button>
                    <button class="action-btn delete" onclick="deleteUser('${user.id}')">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Render apartments grid
function renderApartmentsGrid() {
    const grid = document.getElementById('apartments-grid');
    
    if (allApartments.length === 0) {
        grid.innerHTML = '<div class="loading">No apartments found</div>';
        return;
    }
    
    grid.innerHTML = allApartments.map(apartment => `
        <div class="apartment-card">
            <div class="apartment-image">🏠</div>
            <div class="apartment-content">
                <div class="apartment-header">
                    <div>
                        <h3 class="apartment-title">${apartment.title}</h3>
                        <p>${apartment.address}</p>
                    </div>
                    <div class="apartment-price">$${apartment.price}</div>
                </div>
                <div class="apartment-details">
                    <span>🛏️ ${apartment.bedrooms} bed</span>
                    <span>🛁 ${apartment.bathrooms} bath</span>
                </div>
                <p>${apartment.description.substring(0, 100)}...</p>
                <div class="apartment-actions">
                    <button class="action-btn edit" onclick="editApartment('${apartment.id}')">✏️ Edit</button>
                    <button class="action-btn delete" onclick="deleteApartment('${apartment.id}')">🗑️ Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Render inquiries list
function renderInquiriesList() {
    const list = document.getElementById('inquiries-list');
    
    if (allInquiries.length === 0) {
        list.innerHTML = '<div class="loading">No inquiries found</div>';
        return;
    }
    
    list.innerHTML = allInquiries.map(inquiry => `
        <div class="inquiry-card ${!inquiry.read ? 'unread' : ''}">
            <div class="inquiry-header">
                <div class="inquiry-info">
                    <h4>${inquiry.name}</h4>
                    <p>${inquiry.email} • ${inquiry.inquiryType || 'General'}</p>
                </div>
                <div class="inquiry-meta">
                    <p>${formatDate(inquiry.createdAt)}</p>
                    ${!inquiry.read ? '<span class="status-badge unverified">New</span>' : ''}
                </div>
            </div>
            <div class="inquiry-message">
                ${inquiry.message}
            </div>
            <div class="inquiry-actions">
                ${!inquiry.read ? `<button class="btn btn-primary" onclick="markAsRead('${inquiry.id}')">Mark as Read</button>` : ''}
                <button class="btn btn-secondary" onclick="replyToInquiry('${inquiry.id}')">Reply</button>
                <button class="btn btn-danger" onclick="deleteInquiry('${inquiry.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Show/hide sections
window.showSection = function(sectionId) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${sectionId}-section`).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[href="#${sectionId}"]`).parentElement.classList.add('active');
}

// Handle add apartment form
async function handleAddApartment(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const apartmentData = {
        title: formData.get('title'),
        price: parseInt(formData.get('price')),
        bedrooms: parseInt(formData.get('bedrooms')),
        bathrooms: parseInt(formData.get('bathrooms')),
        address: formData.get('address'),
        description: formData.get('description'),
        features: formData.get('features').split(',').map(f => f.trim()),
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid
    };
    
    try {
        await addDoc(collection(db, 'apartments'), apartmentData);
        showNotification('Apartment added successfully!', 'success');
        closeAddApartmentModal();
        await loadApartments();
        updateDashboardStats();
    } catch (error) {
        console.error('Error adding apartment:', error);
        showNotification('Error adding apartment', 'error');
    }
}

// Modal functions
window.showAddApartmentModal = function() {
    document.getElementById('add-apartment-modal').classList.add('show');
}

window.closeAddApartmentModal = function() {
    document.getElementById('add-apartment-modal').classList.remove('show');
    document.getElementById('apartment-form').reset();
}

// Profile dropdown
window.toggleProfileMenu = function() {
    const menu = document.getElementById('profile-menu');
    menu.classList.toggle('show');
}

// Admin actions
window.signOut = async function() {
    try {
        await signOut(auth);
        window.location.href = 'auth.html';
    } catch (error) {
        console.error('Error signing out:', error);
        showNotification('Error signing out', 'error');
    }
}

window.viewProfile = function() {
    showNotification('Profile view coming soon!', 'info');
}

window.changePassword = function() {
    showNotification('Password change coming soon!', 'info');
}

// User management functions
window.editUser = function(userId) {
    showNotification('User editing coming soon!', 'info');
}

window.deleteUser = async function(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            await deleteDoc(doc(db, 'users', userId));
            showNotification('User deleted successfully!', 'success');
            await loadUsers();
            updateDashboardStats();
        } catch (error) {
            console.error('Error deleting user:', error);
            showNotification('Error deleting user', 'error');
        }
    }
}

// Apartment management functions
window.editApartment = function(apartmentId) {
    showNotification('Apartment editing coming soon!', 'info');
}

window.deleteApartment = async function(apartmentId) {
    if (confirm('Are you sure you want to delete this apartment?')) {
        try {
            await deleteDoc(doc(db, 'apartments', apartmentId));
            showNotification('Apartment deleted successfully!', 'success');
            await loadApartments();
            updateDashboardStats();
        } catch (error) {
            console.error('Error deleting apartment:', error);
            showNotification('Error deleting apartment', 'error');
        }
    }
}

// Inquiry management functions
window.markAsRead = async function(inquiryId) {
    try {
        await updateDoc(doc(db, 'inquiries', inquiryId), {
            read: true,
            readAt: serverTimestamp()
        });
        showNotification('Inquiry marked as read!', 'success');
        await loadInquiries();
        updateDashboardStats();
    } catch (error) {
        console.error('Error marking inquiry as read:', error);
        showNotification('Error updating inquiry', 'error');
    }
}

window.replyToInquiry = function(inquiryId) {
    showNotification('Reply feature coming soon!', 'info');
}

window.deleteInquiry = async function(inquiryId) {
    if (confirm('Are you sure you want to delete this inquiry?')) {
        try {
            await deleteDoc(doc(db, 'inquiries', inquiryId));
            showNotification('Inquiry deleted successfully!', 'success');
            await loadInquiries();
            updateDashboardStats();
        } catch (error) {
            console.error('Error deleting inquiry:', error);
            showNotification('Error deleting inquiry', 'error');
        }
    }
}

// Filter functions
window.filterUsers = function() {
    const searchTerm = document.getElementById('user-search').value.toLowerCase();
    const roleFilter = document.getElementById('user-role-filter').value;
    const statusFilter = document.getElementById('user-status-filter').value;
    
    // Filter logic would go here
    showNotification('User filtering coming soon!', 'info');
}

// Export functions
window.exportUsers = function() {
    showNotification('User export coming soon!', 'info');
}

// Refresh functions
window.refreshUsers = async function() {
    await loadUsers();
    showNotification('Users refreshed!', 'success');
}

window.refreshApartments = async function() {
    await loadApartments();
    showNotification('Apartments refreshed!', 'success');
}

window.refreshInquiries = async function() {
    await loadInquiries();
    showNotification('Inquiries refreshed!', 'success');
}

// Settings functions
window.saveGeneralSettings = function() {
    showNotification('Settings saved!', 'success');
}

window.saveEmailSettings = function() {
    showNotification('Email settings saved!', 'success');
}

window.markAllAsRead = async function() {
    try {
        const unreadInquiries = allInquiries.filter(inquiry => !inquiry.read);
        const updatePromises = unreadInquiries.map(inquiry => 
            updateDoc(doc(db, 'inquiries', inquiry.id), {
                read: true,
                readAt: serverTimestamp()
            })
        );
        
        await Promise.all(updatePromises);
        showNotification('All inquiries marked as read!', 'success');
        await loadInquiries();
        updateDashboardStats();
    } catch (error) {
        console.error('Error marking all as read:', error);
        showNotification('Error updating inquiries', 'error');
    }
}

// Utility functions
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    
    let date;
    if (timestamp.toDate) {
        date = timestamp.toDate();
    } else {
        date = new Date(timestamp);
    }
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function showLoadingOverlay(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

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

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('add-apartment-modal');
    if (event.target === modal) {
        closeAddApartmentModal();
    }
    
    const profileMenu = document.getElementById('profile-menu');
    if (!event.target.closest('.profile-dropdown')) {
        profileMenu.classList.remove('show');
    }
});