/**
 * Neulify Appointment Booking Widget
 * Embeddable appointment form for external websites
 */

(function() {
    'use strict';

    // Widget configuration
    var defaultConfig = {
        containerId: 'neulify-appointment-widget',
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
            <div class="neulify-widget neulify-widget-${config.theme}">
                <div class="neulify-widget-card">
                    <div class="neulify-widget-header">
                        <h2 class="neulify-widget-title">${config.customTitle}</h2>
                        <p class="neulify-widget-subtitle">${config.customSubtitle}</p>
                    </div>
                    <div class="neulify-widget-content">
                        <form class="neulify-widget-form" onsubmit="window.NeulifyAppointmentWidget.handleSubmit(event)">
                            <!-- Patient Information -->
                            <div class="neulify-widget-section">
                                <h3 class="neulify-widget-section-title">Patient Information</h3>
                                
                                <div class="neulify-widget-grid">
                                    <div class="neulify-widget-field">
                                        <label class="neulify-widget-label">Full Name *</label>
                                        <input 
                                            type="text" 
                                            class="neulify-widget-input ${widgetState.errors.patient_name ? 'neulify-widget-error' : ''}"
                                            value="${widgetState.formData.patient_name}"
                                            onchange="window.NeulifyAppointmentWidget.handleInputChange('patient_name', this.value)"
                                            placeholder="Enter your full name"
                                            maxlength="255"
                                        />
                                        ${widgetState.errors.patient_name ? `<p class="neulify-widget-error-text">${widgetState.errors.patient_name}</p>` : ''}
                                    </div>

                                    <div class="neulify-widget-field">
                                        <label class="neulify-widget-label">Phone Number *</label>
                                        <input 
                                            type="tel" 
                                            class="neulify-widget-input ${widgetState.errors.patient_phone ? 'neulify-widget-error' : ''}"
                                            value="${widgetState.formData.patient_phone}"
                                            onchange="window.NeulifyAppointmentWidget.handleInputChange('patient_phone', this.value)"
                                            placeholder="Enter your phone number"
                                            maxlength="20"
                                        />
                                        ${widgetState.errors.patient_phone ? `<p class="neulify-widget-error-text">${widgetState.errors.patient_phone}</p>` : ''}
                                    </div>
                                </div>

                                <div class="neulify-widget-field">
                                    <label class="neulify-widget-label">Email Address *</label>
                                    <input 
                                        type="email" 
                                        class="neulify-widget-input ${widgetState.errors.patient_email ? 'neulify-widget-error' : ''}"
                                        value="${widgetState.formData.patient_email}"
                                        onchange="window.NeulifyAppointmentWidget.handleInputChange('patient_email', this.value)"
                                        placeholder="Enter your email address"
                                        maxlength="255"
                                    />
                                    ${widgetState.errors.patient_email ? `<p class="neulify-widget-error-text">${widgetState.errors.patient_email}</p>` : ''}
                                </div>
                            </div>

                            <!-- Appointment Details -->
                            <div class="neulify-widget-section">
                                <h3 class="neulify-widget-section-title">Appointment Details</h3>
                                
                                <div class="neulify-widget-grid">
                                    <div class="neulify-widget-field">
                                        <label class="neulify-widget-label">Preferred Date *</label>
                                        <input 
                                            type="date" 
                                            class="neulify-widget-input ${widgetState.errors.appointment_date ? 'neulify-widget-error' : ''}"
                                            value="${widgetState.formData.appointment_date}"
                                            onchange="window.NeulifyAppointmentWidget.handleInputChange('appointment_date', this.value)"
                                            min="${new Date().toISOString().split('T')[0]}"
                                        />
                                        ${widgetState.errors.appointment_date ? `<p class="neulify-widget-error-text">${widgetState.errors.appointment_date}</p>` : ''}
                                    </div>

                                    <div class="neulify-widget-field">
                                        <label class="neulify-widget-label">Preferred Time *</label>
                                        <select 
                                            class="neulify-widget-select ${widgetState.errors.appointment_time ? 'neulify-widget-error' : ''}"
                                            onchange="window.NeulifyAppointmentWidget.handleInputChange('appointment_time', this.value)"
                                        >
                                            <option value="">Select time</option>
                                            ${timeSlots.map(function(time) {
                                                return `<option value="${time}" ${widgetState.formData.appointment_time === time ? 'selected' : ''}>${time}</option>`;
                                            }).join('')}
                                        </select>
                                        ${widgetState.errors.appointment_time ? `<p class="neulify-widget-error-text">${widgetState.errors.appointment_time}</p>` : ''}
                                    </div>
                                </div>
                            </div>

                            <!-- Service and Doctor Information -->
                            <div class="neulify-widget-section">
                                <h3 class="neulify-widget-section-title">Service & Doctor Information</h3>
                                
                                <div class="neulify-widget-grid">
                                    <div class="neulify-widget-field">
                                        <label class="neulify-widget-label">Service (Optional)</label>
                                        <input 
                                            type="text" 
                                            class="neulify-widget-input"
                                            value="${widgetState.formData.service_name}"
                                            onchange="window.NeulifyAppointmentWidget.handleInputChange('service_name', this.value)"
                                            placeholder="e.g., General Consultation, Dental Cleaning"
                                            maxlength="255"
                                        />
                                    </div>

                                    <div class="neulify-widget-field">
                                        <label class="neulify-widget-label">Preferred Doctor (Optional)</label>
                                        <input 
                                            type="text" 
                                            class="neulify-widget-input"
                                            value="${widgetState.formData.doctor_name}"
                                            onchange="window.NeulifyAppointmentWidget.handleInputChange('doctor_name', this.value)"
                                            placeholder="e.g., Dr. Smith, Dr. Johnson"
                                            maxlength="255"
                                        />
                                    </div>
                                </div>
                            </div>

                            <!-- Additional Information -->
                            <div class="neulify-widget-section">
                                <h3 class="neulify-widget-section-title">Additional Information</h3>
                                
                                <div class="neulify-widget-field">
                                    <label class="neulify-widget-label">Preferred Language</label>
                                    <select 
                                        class="neulify-widget-select"
                                        onchange="window.NeulifyAppointmentWidget.handleInputChange('preferred_language', this.value)"
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

                                <div class="neulify-widget-field">
                                    <label class="neulify-widget-label">Additional Notes</label>
                                    <textarea 
                                        class="neulify-widget-textarea"
                                        onchange="window.NeulifyAppointmentWidget.handleInputChange('notes', this.value)"
                                        placeholder="Any specific concerns or information you'd like us to know..."
                                        rows="3"
                                        maxlength="1000"
                                    >${widgetState.formData.notes}</textarea>
                                </div>
                            </div>

                            <!-- General Error Display -->
                            ${widgetState.errors.general ? `
                                <div class="neulify-widget-error-message">
                                    <p>${widgetState.errors.general}</p>
                                </div>
                            ` : ''}

                            <!-- Submit Button -->
                            <div class="neulify-widget-submit">
                                <button 
                                    type="submit" 
                                    class="neulify-widget-button"
                                    style="background-color: ${config.primaryColor}"
                                    ${widgetState.isSubmitting ? 'disabled' : ''}
                                >
                                    ${widgetState.isSubmitting ? 
                                        '<span class="neulify-widget-spinner"></span> Booking Appointment...' : 
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
            <div class="neulify-widget neulify-widget-${widgetState.config.theme}">
                <div class="neulify-widget-card">
                    <div class="neulify-widget-success">
                        <div class="neulify-widget-success-icon">✓</div>
                        <h3 class="neulify-widget-success-title">Appointment Booked Successfully!</h3>
                        <p class="neulify-widget-success-message">
                            Thank you for booking your appointment. We will contact you to confirm the details.
                        </p>
                        <button 
                            class="neulify-widget-button"
                            style="background-color: ${widgetState.config.primaryColor}"
                            onclick="window.NeulifyAppointmentWidget.resetForm()"
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
    window.NeulifyAppointmentWidget = {
        init: function(userConfig) {
            widgetState.config = mergeConfig(userConfig);
            widgetState.isLoaded = true;
            
            // Load CSS if not already loaded
            if (!document.getElementById('neulify-widget-styles')) {
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
        styles.id = 'neulify-widget-styles';
        styles.textContent = `
            .neulify-widget {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.5;
                color: #374151;
            }
            
            .neulify-widget-light {
                background-color: #ffffff;
                color: #374151;
            }
            
            .neulify-widget-dark {
                background-color: #1f2937;
                color: #f9fafb;
            }
            
            .neulify-widget-card {
                background: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            
            .neulify-widget-dark .neulify-widget-card {
                background: #1f2937;
                border-color: #374151;
            }
            
            .neulify-widget-header {
                background: linear-gradient(135deg, #0d9488, #0891b2);
                color: white;
                padding: 1.5rem;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .neulify-widget-title {
                font-size: 1.25rem;
                font-weight: 700;
                margin: 0 0 0.5rem 0;
                display: flex;
                align-items: center;
            }
            
            .neulify-widget-title::before {
                content: '📅';
                margin-right: 0.75rem;
                font-size: 1.5rem;
            }
            
            .neulify-widget-subtitle {
                margin: 0;
                opacity: 0.9;
                font-size: 0.875rem;
            }
            
            .neulify-widget-content {
                padding: 1.5rem;
            }
            
            .neulify-widget-section {
                margin-bottom: 1.5rem;
            }
            
            .neulify-widget-section-title {
                font-size: 1.125rem;
                font-weight: 600;
                margin: 0 0 1rem 0;
                display: flex;
                align-items: center;
            }
            
            .neulify-widget-section-title::before {
                content: '👤';
                margin-right: 0.5rem;
                font-size: 1.25rem;
            }
            
            .neulify-widget-section:nth-child(2) .neulify-widget-section-title::before {
                content: '🕐';
            }
            
            .neulify-widget-section:nth-child(3) .neulify-widget-section-title::before {
                content: '🏥';
            }
            
            .neulify-widget-section:nth-child(4) .neulify-widget-section-title::before {
                content: 'ℹ️';
            }
            
            .neulify-widget-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            @media (min-width: 768px) {
                .neulify-widget-grid {
                    grid-template-columns: 1fr 1fr;
                }
            }
            
            .neulify-widget-field {
                display: flex;
                flex-direction: column;
            }
            
            .neulify-widget-label {
                font-size: 0.875rem;
                font-weight: 500;
                margin-bottom: 0.5rem;
                color: #374151;
            }
            
            .neulify-widget-dark .neulify-widget-label {
                color: #d1d5db;
            }
            
            .neulify-widget-input,
            .neulify-widget-select,
            .neulify-widget-textarea {
                padding: 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 0.875rem;
                background-color: #ffffff;
                color: #374151;
                transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
            }
            
            .neulify-widget-dark .neulify-widget-input,
            .neulify-widget-dark .neulify-widget-select,
            .neulify-widget-dark .neulify-widget-textarea {
                background-color: #374151;
                border-color: #4b5563;
                color: #f9fafb;
            }
            
            .neulify-widget-input:focus,
            .neulify-widget-select:focus,
            .neulify-widget-textarea:focus {
                outline: none;
                border-color: #0d9488;
                box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
            }
            
            .neulify-widget-input.neulify-widget-error,
            .neulify-widget-select.neulify-widget-error,
            .neulify-widget-textarea.neulify-widget-error {
                border-color: #ef4444;
            }
            
            .neulify-widget-error-text {
                color: #ef4444;
                font-size: 0.75rem;
                margin-top: 0.25rem;
            }
            
            .neulify-widget-error-message {
                background-color: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 6px;
                padding: 1rem;
                margin-bottom: 1rem;
            }
            
            .neulify-widget-dark .neulify-widget-error-message {
                background-color: #7f1d1d;
                border-color: #991b1b;
            }
            
            .neulify-widget-error-message p {
                color: #dc2626;
                margin: 0;
                font-size: 0.875rem;
            }
            
            .neulify-widget-dark .neulify-widget-error-message p {
                color: #fca5a5;
            }
            
            .neulify-widget-submit {
                margin-top: 1.5rem;
            }
            
            .neulify-widget-button {
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
            
            .neulify-widget-button:hover:not(:disabled) {
                background-color: #0f766e;
            }
            
            .neulify-widget-button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            .neulify-widget-spinner {
                width: 1rem;
                height: 1rem;
                border: 2px solid transparent;
                border-top: 2px solid currentColor;
                border-radius: 50%;
                animation: neulify-widget-spin 1s linear infinite;
            }
            
            @keyframes neulify-widget-spin {
                to {
                    transform: rotate(360deg);
                }
            }
            
            .neulify-widget-success {
                text-align: center;
                padding: 2rem;
            }
            
            .neulify-widget-success-icon {
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
            
            .neulify-widget-success-title {
                font-size: 1.25rem;
                font-weight: 700;
                margin: 0 0 0.5rem 0;
                color: #374151;
            }
            
            .neulify-widget-dark .neulify-widget-success-title {
                color: #f9fafb;
            }
            
            .neulify-widget-success-message {
                color: #6b7280;
                margin: 0 0 1.5rem 0;
                font-size: 0.875rem;
            }
            
            .neulify-widget-dark .neulify-widget-success-message {
                color: #9ca3af;
            }
        `;
        document.head.appendChild(styles);
    }

})();
