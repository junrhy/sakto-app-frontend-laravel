# Embeddable Appointment Form

This document explains how to embed the Neulify appointment booking form on external websites.

## Overview

The embeddable appointment form allows clinics to integrate appointment booking functionality directly into their own websites or third-party platforms. The form is fully self-contained and includes all necessary styling and functionality.

## Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Customizable Theming**: Light/dark themes with custom colors
- **Real-time Validation**: Client-side form validation with error messages
- **Multi-language Support**: Built-in language selector
- **Success Handling**: Customizable success callbacks
- **Error Handling**: Comprehensive error handling with user feedback
- **CORS Enabled**: Works across different domains

## Quick Start

### 1. Basic Embed

Add this code to your website where you want the appointment form to appear:

```html
<!-- Neulify Appointment Booking Widget -->
<div id="neulify-appointment-widget"></div>
<script>
(function() {
    var script = document.createElement('script');
    script.src = 'https://your-domain.com/embed/appointment/your-clinic-id/widget.js';
    script.async = true;
    script.onload = function() {
        if (window.NeulifyAppointmentWidget) {
            window.NeulifyAppointmentWidget.init({
                containerId: 'neulify-appointment-widget',
                clinicId: 'your-clinic-id',
                apiUrl: 'https://your-domain.com/api/embed/appointment',
                theme: 'light',
                primaryColor: '#0d9488',
                showClinicInfo: false,
                customTitle: 'Book Your Appointment',
                customSubtitle: 'Fill out the form below to schedule your appointment. We will contact you to confirm.'
            });
        }
    };
    document.head.appendChild(script);
})();
</script>
<!-- End Neulify Appointment Booking Widget -->
```

### 2. Get Your Clinic ID

To get your clinic ID and generate the embed code:

1. Visit: `https://your-domain.com/embed/appointment/your-clinic-slug/script`
2. This will return JSON with your embed script and clinic information

## Configuration Options

### Required Parameters

- `containerId`: The ID of the HTML element where the form will be rendered
- `clinicId`: Your clinic's identifier (slug or ID)
- `apiUrl`: The base URL for the API endpoints

### Optional Parameters

- `theme`: `'light'` or `'dark'` (default: `'light'`)
- `primaryColor`: Hex color code for the primary color (default: `'#0d9488'`)
- `showClinicInfo`: Whether to display clinic information (default: `false`)
- `customTitle`: Custom title for the form (default: `'Book Your Appointment'`)
- `customSubtitle`: Custom subtitle for the form
- `onSuccess`: Callback function when appointment is booked successfully
- `onError`: Callback function when an error occurs

### Example with All Options

```javascript
window.NeulifyAppointmentWidget.init({
    containerId: 'neulify-appointment-widget',
    clinicId: 'your-clinic-id',
    apiUrl: 'https://your-domain.com/api/embed/appointment',
    theme: 'dark',
    primaryColor: '#3b82f6',
    showClinicInfo: true,
    customTitle: 'Schedule Your Visit',
    customSubtitle: 'Book your appointment with our medical team.',
    onSuccess: function(data) {
        console.log('Appointment booked:', data);
        // Custom success handling
        alert('Appointment booked successfully!');
    },
    onError: function(error) {
        console.error('Booking failed:', error);
        // Custom error handling
        alert('Failed to book appointment. Please try again.');
    }
});
```

## API Endpoints

### Get Clinic Information
```
GET /api/embed/appointment/clinic-info/{identifier}
```

Returns clinic information including services, doctors, and contact details.

### Book Appointment
```
POST /api/embed/appointment/book
```

Books an appointment. Required fields:
- `clinic_id`: Clinic identifier
- `patient_name`: Patient's full name
- `patient_email`: Patient's email address
- `patient_phone`: Patient's phone number
- `appointment_date`: Preferred appointment date (YYYY-MM-DD)
- `appointment_time`: Preferred appointment time (HH:MM)

Optional fields:
- `service_name`: Requested service
- `doctor_name`: Preferred doctor
- `notes`: Additional notes
- `preferred_language`: Patient's preferred language

## Styling

The widget includes its own CSS that won't conflict with your website's styles. The widget is designed to be self-contained and responsive.

### Custom Styling

If you need to customize the appearance further, you can override the CSS classes:

```css
/* Override widget styles */
.neulify-widget-card {
    border-radius: 12px !important;
    box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
}

.neulify-widget-button {
    background-color: #your-color !important;
}
```

## Events and Callbacks

### Success Callback

```javascript
onSuccess: function(data) {
    // data contains:
    // - appointment: appointment details
    // - clinic: clinic information
    // - message: success message
    
    console.log('Appointment ID:', data.appointment.id);
    console.log('Patient:', data.appointment.patient_name);
    console.log('Date:', data.appointment.appointment_date);
    console.log('Time:', data.appointment.appointment_time);
}
```

### Error Callback

```javascript
onError: function(error) {
    // error is a string describing what went wrong
    console.error('Booking error:', error);
}
```

## Advanced Usage

### Programmatic Form Control

You can interact with the form programmatically:

```javascript
// Get current form data
var formData = window.NeulifyAppointmentWidget.getFormData();

// Set form data
window.NeulifyAppointmentWidget.setFormData({
    patient_name: 'John Doe',
    patient_email: 'john@example.com'
});

// Clear form errors
window.NeulifyAppointmentWidget.clearErrors();

// Reset the form
window.NeulifyAppointmentWidget.resetForm();
```

### Multiple Forms on One Page

You can have multiple appointment forms on the same page:

```html
<div id="appointment-form-1"></div>
<div id="appointment-form-2"></div>

<script>
// Initialize first form
window.NeulifyAppointmentWidget.init({
    containerId: 'appointment-form-1',
    clinicId: 'clinic-1',
    apiUrl: 'https://your-domain.com/api/embed/appointment'
});

// Initialize second form
window.NeulifyAppointmentWidget.init({
    containerId: 'appointment-form-2',
    clinicId: 'clinic-2',
    apiUrl: 'https://your-domain.com/api/embed/appointment'
});
</script>
```

## Security Considerations

- The embed API endpoints are public and don't require authentication
- CORS is enabled to allow cross-origin requests
- All form submissions are validated server-side
- Patient data is securely stored in the backend system

## Troubleshooting

### Common Issues

1. **Widget not loading**: Check that the script URL is correct and accessible
2. **CORS errors**: Ensure the API URL is correct and CORS is properly configured
3. **Form not submitting**: Check browser console for JavaScript errors
4. **Styling conflicts**: The widget includes its own CSS, but conflicts can occur with very specific selectors

### Debug Mode

Enable debug mode by adding this to your page:

```javascript
window.NeulifyAppointmentWidget.debug = true;
```

This will log additional information to the browser console.

## Support

For technical support or questions about the embeddable appointment form, please contact your system administrator or refer to the main application documentation.

## Changelog

### Version 1.0.0
- Initial release
- Basic appointment booking functionality
- Light/dark theme support
- Customizable colors and text
- CORS support for cross-domain embedding
- Responsive design
- Multi-language support
