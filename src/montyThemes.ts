// Monty AI Themes Configuration
// Each theme includes colors for backgrounds, text, buttons, and gradients

export interface MontyTheme {
    name: string;
    displayName: string;
    flag: string;
    language: string;
    languageCode: string;
    translations: {
        chatTitle: string;
        chatHistory: string;
        enterSecretKey: string;
        authenticate: string;
        requestSecretKey: string;
        typeMessage: string;
        send: string;
        clear: string;
        pdfButton: string;
        removeButton: string;
        newChatMessage: string;
        systemPrompt: string;
    };
    colors: {
        // Background colors
        primaryBg: string;
        secondaryBg: string;
        gradientBg: string;

        // Text colors
        primaryText: string;
        secondaryText: string;

        // Accent colors
        primary: string;
        primaryHover: string;
        secondary: string;

        // Component colors
        cardBg: string;
        cardBorder: string;
        inputBg: string;
        inputBorder: string;
        inputFocus: string;

        // Button colors
        buttonGradientStart: string;
        buttonGradientEnd: string;
        buttonText: string;

        // Message bubbles
        userMessageGradientStart: string;
        userMessageGradientEnd: string;
        aiMessageBg: string;
        aiMessageBorder: string;

        // Sidebar
        sidebarBg: string;
        sidebarHeader: string;
        sessionItemBg: string;
        sessionItemHover: string;
        sessionItemActive: string;

        // Scrollbar
        scrollbarThumb: string;
        scrollbarThumbHover: string;
        scrollbarTrack: string;

        // Code blocks
        codeBlockBg: string;
        codeBlockHeaderStart: string;
        codeBlockHeaderEnd: string;
    };
}

export const themes: { [key: string]: MontyTheme } = {
    'israel-light': {
        name: 'israel-light',
        displayName: 'ACS - Israel Light',
        flag: '🇮🇱',
        language: 'Hebrew',
        languageCode: 'he',
        translations: {
            chatTitle: 'Monty AI',
            chatHistory: 'היסטוריית צ\'אט',
            enterSecretKey: 'הכנס מפתח סודי להמשך',
            authenticate: 'אימות',
            requestSecretKey: '📧 בקש מפתח סודי',
            typeMessage: 'הקלד את ההודעה שלך כאן...',
            send: 'שלח',
            clear: 'נקה',
            pdfButton: '📄 PDF',
            removeButton: 'הסר',
            newChatMessage: '✨ צ\'אט חדש התחיל! הצ\'אט הקודם שלך נשמר בסרגל הצד.\n\n👋 איך אני יכול לעזור לך היום?',
            systemPrompt: 'אתה עוזר AI מועיל. תמיד תענה בעברית אלא אם המשתמש מבקש אחרת.'
        },
        colors: {
            // Light blue and white theme
            primaryBg: '#f0f8ff',
            secondaryBg: '#e6f4ff',
            gradientBg: 'linear-gradient(135deg, #f0f8ff 0%, #e6f4ff 50%, #d9edff 100%)',

            primaryText: '#1e3a5f',
            secondaryText: '#4a6fa5',

            primary: '#0047ab',
            primaryHover: '#003d99',
            secondary: '#ffffff',

            cardBg: '#ffffff',
            cardBorder: 'rgba(0, 71, 171, 0.2)',
            inputBg: '#f8fbff',
            inputBorder: '#d1e5ff',
            inputFocus: '#0047ab',

            buttonGradientStart: '#0047ab',
            buttonGradientEnd: '#0066cc',
            buttonText: '#ffffff',

            userMessageGradientStart: '#0047ab',
            userMessageGradientEnd: '#0066cc',
            aiMessageBg: '#ffffff',
            aiMessageBorder: '#d1e5ff',

            sidebarBg: '#ffffff',
            sidebarHeader: 'linear-gradient(135deg, #0047ab 0%, #0066cc 100%)',
            sessionItemBg: '#f8fbff',
            sessionItemHover: '#e6f4ff',
            sessionItemActive: 'linear-gradient(135deg, #d1e5ff 0%, #e6f4ff 100%)',

            scrollbarThumb: '#b3d9ff',
            scrollbarThumbHover: '#80c1ff',
            scrollbarTrack: '#f8fbff',

            codeBlockBg: '#1e3a5f',
            codeBlockHeaderStart: '#0047ab',
            codeBlockHeaderEnd: '#0066cc',
        }
    },

    'israel-dark': {
        name: 'israel-dark',
        displayName: 'ACS - Israel Dark',
        flag: '🇮🇱',
        language: 'Hebrew',
        languageCode: 'he',
        translations: {
            chatTitle: 'Monty AI',
            chatHistory: 'היסטוריית צ\'אט',
            enterSecretKey: 'הכנס מפתח סודי להמשך',
            authenticate: 'אימות',
            requestSecretKey: '📧 בקש מפתח סודי',
            typeMessage: 'הקלד את ההודעה שלך כאן...',
            send: 'שלח',
            clear: 'נקה',
            pdfButton: '📄 PDF',
            removeButton: 'הסר',
            newChatMessage: '✨ צ\'אט חדש התחיל! הצ\'אט הקודם שלך נשמר בסרגל הצד.\n\n👋 איך אני יכול לעזור לך היום?',
            systemPrompt: 'אתה עוזר AI מועיל. תמיד תענה בעברית אלא אם המשתמש מבקש אחרת.'
        },
        colors: {
            // Dark blue and white theme
            primaryBg: '#0a1929',
            secondaryBg: '#132f4c',
            gradientBg: 'linear-gradient(135deg, #0a1929 0%, #132f4c 50%, #1a3d5c 100%)',

            primaryText: '#e3f2fd',
            secondaryText: '#90caf9',

            primary: '#2196f3',
            primaryHover: '#1976d2',
            secondary: '#ffffff',

            cardBg: '#1a2332',
            cardBorder: 'rgba(33, 150, 243, 0.3)',
            inputBg: '#0f1922',
            inputBorder: '#2a3f5f',
            inputFocus: '#2196f3',

            buttonGradientStart: '#2196f3',
            buttonGradientEnd: '#1976d2',
            buttonText: '#ffffff',

            userMessageGradientStart: '#2196f3',
            userMessageGradientEnd: '#1976d2',
            aiMessageBg: '#1a2332',
            aiMessageBorder: '#2a3f5f',

            sidebarBg: '#0d1b2a',
            sidebarHeader: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
            sessionItemBg: '#1a2332',
            sessionItemHover: '#253445',
            sessionItemActive: 'linear-gradient(135deg, #1e3a5f 0%, #2a4a6f 100%)',

            scrollbarThumb: '#2a3f5f',
            scrollbarThumbHover: '#3d5a7f',
            scrollbarTrack: '#0f1922',

            codeBlockBg: '#0a0f1a',
            codeBlockHeaderStart: '#2196f3',
            codeBlockHeaderEnd: '#1976d2',
        }
    },

    'usa-light': {
        name: 'usa-light',
        displayName: 'ACS - USA Light',
        flag: '🇺🇸',
        language: 'English',
        languageCode: 'en',
        translations: {
            chatTitle: 'Monty AI',
            chatHistory: 'Chat History',
            enterSecretKey: 'Enter your secret key to continue',
            authenticate: 'Authenticate',
            requestSecretKey: '📧 Request A Secret Key',
            typeMessage: 'Type your message here...',
            send: 'Send',
            clear: 'Clear',
            pdfButton: '📄 PDF',
            removeButton: 'Remove',
            newChatMessage: '✨ New chat started! Your previous chat has been saved to the sidebar.\n\n👋 How can I help you today?',
            systemPrompt: 'You are a helpful AI assistant. Always respond in English unless the user requests otherwise.'
        },
        colors: {
            // Red, white, and blue theme
            primaryBg: '#f8f9fa',
            secondaryBg: '#e9ecef',
            gradientBg: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)',

            primaryText: '#1a1d3e',
            secondaryText: '#495057',

            primary: '#0052a5',
            primaryHover: '#003d7a',
            secondary: '#bf0a30',

            cardBg: '#ffffff',
            cardBorder: 'rgba(0, 82, 165, 0.2)',
            inputBg: '#f8f9fa',
            inputBorder: '#dee2e6',
            inputFocus: '#0052a5',

            buttonGradientStart: '#0052a5',
            buttonGradientEnd: '#bf0a30',
            buttonText: '#ffffff',

            userMessageGradientStart: '#0052a5',
            userMessageGradientEnd: '#003d7a',
            aiMessageBg: '#ffffff',
            aiMessageBorder: '#dee2e6',

            sidebarBg: '#ffffff',
            sidebarHeader: 'linear-gradient(135deg, #0052a5 0%, #bf0a30 100%)',
            sessionItemBg: '#f8f9fa',
            sessionItemHover: '#e9ecef',
            sessionItemActive: 'linear-gradient(135deg, #d0e8ff 0%, #ffd0d8 100%)',

            scrollbarThumb: '#adb5bd',
            scrollbarThumbHover: '#868e96',
            scrollbarTrack: '#f8f9fa',

            codeBlockBg: '#1a1d3e',
            codeBlockHeaderStart: '#0052a5',
            codeBlockHeaderEnd: '#bf0a30',
        }
    },

    'usa-dark': {
        name: 'usa-dark',
        displayName: 'ACS - USA Dark',
        flag: '🇺🇸',
        language: 'English',
        languageCode: 'en',
        translations: {
            chatTitle: 'Monty AI',
            chatHistory: 'Chat History',
            enterSecretKey: 'Enter your secret key to continue',
            authenticate: 'Authenticate',
            requestSecretKey: '📧 Request A Secret Key',
            typeMessage: 'Type your message here...',
            send: 'Send',
            clear: 'Clear',
            pdfButton: '📄 PDF',
            removeButton: 'Remove',
            newChatMessage: '✨ New chat started! Your previous chat has been saved to the sidebar.\n\n👋 How can I help you today?',
            systemPrompt: 'You are a helpful AI assistant. Always respond in English unless the user requests otherwise.'
        },
        colors: {
            // Dark red, white, and blue theme
            primaryBg: '#0d1117',
            secondaryBg: '#161b22',
            gradientBg: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1f2937 100%)',

            primaryText: '#e6edf3',
            secondaryText: '#8b949e',

            primary: '#3b82f6',
            primaryHover: '#2563eb',
            secondary: '#dc2626',

            cardBg: '#161b22',
            cardBorder: 'rgba(59, 130, 246, 0.3)',
            inputBg: '#0d1117',
            inputBorder: '#30363d',
            inputFocus: '#3b82f6',

            buttonGradientStart: '#3b82f6',
            buttonGradientEnd: '#dc2626',
            buttonText: '#ffffff',

            userMessageGradientStart: '#1e40af',
            userMessageGradientEnd: '#991b1b',
            aiMessageBg: '#161b22',
            aiMessageBorder: '#30363d',

            sidebarBg: '#0d1117',
            sidebarHeader: 'linear-gradient(135deg, #1e40af 0%, #991b1b 100%)',
            sessionItemBg: '#161b22',
            sessionItemHover: '#1f2937',
            sessionItemActive: 'linear-gradient(135deg, #1e3a8a 0%, #7f1d1d 100%)',

            scrollbarThumb: '#30363d',
            scrollbarThumbHover: '#484f58',
            scrollbarTrack: '#0d1117',

            codeBlockBg: '#010409',
            codeBlockHeaderStart: '#1e40af',
            codeBlockHeaderEnd: '#991b1b',
        }
    },

    'china-light': {
        name: 'china-light',
        displayName: 'ACS - China Light',
        flag: '🇨🇳',
        language: 'Chinese',
        languageCode: 'zh',
        translations: {
            chatTitle: 'Monty AI',
            chatHistory: '聊天记录',
            enterSecretKey: '输入您的密钥继续',
            authenticate: '验证',
            requestSecretKey: '📧 申请密钥',
            typeMessage: '在此输入您的消息...',
            send: '发送',
            clear: '清除',
            pdfButton: '📄 PDF',
            removeButton: '删除',
            newChatMessage: '✨ 新聊天已开始！您之前的聊天已保存到侧边栏。\n\n👋 我今天能帮您什么？',
            systemPrompt: '你是一个有用的AI助手。除非用户另有要求，否则始终用中文回复。'
        },
        colors: {
            // Red and yellow/gold theme
            primaryBg: '#fff5e6',
            secondaryBg: '#ffe4cc',
            gradientBg: 'linear-gradient(135deg, #fff5e6 0%, #ffe4cc 50%, #ffd9b3 100%)',

            primaryText: '#8b0000',
            secondaryText: '#b8860b',

            primary: '#de2910',
            primaryHover: '#c41e0a',
            secondary: '#ffde00',

            cardBg: '#ffffff',
            cardBorder: 'rgba(222, 41, 16, 0.2)',
            inputBg: '#fff9f0',
            inputBorder: '#ffe4cc',
            inputFocus: '#de2910',

            buttonGradientStart: '#de2910',
            buttonGradientEnd: '#c41e0a',
            buttonText: '#ffffff',

            userMessageGradientStart: '#de2910',
            userMessageGradientEnd: '#c41e0a',
            aiMessageBg: '#ffffff',
            aiMessageBorder: '#ffe4cc',

            sidebarBg: '#ffffff',
            sidebarHeader: 'linear-gradient(135deg, #de2910 0%, #ffde00 100%)',
            sessionItemBg: '#fff9f0',
            sessionItemHover: '#ffedd5',
            sessionItemActive: 'linear-gradient(135deg, #ffe4cc 0%, #fff2d9 100%)',

            scrollbarThumb: '#f4c542',
            scrollbarThumbHover: '#daa520',
            scrollbarTrack: '#fff9f0',

            codeBlockBg: '#4a0000',
            codeBlockHeaderStart: '#de2910',
            codeBlockHeaderEnd: '#ffde00',
        }
    },

    'china-dark': {
        name: 'china-dark',
        displayName: 'ACS - China Dark',
        flag: '🇨🇳',
        language: 'Chinese',
        languageCode: 'zh',
        translations: {
            chatTitle: 'Monty AI',
            chatHistory: '聊天记录',
            enterSecretKey: '输入您的密钥继续',
            authenticate: '验证',
            requestSecretKey: '📧 申请密钥',
            typeMessage: '在此输入您的消息...',
            send: '发送',
            clear: '清除',
            pdfButton: '📄 PDF',
            removeButton: '删除',
            newChatMessage: '✨ 新聊天已开始！您之前的聊天已保存到侧边栏。\n\n👋 我今天能帮您什么？',
            systemPrompt: '你是一个有用的AI助手。除非用户另有要求，否则始终用中文回复。'
        },
        colors: {
            // Dark red and gold theme
            primaryBg: '#1a0000',
            secondaryBg: '#2d0a0a',
            gradientBg: 'linear-gradient(135deg, #1a0000 0%, #2d0a0a 50%, #400f0f 100%)',

            primaryText: '#ffd700',
            secondaryText: '#ffb700',

            primary: '#ff1744',
            primaryHover: '#d50000',
            secondary: '#ffd700',

            cardBg: '#2d0a0a',
            cardBorder: 'rgba(255, 23, 68, 0.3)',
            inputBg: '#1a0000',
            inputBorder: '#4d1010',
            inputFocus: '#ff1744',

            buttonGradientStart: '#ff1744',
            buttonGradientEnd: '#d50000',
            buttonText: '#ffd700',

            userMessageGradientStart: '#c41e0a',
            userMessageGradientEnd: '#8b0000',
            aiMessageBg: '#2d0a0a',
            aiMessageBorder: '#4d1010',

            sidebarBg: '#1a0000',
            sidebarHeader: 'linear-gradient(135deg, #ff1744 0%, #ffd700 100%)',
            sessionItemBg: '#2d0a0a',
            sessionItemHover: '#400f0f',
            sessionItemActive: 'linear-gradient(135deg, #4d1010 0%, #5a1a0a 100%)',

            scrollbarThumb: '#4d1010',
            scrollbarThumbHover: '#6d1a1a',
            scrollbarTrack: '#1a0000',

            codeBlockBg: '#0d0000',
            codeBlockHeaderStart: '#ff1744',
            codeBlockHeaderEnd: '#ffd700',
        }
    },

    'germany-light': {
        name: 'germany-light',
        displayName: 'ACS - Germany Light',
        flag: '🇩🇪',
        language: 'German',
        languageCode: 'de',
        translations: {
            chatTitle: 'Monty AI',
            chatHistory: 'Chat-Verlauf',
            enterSecretKey: 'Geben Sie Ihren geheimen Schlüssel ein, um fortzufahren',
            authenticate: 'Authentifizieren',
            requestSecretKey: '📧 Geheimschlüssel Anfordern',
            typeMessage: 'Geben Sie hier Ihre Nachricht ein...',
            send: 'Senden',
            clear: 'Löschen',
            pdfButton: '📄 PDF',
            removeButton: 'Entfernen',
            newChatMessage: '✨ Neuer Chat gestartet! Ihr vorheriger Chat wurde in der Seitenleiste gespeichert.\n\n👋 Wie kann ich Ihnen heute helfen?',
            systemPrompt: 'Sie sind ein hilfreicher KI-Assistent. Antworten Sie immer auf Deutsch, es sei denn, der Benutzer wünscht etwas anderes.'
        },
        colors: {
            // Black, red, and gold theme
            primaryBg: '#f5f5f5',
            secondaryBg: '#e8e8e8',
            gradientBg: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 50%, #d9d9d9 100%)',

            primaryText: '#1a1a1a',
            secondaryText: '#4a4a4a',

            primary: '#dd0000',
            primaryHover: '#c40000',
            secondary: '#ffce00',

            cardBg: '#ffffff',
            cardBorder: 'rgba(221, 0, 0, 0.2)',
            inputBg: '#fafafa',
            inputBorder: '#d9d9d9',
            inputFocus: '#dd0000',

            buttonGradientStart: '#000000',
            buttonGradientEnd: '#dd0000',
            buttonText: '#ffce00',

            userMessageGradientStart: '#000000',
            userMessageGradientEnd: '#333333',
            aiMessageBg: '#ffffff',
            aiMessageBorder: '#d9d9d9',

            sidebarBg: '#ffffff',
            sidebarHeader: 'linear-gradient(135deg, #000000 0%, #dd0000 50%, #ffce00 100%)',
            sessionItemBg: '#fafafa',
            sessionItemHover: '#f0f0f0',
            sessionItemActive: 'linear-gradient(135deg, #ffe8cc 0%, #fff5e6 100%)',

            scrollbarThumb: '#999999',
            scrollbarThumbHover: '#666666',
            scrollbarTrack: '#fafafa',

            codeBlockBg: '#1a1a1a',
            codeBlockHeaderStart: '#000000',
            codeBlockHeaderEnd: '#dd0000',
        }
    },

    'germany-dark': {
        name: 'germany-dark',
        displayName: 'ACS - Germany Dark',
        flag: '🇩🇪',
        language: 'German',
        languageCode: 'de',
        translations: {
            chatTitle: 'Monty AI',
            chatHistory: 'Chat-Verlauf',
            enterSecretKey: 'Geben Sie Ihren geheimen Schlüssel ein, um fortzufahren',
            authenticate: 'Authentifizieren',
            requestSecretKey: '📧 Geheimschlüssel Anfordern',
            typeMessage: 'Geben Sie hier Ihre Nachricht ein...',
            send: 'Senden',
            clear: 'Löschen',
            pdfButton: '📄 PDF',
            removeButton: 'Entfernen',
            newChatMessage: '✨ Neuer Chat gestartet! Ihr vorheriger Chat wurde in der Seitenleiste gespeichert.\n\n👋 Wie kann ich Ihnen heute helfen?',
            systemPrompt: 'Sie sind ein hilfreicher KI-Assistent. Antworten Sie immer auf Deutsch, es sei denn, der Benutzer wünscht etwas anderes.'
        },
        colors: {
            // Dark black, red, and gold theme
            primaryBg: '#0a0a0a',
            secondaryBg: '#1a1a1a',
            gradientBg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a2a2a 100%)',

            primaryText: '#ffce00',
            secondaryText: '#d4a017',

            primary: '#ff0000',
            primaryHover: '#dd0000',
            secondary: '#ffce00',

            cardBg: '#1a1a1a',
            cardBorder: 'rgba(255, 0, 0, 0.3)',
            inputBg: '#0a0a0a',
            inputBorder: '#333333',
            inputFocus: '#ff0000',

            buttonGradientStart: '#1a1a1a',
            buttonGradientEnd: '#ff0000',
            buttonText: '#ffce00',

            userMessageGradientStart: '#2a2a2a',
            userMessageGradientEnd: '#1a1a1a',
            aiMessageBg: '#1a1a1a',
            aiMessageBorder: '#333333',

            sidebarBg: '#0a0a0a',
            sidebarHeader: 'linear-gradient(135deg, #000000 0%, #dd0000 50%, #ffce00 100%)',
            sessionItemBg: '#1a1a1a',
            sessionItemHover: '#2a2a2a',
            sessionItemActive: 'linear-gradient(135deg, #2a2a2a 0%, #3a1a1a 100%)',

            scrollbarThumb: '#333333',
            scrollbarThumbHover: '#4d4d4d',
            scrollbarTrack: '#0a0a0a',

            codeBlockBg: '#000000',
            codeBlockHeaderStart: '#1a1a1a',
            codeBlockHeaderEnd: '#ff0000',
        }
    }
};

export function getTheme(themeName: string): MontyTheme {
    return themes[themeName] || themes['israel-light'];
}

export function getAllThemes(): MontyTheme[] {
    return Object.values(themes);
}

export function getThemeNames(): string[] {
    return Object.keys(themes);
}
