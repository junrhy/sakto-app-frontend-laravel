import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { FaPhone, FaEnvelope, FaWhatsapp, FaSms, FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaAddressCard } from 'react-icons/fa';
import { Button } from '@/Components/ui/button';

interface IdNumber {
    id: number;
    type: string;
    number: string;
    notes?: string;
}

interface Contact {
    id: number;
    first_name: string;
    middle_name?: string;
    last_name: string;
    gender: 'male' | 'female' | 'other';
    fathers_name?: string;
    mothers_maiden_name?: string;
    email: string;
    call_number?: string;
    sms_number?: string;
    whatsapp?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    address?: string;
    notes?: string;
    id_picture?: string;
    id_numbers?: IdNumber[];
    created_at: string;
    updated_at: string;
}

interface Props {
    contact: Contact;
}

const ContactItem = ({ icon: Icon, label, value, link, displayValue, colorClass = "" }: { 
    icon: any, 
    label: string, 
    value?: string, 
    link?: string, 
    displayValue?: string,
    colorClass?: string 
}) => {
    if (!value) return null;

    const content = (
        <div className={`flex items-center space-x-3 p-2.5 sm:p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 ${colorClass}`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <div>
                <div className="text-xs sm:text-sm text-white/70">{label}</div>
                <div className="text-xs sm:text-sm font-medium text-white">{displayValue || value}</div>
            </div>
        </div>
    );

    if (link) {
        return (
            <a href={link} target="_blank" rel="noopener noreferrer" className="block">
                {content}
            </a>
        );
    }

    return content;
};

export default function PublicProfile({ contact }: Props) {
    const fullName = [contact.first_name, contact.last_name]
        .filter(Boolean)
        .join(' ');

    const fullNameWithMiddle = [contact.first_name, contact.middle_name, contact.last_name]
        .filter(Boolean)
        .join(' ');

    const generateVCard = () => {
        const vcard = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `N:${contact.last_name};${contact.first_name};${contact.middle_name || ''};;`,
            `FN:${fullNameWithMiddle}`,
            contact.email && `EMAIL:${contact.email}`,
            contact.call_number && `TEL;TYPE=CELL:${contact.call_number}`,
            contact.sms_number && `TEL;TYPE=MSG:${contact.sms_number}`,
            contact.whatsapp && `TEL;TYPE=WHATSAPP:${contact.whatsapp}`,
            contact.address && `ADR;TYPE=HOME:;;${contact.address};;;;`,
            contact.facebook && `URL;TYPE=facebook:${contact.facebook}`,
            contact.instagram && `URL;TYPE=instagram:https://instagram.com/${contact.instagram.replace('@', '')}`,
            contact.twitter && `URL;TYPE=twitter:https://twitter.com/${contact.twitter.replace('@', '')}`,
            contact.linkedin && `URL;TYPE=linkedin:${contact.linkedin}`,
            'END:VCARD'
        ].filter(Boolean).join('\n');

        const blob = new Blob([vcard], { type: 'text/vcard' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${fullNameWithMiddle.replace(/\s+/g, '_')}.vcf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const getSimplifiedSocialValue = (platform: string, value: string) => {
        if (!value) return '';
        
        // Remove any @ symbol first
        let username = value.replace('@', '');
        
        switch (platform) {
            case 'facebook':
                // Handle facebook.com URLs
                if (username.includes('facebook.com/')) {
                    username = username.split('facebook.com/').pop() || '';
                }
                // Remove trailing slashes and query parameters
                username = username.split('/')[0].split('?')[0];
                return username;
                
            case 'instagram':
                // Handle instagram.com URLs
                if (username.includes('instagram.com/')) {
                    username = username.split('instagram.com/').pop() || '';
                }
                // Remove trailing slashes and query parameters
                username = username.split('/')[0].split('?')[0];
                return `@${username}`;
                
            case 'twitter':
                // Handle twitter.com URLs
                if (username.includes('twitter.com/')) {
                    username = username.split('twitter.com/').pop() || '';
                }
                // Remove trailing slashes and query parameters
                username = username.split('/')[0].split('?')[0];
                return `@${username}`;
                
            case 'linkedin':
                // Handle linkedin.com URLs
                if (username.includes('linkedin.com/')) {
                    username = username.split('/in/').pop() || // Handle /in/ profiles
                              username.split('linkedin.com/').pop() || '';
                }
                // Remove trailing slashes and query parameters
                username = username.split('/')[0].split('?')[0];
                return username;
                
            default:
                return username;
        }
    };

    const getSocialLink = (platform: string, value: string) => {
        if (!value) return '';
        
        switch (platform) {
            case 'facebook':
                return value.startsWith('http') ? value : `https://facebook.com/${value}`;
            case 'instagram':
                return `https://instagram.com/${value.replace('@', '')}`;
            case 'twitter':
                return `https://twitter.com/${value.replace('@', '')}`;
            case 'linkedin':
                return value.startsWith('http') ? value : `https://linkedin.com/in/${value}`;
            default:
                return value;
        }
    };

    return (
        <GuestLayout>
            <Head title={`${fullName} - Profile`} />

            <div className="min-h-screen py-6 sm:py-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="w-full max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="backdrop-blur-xl bg-white/10 overflow-hidden shadow-2xl rounded-xl sm:rounded-2xl border border-white/10">
                        <div className="relative p-4 sm:p-8">
                            {/* Background decorative elements */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />
                            
                            {/* Profile Header */}
                            <div className="relative flex flex-col items-center text-center mb-6 sm:mb-8">
                                {contact.id_picture ? (
                                    <img 
                                        src={contact.id_picture} 
                                        alt={`${contact.first_name}'s ID`}
                                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-full ring-4 ring-white/20 shadow-xl"
                                    />
                                ) : (
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-4 ring-white/20 shadow-xl">
                                        <span className="text-xl sm:text-2xl font-bold text-white">
                                            {contact.first_name[0]}{contact.last_name[0]}
                                        </span>
                                    </div>
                                )}
                                <h1 className="mt-4 text-xl sm:text-2xl font-bold text-white">
                                    {fullName}
                                </h1>
                                {contact.address && (
                                    <p className="mt-1 text-xs sm:text-sm text-white/70 px-4">
                                        {contact.address}
                                    </p>
                                )}
                                <Button
                                    onClick={generateVCard}
                                    className="mt-4 inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs sm:text-sm py-2 h-auto"
                                    variant="outline"
                                >
                                    <FaAddressCard className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>Save Contact</span>
                                </Button>
                            </div>

                            {/* Contact Information */}
                            <div className="relative space-y-1.5 sm:space-y-2">
                                <ContactItem 
                                    icon={FaEnvelope} 
                                    label="Email" 
                                    value={contact.email}
                                    link={`mailto:${contact.email}`}
                                    colorClass="bg-blue-500/20"
                                />
                                <ContactItem 
                                    icon={FaPhone} 
                                    label="Call" 
                                    value={contact.call_number}
                                    link={`tel:${contact.call_number}`}
                                    displayValue={contact.call_number?.replace(/^(\+\d{1,3})?(\d{3})(\d{3})(\d{4})$/, '$1 $2 $3 $4')}
                                    colorClass="bg-green-500/20"
                                />
                                <ContactItem 
                                    icon={FaSms} 
                                    label="SMS" 
                                    value={contact.sms_number}
                                    link={`sms:${contact.sms_number}`}
                                    displayValue={contact.sms_number?.replace(/^(\+\d{1,3})?(\d{3})(\d{3})(\d{4})$/, '$1 $2 $3 $4')}
                                    colorClass="bg-yellow-500/20"
                                />
                                <ContactItem 
                                    icon={FaWhatsapp} 
                                    label="WhatsApp" 
                                    value={contact.whatsapp}
                                    link={`https://wa.me/${contact.whatsapp?.replace(/[^0-9]/g, '')}`}
                                    displayValue={contact.whatsapp?.replace(/^(\+\d{1,3})?(\d{3})(\d{3})(\d{4})$/, '$1 $2 $3 $4')}
                                    colorClass="bg-green-600/20"
                                />
                            </div>

                            {/* Social Media */}
                            {(contact.facebook || contact.instagram || contact.twitter || contact.linkedin) && (
                                <div className="relative mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                                        {contact.facebook && (
                                            <ContactItem 
                                                icon={FaFacebook} 
                                                label="Facebook" 
                                                value={contact.facebook}
                                                link={getSocialLink('facebook', contact.facebook)}
                                                displayValue={getSimplifiedSocialValue('facebook', contact.facebook)}
                                                colorClass="bg-blue-600/20"
                                            />
                                        )}
                                        {contact.instagram && (
                                            <ContactItem 
                                                icon={FaInstagram} 
                                                label="Instagram" 
                                                value={contact.instagram}
                                                link={getSocialLink('instagram', contact.instagram)}
                                                displayValue={getSimplifiedSocialValue('instagram', contact.instagram)}
                                                colorClass="bg-pink-600/20"
                                            />
                                        )}
                                        {contact.twitter && (
                                            <ContactItem 
                                                icon={FaTwitter} 
                                                label="Twitter" 
                                                value={contact.twitter}
                                                link={getSocialLink('twitter', contact.twitter)}
                                                displayValue={getSimplifiedSocialValue('twitter', contact.twitter)}
                                                colorClass="bg-blue-400/20"
                                            />
                                        )}
                                        {contact.linkedin && (
                                            <ContactItem 
                                                icon={FaLinkedin} 
                                                label="LinkedIn" 
                                                value={contact.linkedin}
                                                link={getSocialLink('linkedin', contact.linkedin)}
                                                displayValue={getSimplifiedSocialValue('linkedin', contact.linkedin)}
                                                colorClass="bg-blue-700/20"
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
} 