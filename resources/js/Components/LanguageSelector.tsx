import React from 'react';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';

interface LanguageSelectorProps {
    value?: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    className?: string;
    required?: boolean;
    disabled?: boolean;
}

// Comprehensive list of languages with their native names
const LANGUAGES = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'de', name: 'German', native: 'Deutsch' },
    { code: 'it', name: 'Italian', native: 'Italiano' },
    { code: 'pt', name: 'Portuguese', native: 'Português' },
    { code: 'ru', name: 'Russian', native: 'Русский' },
    { code: 'ja', name: 'Japanese', native: '日本語' },
    { code: 'ko', name: 'Korean', native: '한국어' },
    { code: 'zh', name: 'Chinese (Simplified)', native: '中文 (简体)' },
    { code: 'zh-tw', name: 'Chinese (Traditional)', native: '中文 (繁體)' },
    { code: 'ar', name: 'Arabic', native: 'العربية' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'th', name: 'Thai', native: 'ไทย' },
    { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
    { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
    { code: 'ms', name: 'Malay', native: 'Bahasa Melayu' },
    { code: 'tl', name: 'Filipino', native: 'Filipino' },
    { code: 'nl', name: 'Dutch', native: 'Nederlands' },
    { code: 'sv', name: 'Swedish', native: 'Svenska' },
    { code: 'no', name: 'Norwegian', native: 'Norsk' },
    { code: 'da', name: 'Danish', native: 'Dansk' },
    { code: 'fi', name: 'Finnish', native: 'Suomi' },
    { code: 'pl', name: 'Polish', native: 'Polski' },
    { code: 'cs', name: 'Czech', native: 'Čeština' },
    { code: 'hu', name: 'Hungarian', native: 'Magyar' },
    { code: 'ro', name: 'Romanian', native: 'Română' },
    { code: 'bg', name: 'Bulgarian', native: 'Български' },
    { code: 'hr', name: 'Croatian', native: 'Hrvatski' },
    { code: 'sk', name: 'Slovak', native: 'Slovenčina' },
    { code: 'sl', name: 'Slovenian', native: 'Slovenščina' },
    { code: 'et', name: 'Estonian', native: 'Eesti' },
    { code: 'lv', name: 'Latvian', native: 'Latviešu' },
    { code: 'lt', name: 'Lithuanian', native: 'Lietuvių' },
    { code: 'el', name: 'Greek', native: 'Ελληνικά' },
    { code: 'tr', name: 'Turkish', native: 'Türkçe' },
    { code: 'he', name: 'Hebrew', native: 'עברית' },
    { code: 'fa', name: 'Persian', native: 'فارسی' },
    { code: 'ur', name: 'Urdu', native: 'اردو' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'ne', name: 'Nepali', native: 'नेपाली' },
    { code: 'si', name: 'Sinhala', native: 'සිංහල' },
    { code: 'my', name: 'Burmese', native: 'မြန်မာ' },
    { code: 'km', name: 'Khmer', native: 'ខ្មែរ' },
    { code: 'lo', name: 'Lao', native: 'ລາວ' },
    { code: 'ka', name: 'Georgian', native: 'ქართული' },
    { code: 'am', name: 'Amharic', native: 'አማርኛ' },
    { code: 'sw', name: 'Swahili', native: 'Kiswahili' },
    { code: 'zu', name: 'Zulu', native: 'IsiZulu' },
    { code: 'af', name: 'Afrikaans', native: 'Afrikaans' },
    { code: 'eu', name: 'Basque', native: 'Euskera' },
    { code: 'ca', name: 'Catalan', native: 'Català' },
    { code: 'cy', name: 'Welsh', native: 'Cymraeg' },
    { code: 'ga', name: 'Irish', native: 'Gaeilge' },
    { code: 'mt', name: 'Maltese', native: 'Malti' },
    { code: 'is', name: 'Icelandic', native: 'Íslenska' },
    { code: 'mk', name: 'Macedonian', native: 'Македонски' },
    { code: 'sq', name: 'Albanian', native: 'Shqip' },
    { code: 'sr', name: 'Serbian', native: 'Српски' },
    { code: 'bs', name: 'Bosnian', native: 'Bosanski' },
    { code: 'me', name: 'Montenegrin', native: 'Crnogorski' },
    { code: 'uk', name: 'Ukrainian', native: 'Українська' },
    { code: 'be', name: 'Belarusian', native: 'Беларуская' },
    { code: 'kk', name: 'Kazakh', native: 'Қазақша' },
    { code: 'ky', name: 'Kyrgyz', native: 'Кыргызча' },
    { code: 'uz', name: 'Uzbek', native: 'Oʻzbekcha' },
    { code: 'tg', name: 'Tajik', native: 'Тоҷикӣ' },
    { code: 'mn', name: 'Mongolian', native: 'Монгол' },
    { code: 'bo', name: 'Tibetan', native: 'བོད་ཡིག' },
    { code: 'dz', name: 'Dzongkha', native: 'རྫོང་ཁ' },
    { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
    { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
    { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्' },
    { code: 'sd', name: 'Sindhi', native: 'سنڌي' },
    { code: 'ks', name: 'Kashmiri', native: 'کٲشُر' },
    { code: 'brx', name: 'Bodo', native: 'बड़ो' },
    { code: 'gom', name: 'Konkani', native: 'कोंकणी' },
    { code: 'mni', name: 'Manipuri', native: 'মৈতৈলোন্' },
    { code: 'sat', name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ' },
    { code: 'mai', name: 'Maithili', native: 'मैथिली' },
    { code: 'lus', name: 'Mizo', native: 'Mizo ṭawng' },
    { code: 'njo', name: 'Ao', native: 'Ao' },
    { code: 'njz', name: 'Nyishi', native: 'Nyishi' },
    { code: 'grt', name: 'Garo', native: 'A·chik' },
    { code: 'kha', name: 'Khasi', native: 'Khasi' },
    { code: 'mni-Mtei', name: 'Meitei', native: 'ꯃꯤꯇꯩꯂꯣꯟ' },
    { code: 'bpy', name: 'Bishnupriya', native: 'বিষ্ণুপ্রিয়া মণিপুরী' },
    { code: 'kok', name: 'Konkani', native: 'कोंकणी' },
    { code: 'doi', name: 'Dogri', native: 'डोगरी' },
    { code: 'mni-Latn', name: 'Meitei (Latin)', native: 'Meitei (Latin)' },
    { code: 'bho', name: 'Bhojpuri', native: 'भोजपुरी' },
    { code: 'mag', name: 'Magahi', native: 'मगही' },
    { code: 'awa', name: 'Awadhi', native: 'अवधी' },
    { code: 'raj', name: 'Rajasthani', native: 'राजस्थानी' },
    { code: 'gom-Latn', name: 'Konkani (Latin)', native: 'Konkani (Latin)' },
    { code: 'gom-Deva', name: 'Konkani (Devanagari)', native: 'कोंकणी (देवनागरी)' },
    { code: 'gom-Knda', name: 'Konkani (Kannada)', native: 'ಕೊಂಕಣಿ (ಕನ್ನಡ)' },
    { code: 'gom-Mlym', name: 'Konkani (Malayalam)', native: 'കൊങ്കണി (മലയാളം)' },
    { code: 'gom-Gujr', name: 'Konkani (Gujarati)', native: 'કોંકણી (ગુજરાતી)' },
    { code: 'gom-Arab', name: 'Konkani (Arabic)', native: 'کونکانی (عربی)' },
    { code: 'gom-Beng', name: 'Konkani (Bengali)', native: 'কোংকণি (বাংলা)' },
    { code: 'gom-Orya', name: 'Konkani (Odia)', native: 'କୋଂକଣି (ଓଡ଼ିଆ)' },
    { code: 'gom-Telu', name: 'Konkani (Telugu)', native: 'కొంకణి (తెలుగు)' },
    { code: 'gom-Taml', name: 'Konkani (Tamil)', native: 'கொங்கணி (தமிழ்)' },
    { code: 'gom-Guru', name: 'Konkani (Gurmukhi)', native: 'ਕੋਂਕਣੀ (ਗੁਰਮੁਖੀ)' },
    { code: 'gom-Sinh', name: 'Konkani (Sinhala)', native: 'කොංකණි (සිංහල)' },
    { code: 'gom-Thaa', name: 'Konkani (Thaana)', native: 'ކޮންކަން (ތާނަ)' },
    { code: 'gom-Mymr', name: 'Konkani (Myanmar)', native: 'ကွန်ကန် (မြန်မာ)' },
    { code: 'gom-Khmr', name: 'Konkani (Khmer)', native: 'កុងកាន (ខ្មែរ)' },
    { code: 'gom-Laoo', name: 'Konkani (Lao)', native: 'ກອງການ (ລາວ)' },
    { code: 'gom-Tibt', name: 'Konkani (Tibetan)', native: 'ཀོང་ཀན (བོད་ཡིག)' },
    { code: 'gom-Mong', name: 'Konkani (Mongolian)', native: 'Конкан (Монгол)' },
    { code: 'gom-Cyrl', name: 'Konkani (Cyrillic)', native: 'Конкан (Кириллица)' },
    { code: 'gom-Hebr', name: 'Konkani (Hebrew)', native: 'קונקן (עברית)' },
    { code: 'gom-Armn', name: 'Konkani (Armenian)', native: 'Կոնկան (Հայերեն)' },
    { code: 'gom-Geor', name: 'Konkani (Georgian)', native: 'კონკანი (ქართული)' },
    { code: 'gom-Ethi', name: 'Konkani (Ethiopic)', native: 'ኮንካን (አማርኛ)' },
    { code: 'gom-Cher', name: 'Konkani (Cherokee)', native: 'ᎪᏅᎧᏂ (ᏣᎳᎩ)' },
    { code: 'gom-Osma', name: 'Konkani (Osmanya)', native: '𐒋𐒕𐒐𐒕𐒖𐒕 (𐒋𐒘𐒖𐒇𐒖𐒕)' },
    { code: 'gom-Vaii', name: 'Konkani (Vai)', native: 'ꖌꕰꕊꕰ (ꕙꔤ)' },
    { code: 'gom-Bamu', name: 'Konkani (Bamum)', native: 'ꚪꚵꚫꚵ (ꚠꚡꚢꚣ)' },
    { code: 'gom-Mand', name: 'Konkani (Mandaic)', native: 'ࡊࡅࡍࡊࡀࡍ (ࡌࡀࡍࡃࡀࡉࡀ)' },
    { code: 'gom-Syrc', name: 'Konkani (Syriac)', native: 'ܟܘܢܟܐܢ (ܣܘܪܝܝܐ)' },
    { code: 'gom-Thai', name: 'Konkani (Thai)', native: 'กองกาน (ไทย)' },
    { code: 'gom-Lana', name: 'Konkani (Tai Tham)', native: 'ᨠᩫ᩠ᨦᨠᩢ᩠ᨶ (ᨲᩫ᩠ᨿᨵᩢ᩠ᨾ)' },
    { code: 'gom-Tavt', name: 'Konkani (Tai Viet)', native: 'ꪀꪮꪙꪀꪮꪙ (ꪼꪕꪼꪒ)' },
    { code: 'gom-Bali', name: 'Konkani (Balinese)', native: 'ᬓᭀᬦ᭄ᬓᬦᬶ (ᬩᬮᬶ)' },
    { code: 'gom-Batk', name: 'Konkani (Batak)', native: 'ᯂᯮᯉᯂᯮᯉ (ᯅᯖᯂ᯲)' },
    { code: 'gom-Bugi', name: 'Konkani (Buginese)', native: 'ᨀᨚᨊᨀᨚᨊ (ᨅᨘᨁᨗ)' },
    { code: 'gom-Cham', name: 'Konkani (Cham)', native: 'ꨆꨯꨆꨆ (ꨌꨩꨭ)' },
    { code: 'gom-Java', name: 'Konkani (Javanese)', native: 'ꦏꦺꦴꦤ꧀ꦏꦤꦶ (ꦗꦮ)' },
    { code: 'gom-Lepc', name: 'Konkani (Lepcha)', native: 'ᰀᰨᰎᰀᰨᰎ (ᰛᰧᰵᰶᰛᰧᰵᰶ)' },
    { code: 'gom-Limb', name: 'Konkani (Limbu)', native: 'ᤁᤨᤘᤁᤨᤘ (ᤕᤠᤰᤌᤢᤱ)' },
    { code: 'gom-Mlym', name: 'Konkani (Malayalam)', native: 'കൊങ്കണി (മലയാളം)' },
    { code: 'gom-Mtei', name: 'Konkani (Meitei Mayek)', native: 'ꯀꯣꯟꯀꯥꯟ (ꯃꯤꯇꯩꯂꯣꯟ)' },
    { code: 'gom-Newa', name: 'Konkani (Newa)', native: '𑐎𑑀𑐣𑐎𑑀𑐣 (𑐣𑐾𑐰𑐵)' },
    { code: 'gom-Nkoo', name: 'Konkani (N\'Ko)', native: 'ߞߏ߲ߞߊ߲ (ߒߞߏ)' },
    { code: 'gom-Orya', name: 'Konkani (Odia)', native: 'କୋଂକଣି (ଓଡ଼ିଆ)' },
    { code: 'gom-Saur', name: 'Konkani (Saurashtra)', native: 'ꢒ꣄ꢒꢒ (ꢱꣃꢬꢱꢴꢵꢶꢷ)' },
    { code: 'gom-Sund', name: 'Konkani (Sundanese)', native: 'ᮊᮧᮔ᮪ᮊᮔᮤ (ᮞᮥᮔ᮪ᮓ)' },
    { code: 'gom-Tagb', name: 'Konkani (Tagbanwa)', native: 'ᜃᜓᜈᜃᜓᜈ (ᜆᜄ᜔ᜊᜈ᜔ᜏ)' },
    { code: 'gom-Tale', name: 'Konkani (Tai Le)', native: 'ᥐᥨᥢᥐᥨᥢ (ᥖᥭᥰᥘᥫᥴ)' },
    { code: 'gom-Talu', name: 'Konkani (New Tai Lue)', native: 'ᦅᦷᧃᦅᦷᧃ (ᦺᦑᦟᦹᧉ)' },
    { code: 'gom-Taml', name: 'Konkani (Tamil)', native: 'கொங்கணி (தமிழ்)' },
    { code: 'gom-Telu', name: 'Konkani (Telugu)', native: 'కొంకణి (తెలుగు)' },
    { code: 'gom-Tfng', name: 'Konkani (Tifinagh)', native: 'ⴽⵓⵏⴽⴰⵏ (ⵜⵉⴼⵉⵏⴰⵖ)' },
    { code: 'gom-Tirh', name: 'Konkani (Tirhuta)', native: '𑒏𑒼𑒢𑒏𑒼𑒢 (𑒞𑒱𑒩𑒯𑒳𑒞)' },
    { code: 'gom-Wara', name: 'Konkani (Warang Citi)', native: '𑢹𑣀𑣊𑢹𑣀𑣊 (𑢹𑣀𑣜𑣀𑣊𑣈𑣈)' },
    { code: 'gom-Xsux', name: 'Konkani (Cuneiform)', native: '𒀭𒀭𒀭 (𒀭𒀭𒀭)' },
    { code: 'gom-Yiii', name: 'Konkani (Yi)', native: 'ꇗꇗꇗ (ꆈꌠ)' },
    { code: 'gom-Zanb', name: 'Konkani (Zanabazar Square)', native: '𑨀𑨀𑨀 (𑨀𑨀𑨀)' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    value,
    onValueChange,
    placeholder = 'Select language',
    label = 'Preferred Language',
    className = '',
    required = false,
    disabled = false,
}) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <Label htmlFor="language-selector" className="text-gray-900 dark:text-white">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </Label>
            )}
            <Select
                value={value}
                onValueChange={onValueChange}
                disabled={disabled}
            >
                <SelectTrigger 
                    id="language-selector"
                    className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                    {LANGUAGES.map((language) => (
                        <SelectItem key={language.code} value={language.name}>
                            <div className="flex items-center justify-between w-full">
                                <span>{language.name}</span>
                                <span className="text-sm text-muted-foreground ml-2">
                                    {language.native}
                                </span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default LanguageSelector;
