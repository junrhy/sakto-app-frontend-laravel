/**
 * Sakto Appointment Booking Widget
 * Embeddable appointment form for external websites
 */

(function() {
    'use strict';

    // Widget configuration
    var defaultConfig = {
        containerId: 'sakto-appointment-widget',
        clinicId: null,
        apiUrl: '/api/embed/appointment',
        theme: 'light',
        primaryColor: '#0d9488',
        showClinicInfo: false,
        customTitle: 'Book Your Appointment',
        customSubtitle: 'Fill out the form below to schedule your appointment. We will contact you to confirm.',
        onSuccess: null,
        onError: null
    };

    // Widget state
    var widgetState = {
        config: {},
        isLoaded: false,
        formData: {
            patient_name: '',
            patient_email: '',
            patient_phone: '',
            appointment_date: '',
            appointment_time: '',
            service_name: '',
            doctor_name: '',
            notes: '',
            preferred_language: 'English'
        },
        errors: {},
        isSubmitting: false,
        isSuccess: false
    };

    // Utility functions
    function mergeConfig(userConfig) {
        var config = {};
        for (var key in defaultConfig) {
            config[key] = userConfig[key] !== undefined ? userConfig[key] : defaultConfig[key];
        }
        return config;
    }

    function createElement(tag, className, textContent) {
        var element = document.createElement(tag);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
    }

    function formatTime(timeString) {
        var parts = timeString.split(':');
        var hour = parseInt(parts[0]);
        var minute = parts[1];
        var ampm = hour >= 12 ? 'PM' : 'AM';
        var displayHour = hour % 12 || 12;
        return displayHour + ':' + minute + ' ' + ampm;
    }

    function formatDate(dateString) {
        var date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Form validation
    function validateForm() {
        var errors = {};
        var formData = widgetState.formData;

        if (!formData.patient_name.trim()) {
            errors.patient_name = 'Patient name is required';
        }

        if (!formData.patient_email.trim()) {
            errors.patient_email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.patient_email)) {
            errors.patient_email = 'Please enter a valid email address';
        }

        if (!formData.patient_phone.trim()) {
            errors.patient_phone = 'Phone number is required';
        }

        if (!formData.appointment_date) {
            errors.appointment_date = 'Appointment date is required';
        } else {
            var selectedDate = new Date(formData.appointment_date);
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate <= today) {
                errors.appointment_date = 'Appointment date must be in the future';
            }
        }

        if (!formData.appointment_time) {
            errors.appointment_time = 'Appointment time is required';
        }

        widgetState.errors = errors;
        return Object.keys(errors).length === 0;
    }

    // Generate time slots
    function generateTimeSlots() {
        var slots = [];
        for (var hour = 9; hour < 17; hour++) {
            for (var minute = 0; minute < 60; minute += 30) {
                var timeString = hour.toString().padStart(2, '0') + ':' + minute.toString().padStart(2, '0');
                slots.push(timeString);
            }
        }
        return slots;
    }

    // Form submission
    function handleSubmit(event) {
        event.preventDefault();
        
        if (!validateForm()) {
            renderForm();
            return;
        }

        widgetState.isSubmitting = true;
        renderForm();

        var xhr = new XMLHttpRequest();
        xhr.open('POST', widgetState.config.apiUrl + '/book', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Accept', 'application/json');

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                widgetState.isSubmitting = false;
                
                if (xhr.status === 200) {
                    var response = JSON.parse(xhr.responseText);
                    widgetState.isSuccess = true;
                    if (widgetState.config.onSuccess) {
                        widgetState.config.onSuccess(response);
                    }
                } else {
                    var response = JSON.parse(xhr.responseText);
                    widgetState.errors.general = response.error || 'Failed to book appointment. Please try again.';
                    if (widgetState.config.onError) {
                        widgetState.config.onError(response.error || 'Failed to book appointment');
                    }
                }
                renderForm();
            }
        };

        var requestData = Object.assign({}, widgetState.formData, {
            clinic_id: widgetState.config.clinicId
        });

        xhr.send(JSON.stringify(requestData));
    }

    // Input change handler
    function handleInputChange(field, value) {
        widgetState.formData[field] = value;
        if (widgetState.errors[field]) {
            delete widgetState.errors[field];
        }
        renderForm();
    }

    // Render form
    function renderForm() {
        var container = document.getElementById(widgetState.config.containerId);
        if (!container) return;

        if (widgetState.isSuccess) {
            renderSuccessMessage(container);
            return;
        }

        var timeSlots = generateTimeSlots();
        var config = widgetState.config;

        container.innerHTML = `
            <div class="sakto-widget sakto-widget-${config.theme}">
                <div class="sakto-widget-card">
                    <div class="sakto-widget-header">
                        <h2 class="sakto-widget-title">${config.customTitle}</h2>
                        <p class="sakto-widget-subtitle">${config.customSubtitle}</p>
                    </div>
                    <div class="sakto-widget-content">
                        <form class="sakto-widget-form" onsubmit="window.SaktoAppointmentWidget.handleSubmit(event)">
                            <!-- Patient Information -->
                            <div class="sakto-widget-section">
                                <h3 class="sakto-widget-section-title">Patient Information</h3>
                                
                                <div class="sakto-widget-grid">
                                    <div class="sakto-widget-field">
                                        <label class="sakto-widget-label">Full Name *</label>
                                        <input 
                                            type="text" 
                                            class="sakto-widget-input ${widgetState.errors.patient_name ? 'sakto-widget-error' : ''}"
                                            value="${widgetState.formData.patient_name}"
                                            onchange="window.SaktoAppointmentWidget.handleInputChange('patient_name', this.value)"
                                            placeholder="Enter your full name"
                                            maxlength="255"
                                        />
                                        ${widgetState.errors.patient_name ? `<p class="sakto-widget-error-text">${widgetState.errors.patient_name}</p>` : ''}
                                    </div>

                                    <div class="sakto-widget-field">
                                        <label class="sakto-widget-label">Phone Number *</label>
                                        <input 
                                            type="tel" 
                                            class="sakto-widget-input ${widgetState.errors.patient_phone ? 'sakto-widget-error' : ''}"
                                            value="${widgetState.formData.patient_phone}"
                                            onchange="window.SaktoAppointmentWidget.handleInputChange('patient_phone', this.value)"
                                            placeholder="Enter your phone number"
                                            maxlength="20"
                                        />
                                        ${widgetState.errors.patient_phone ? `<p class="sakto-widget-error-text">${widgetState.errors.patient_phone}</p>` : ''}
                                    </div>
                                </div>

                                <div class="sakto-widget-field">
                                    <label class="sakto-widget-label">Email Address *</label>
                                    <input 
                                        type="email" 
                                        class="sakto-widget-input ${widgetState.errors.patient_email ? 'sakto-widget-error' : ''}"
                                        value="${widgetState.formData.patient_email}"
                                        onchange="window.SaktoAppointmentWidget.handleInputChange('patient_email', this.value)"
                                        placeholder="Enter your email address"
                                        maxlength="255"
                                    />
                                    ${widgetState.errors.patient_email ? `<p class="sakto-widget-error-text">${widgetState.errors.patient_email}</p>` : ''}
                                </div>
                            </div>

                            <!-- Appointment Details -->
                            <div class="sakto-widget-section">
                                <h3 class="sakto-widget-section-title">Appointment Details</h3>
                                
                                <div class="sakto-widget-grid">
                                    <div class="sakto-widget-field">
                                        <label class="sakto-widget-label">Preferred Date *</label>
                                        <input 
                                            type="date" 
                                            class="sakto-widget-input ${widgetState.errors.appointment_date ? 'sakto-widget-error' : ''}"
                                            value="${widgetState.formData.appointment_date}"
                                            onchange="window.SaktoAppointmentWidget.handleInputChange('appointment_date', this.value)"
                                            min="${new Date().toISOString().split('T')[0]}"
                                        />
                                        ${widgetState.errors.appointment_date ? `<p class="sakto-widget-error-text">${widgetState.errors.appointment_date}</p>` : ''}
                                    </div>

                                    <div class="sakto-widget-field">
                                        <label class="sakto-widget-label">Preferred Time *</label>
                                        <select 
                                            class="sakto-widget-select ${widgetState.errors.appointment_time ? 'sakto-widget-error' : ''}"
                                            onchange="window.SaktoAppointmentWidget.handleInputChange('appointment_time', this.value)"
                                        >
                                            <option value="">Select time</option>
                                            ${timeSlots.map(function(time) {
                                                return `<option value="${time}" ${widgetState.formData.appointment_time === time ? 'selected' : ''}>${time}</option>`;
                                            }).join('')}
                                        </select>
                                        ${widgetState.errors.appointment_time ? `<p class="sakto-widget-error-text">${widgetState.errors.appointment_time}</p>` : ''}
                                    </div>
                                </div>
                            </div>

                            <!-- Service and Doctor Information -->
                            <div class="sakto-widget-section">
                                <h3 class="sakto-widget-section-title">Service & Doctor Information</h3>
                                
                                <div class="sakto-widget-grid">
                                    <div class="sakto-widget-field">
                                        <label class="sakto-widget-label">Service (Optional)</label>
                                        <input 
                                            type="text" 
                                            class="sakto-widget-input"
                                            value="${widgetState.formData.service_name}"
                                            onchange="window.SaktoAppointmentWidget.handleInputChange('service_name', this.value)"
                                            placeholder="e.g., General Consultation, Dental Cleaning"
                                            maxlength="255"
                                        />
                                    </div>

                                    <div class="sakto-widget-field">
                                        <label class="sakto-widget-label">Preferred Doctor (Optional)</label>
                                        <input 
                                            type="text" 
                                            class="sakto-widget-input"
                                            value="${widgetState.formData.doctor_name}"
                                            onchange="window.SaktoAppointmentWidget.handleInputChange('doctor_name', this.value)"
                                            placeholder="e.g., Dr. Smith, Dr. Johnson"
                                            maxlength="255"
                                        />
                                    </div>
                                </div>
                            </div>

                            <!-- Additional Information -->
                            <div class="sakto-widget-section">
                                <h3 class="sakto-widget-section-title">Additional Information</h3>
                                
                                <div class="sakto-widget-field">
                                    <label class="sakto-widget-label">Preferred Language</label>
                                    <select 
                                        class="sakto-widget-select"
                                        onchange="window.SaktoAppointmentWidget.handleInputChange('preferred_language', this.value)"
                                    >
                                        <option value="English" ${widgetState.formData.preferred_language === 'English' ? 'selected' : ''}>English</option>
                                        <option value="Spanish" ${widgetState.formData.preferred_language === 'Spanish' ? 'selected' : ''}>Spanish</option>
                                        <option value="French" ${widgetState.formData.preferred_language === 'French' ? 'selected' : ''}>French</option>
                                        <option value="German" ${widgetState.formData.preferred_language === 'German' ? 'selected' : ''}>German</option>
                                        <option value="Chinese" ${widgetState.formData.preferred_language === 'Chinese' ? 'selected' : ''}>Chinese</option>
                                        <option value="Japanese" ${widgetState.formData.preferred_language === 'Japanese' ? 'selected' : ''}>Japanese</option>
                                        <option value="Korean" ${widgetState.formData.preferred_language === 'Korean' ? 'selected' : ''}>Korean</option>
                                        <option value="Arabic" ${widgetState.formData.preferred_language === 'Arabic' ? 'selected' : ''}>Arabic</option>
                                        <option value="Portuguese" ${widgetState.formData.preferred_language === 'Portuguese' ? 'selected' : ''}>Portuguese</option>
                                        <option value="Russian" ${widgetState.formData.preferred_language === 'Russian' ? 'selected' : ''}>Russian</option>
                                    </select>
                                </div>

                                <div class="sakto-widget-field">
                                    <label class="sakto-widget-label">Additional Notes</label>
                                    <textarea 
                                        class="sakto-widget-textarea"
                                        onchange="window.SaktoAppointmentWidget.handleInputChange('notes', this.value)"
                                        placeholder="Any specific concerns or information you'd like us to know..."
                                        rows="3"
                                        maxlength="1000"
                                    >${widgetState.formData.notes}</textarea>
                                </div>
                            </div>

                            <!-- General Error Display -->
                            ${widgetState.errors.general ? `
                                <div class="sakto-widget-error-message">
                                    <p>${widgetState.errors.general}</p>
                                </div>
                            ` : ''}

                            <!-- Submit Button -->
                            <div class="sakto-widget-submit">
                                <button 
                                    type="submit" 
                                    class="sakto-widget-button"
                                    style="background-color: ${config.primaryColor}"
                                    ${widgetState.isSubmitting ? 'disabled' : ''}
                                >
                                    ${widgetState.isSubmitting ? 
                                        '<span class="sakto-widget-spinner"></span> Booking Appointment...' : 
                                        'Book Appointment'
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    // Render success message
    function renderSuccessMessage(container) {
        container.innerHTML = `
            <div class="sakto-widget sakto-widget-${widgetState.config.theme}">
                <div class="sakto-widget-card">
                    <div class="sakto-widget-success">
                        <div class="sakto-widget-success-icon">✓</div>
                        <h3 class="sakto-widget-success-title">Appointment Booked Successfully!</h3>
                        <p class="sakto-widget-success-message">
                            Thank you for booking your appointment. We will contact you to confirm the details.
                        </p>
                        <button 
                            class="sakto-widget-button"
                            style="background-color: ${widgetState.config.primaryColor}"
                            onclick="window.SaktoAppointmentWidget.resetForm()"
                        >
                            Book Another Appointment
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Reset form
    function resetForm() {
        widgetState.formData = {
            patient_name: '',
            patient_email: '',
            patient_phone: '',
            appointment_date: '',
            appointment_time: '',
            service_name: '',
            doctor_name: '',
            notes: '',
            preferred_language: 'English'
        };
        widgetState.errors = {};
        widgetState.isSuccess = false;
        widgetState.isSubmitting = false;
        renderForm();
    }

    // Public API
    window.SaktoAppointmentWidget = {
        init: function(userConfig) {
            widgetState.config = mergeConfig(userConfig);
            widgetState.isLoaded = true;
            
            // Load CSS if not already loaded
            if (!document.getElementById('sakto-widget-styles')) {
                loadStyles();
            }
            
            renderForm();
        },
        
        handleSubmit: handleSubmit,
        handleInputChange: handleInputChange,
        resetForm: resetForm,
        
        // Public methods for external access
        getFormData: function() {
            return widgetState.formData;
        },
        
        setFormData: function(data) {
            widgetState.formData = Object.assign(widgetState.formData, data);
            renderForm();
        },
        
        getErrors: function() {
            return widgetState.errors;
        },
        
        clearErrors: function() {
            widgetState.errors = {};
            renderForm();
        }
    };

    // Load CSS styles
    function loadStyles() {
        var styles = document.createElement('style');
        styles.id = 'sakto-widget-styles';
        styles.textContent = `
            .sakto-widget {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.5;
                color: #374151;
            }
            
            .sakto-widget-light {
                background-color: #ffffff;
                color: #374151;
            }
            
            .sakto-widget-dark {
                background-color: #1f2937;
                color: #f9fafb;
            }
            
            .sakto-widget-card {
                background: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            
            .sakto-widget-dark .sakto-widget-card {
                background: #1f2937;
                border-color: #374151;
            }
            
            .sakto-widget-header {
                background: linear-gradient(135deg, #0d9488, #0891b2);
                color: white;
                padding: 1.5rem;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .sakto-widget-title {
                font-size: 1.25rem;
                font-weight: 700;
                margin: 0 0 0.5rem 0;
                display: flex;
                align-items: center;
            }
            
            .sakto-widget-title::before {
                content: '📅';
                margin-right: 0.75rem;
                font-size: 1.5rem;
            }
            
            .sakto-widget-subtitle {
                margin: 0;
                opacity: 0.9;
                font-size: 0.875rem;
            }
            
            .sakto-widget-content {
                padding: 1.5rem;
            }
            
            .sakto-widget-section {
                margin-bottom: 1.5rem;
            }
            
            .sakto-widget-section-title {
                font-size: 1.125rem;
                font-weight: 600;
                margin: 0 0 1rem 0;
                display: flex;
                align-items: center;
            }
            
            .sakto-widget-section-title::before {
                content: '👤';
                margin-right: 0.5rem;
                font-size: 1.25rem;
            }
            
            .sakto-widget-section:nth-child(2) .sakto-widget-section-title::before {
                content: '🕐';
            }
            
            .sakto-widget-section:nth-child(3) .sakto-widget-section-title::before {
                content: '🏥';
            }
            
            .sakto-widget-section:nth-child(4) .sakto-widget-section-title::before {
                content: 'ℹ️';
            }
            
            .sakto-widget-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            @media (min-width: 768px) {
                .sakto-widget-grid {
                    grid-template-columns: 1fr 1fr;
                }
            }
            
            .sakto-widget-field {
                display: flex;
                flex-direction: column;
            }
            
            .sakto-widget-label {
                font-size: 0.875rem;
                font-weight: 500;
                margin-bottom: 0.5rem;
                color: #374151;
            }
            
            .sakto-widget-dark .sakto-widget-label {
                color: #d1d5db;
            }
            
            .sakto-widget-input,
            .sakto-widget-select,
            .sakto-widget-textarea {
                padding: 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 0.875rem;
                background-color: #ffffff;
                color: #374151;
                transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
            }
            
            .sakto-widget-dark .sakto-widget-input,
            .sakto-widget-dark .sakto-widget-select,
            .sakto-widget-dark .sakto-widget-textarea {
                background-color: #374151;
                border-color: #4b5563;
                color: #f9fafb;
            }
            
            .sakto-widget-input:focus,
            .sakto-widget-select:focus,
            .sakto-widget-textarea:focus {
                outline: none;
                border-color: #0d9488;
                box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
            }
            
            .sakto-widget-input.sakto-widget-error,
            .sakto-widget-select.sakto-widget-error,
            .sakto-widget-textarea.sakto-widget-error {
                border-color: #ef4444;
            }
            
            .sakto-widget-error-text {
                color: #ef4444;
                font-size: 0.75rem;
                margin-top: 0.25rem;
            }
            
            .sakto-widget-error-message {
                background-color: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 6px;
                padding: 1rem;
                margin-bottom: 1rem;
            }
            
            .sakto-widget-dark .sakto-widget-error-message {
                background-color: #7f1d1d;
                border-color: #991b1b;
            }
            
            .sakto-widget-error-message p {
                color: #dc2626;
                margin: 0;
                font-size: 0.875rem;
            }
            
            .sakto-widget-dark .sakto-widget-error-message p {
                color: #fca5a5;
            }
            
            .sakto-widget-submit {
                margin-top: 1.5rem;
            }
            
            .sakto-widget-button {
                width: 100%;
                padding: 0.875rem 1.5rem;
                background-color: #0d9488;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 0.875rem;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.15s ease-in-out;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }
            
            .sakto-widget-button:hover:not(:disabled) {
                background-color: #0f766e;
            }
            
            .sakto-widget-button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            .sakto-widget-spinner {
                width: 1rem;
                height: 1rem;
                border: 2px solid transparent;
                border-top: 2px solid currentColor;
                border-radius: 50%;
                animation: sakto-widget-spin 1s linear infinite;
            }
            
            @keyframes sakto-widget-spin {
                to {
                    transform: rotate(360deg);
                }
            }
            
            .sakto-widget-success {
                text-align: center;
                padding: 2rem;
            }
            
            .sakto-widget-success-icon {
                width: 4rem;
                height: 4rem;
                background-color: #10b981;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                font-weight: bold;
                margin: 0 auto 1rem;
            }
            
            .sakto-widget-success-title {
                font-size: 1.25rem;
                font-weight: 700;
                margin: 0 0 0.5rem 0;
                color: #374151;
            }
            
            .sakto-widget-dark .sakto-widget-success-title {
                color: #f9fafb;
            }
            
            .sakto-widget-success-message {
                color: #6b7280;
                margin: 0 0 1.5rem 0;
                font-size: 0.875rem;
            }
            
            .sakto-widget-dark .sakto-widget-success-message {
                color: #9ca3af;
            }
        `;
        document.head.appendChild(styles);
    }

})();
