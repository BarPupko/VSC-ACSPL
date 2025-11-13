import * as vscode from 'vscode';
import * as admin from 'firebase-admin';
import Anthropic from '@anthropic-ai/sdk';
import { themes, MontyTheme } from './montyThemes';

// Firebase helper functions
async function verifySpecialCode(code: string): Promise<boolean> {
    try {
        const db = admin.database();
        const usersRef = db.ref('users');
        console.log('Querying Firebase users for secretKey:', code);

        let snapshot = await usersRef.orderByChild('secretKey').equalTo(code).once('value');

        if (!snapshot.exists()) {
            console.log('Trying manual search through all users...');
            const allUsersSnapshot = await usersRef.once('value');

            if (allUsersSnapshot.exists()) {
                const allUsers = allUsersSnapshot.val();
                for (const [userId, userData] of Object.entries(allUsers as any)) {
                    const user = userData as any;
                    if (user.secretKey === code) {
                        return true;
                    }
                }
            }
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error verifying special code:', error);
        return false;
    }
}

async function getUserIdFromCode(code: string): Promise<string | null> {
    try {
        const db = admin.database();
        const usersRef = db.ref('users');
        const snapshot = await usersRef.orderByChild('secretKey').equalTo(code).once('value');

        if (snapshot.exists()) {
            return Object.keys(snapshot.val())[0];
        }
        return null;
    } catch (error) {
        console.error('Error getting user ID:', error);
        return null;
    }
}

async function getUserName(userId: string): Promise<string> {
    try {
        const db = admin.database();
        const userRef = db.ref(`users/${userId}`);
        const snapshot = await userRef.once('value');

        if (snapshot.exists()) {
            const userData = snapshot.val();
            return userData.name || userData.email || 'User';
        }
        return 'User';
    } catch (error) {
        console.error('Error getting user name:', error);
        return 'User';
    }
}

async function createChatSession(userId: string, sessionName: string): Promise<string> {
    try {
        const db = admin.database();
        const sessionsRef = db.ref(`chats/${userId}`);

        const newSessionRef = sessionsRef.push();
        const sessionId = newSessionRef.key!;

        await newSessionRef.set({
            name: sessionName,
            createdAt: Date.now(),
            messages: []
        });

        console.log('Created new chat session:', sessionId);
        return sessionId;
    } catch (error) {
        console.error('Error creating chat session:', error);
        throw error;
    }
}

async function getUserSessions(userId: string): Promise<any[]> {
    try {
        const db = admin.database();
        const sessionsRef = db.ref(`chats/${userId}`);
        const snapshot = await sessionsRef.once('value');

        if (!snapshot.exists()) {
            return [];
        }

        const sessions = snapshot.val();
        return Object.entries(sessions).map(([id, data]: [string, any]) => ({
            id,
            name: data.name,
            createdAt: data.createdAt
        }));
    } catch (error) {
        console.error('Error getting user sessions:', error);
        return [];
    }
}

async function getSessionMessages(userId: string, sessionId: string): Promise<any[]> {
    try {
        const db = admin.database();
        const messagesRef = db.ref(`chats/${userId}/${sessionId}/messages`);
        const snapshot = await messagesRef.once('value');

        if (!snapshot.exists()) {
            return [];
        }

        const messages = snapshot.val();
        return Object.values(messages);
    } catch (error) {
        console.error('Error getting session messages:', error);
        return [];
    }
}

async function deleteSessionFromFirebase(userId: string, sessionId: string): Promise<void> {
    try {
        const db = admin.database();
        const sessionRef = db.ref(`chats/${userId}/${sessionId}`);
        await sessionRef.remove();
        console.log('Deleted session:', sessionId);
    } catch (error) {
        console.error('Error deleting session:', error);
        throw error;
    }
}

async function updateSessionTitle(userId: string, sessionId: string, newTitle: string): Promise<void> {
    try {
        const db = admin.database();
        const sessionRef = db.ref(`chats/${userId}/${sessionId}`);
        await sessionRef.update({
            name: newTitle
        });
        console.log('Updated session title:', sessionId, newTitle);
    } catch (error) {
        console.error('Error updating session title:', error);
        throw error;
    }
}

async function saveMessage(userId: string, sessionId: string, message: { role: string; content: string; timestamp: number }): Promise<void> {
    try {
        const db = admin.database();
        const messagesRef = db.ref(`chats/${userId}/${sessionId}/messages`);
        await messagesRef.push(message);
    } catch (error) {
        console.error('Error saving message:', error);
        throw error;
    }
}

// AI response functions
async function getAIResponse(apiKey: string, userMessage: string, conversationHistory: Array<{role: string, content: string}>, systemPrompt?: string): Promise<string> {
    try {
        const anthropic = new Anthropic({ apiKey });

        const messages = [
            ...conversationHistory.map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            })),
            { role: 'user', content: userMessage }
        ];

        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-5',
            max_tokens: 4096,
            messages: messages as any,
            system: systemPrompt || 'You are a helpful AI assistant.'
        });

        if (response.content && response.content.length > 0) {
            const textContent = response.content[0];
            if ('text' in textContent) {
                return textContent.text;
            }
        }

        return 'Sorry, I could not generate a response.';
    } catch (error: any) {
        console.error('Error calling Anthropic API:', error);

        if (error.status === 401) {
            return 'Authentication error. Please check your API key configuration.';
        } else if (error.status === 429) {
            return 'Rate limit exceeded. Please try again later.';
        } else if (error.status === 500) {
            return 'Anthropic API error. Please try again later.';
        }

        return `Error: ${error.message || 'Unknown error occurred'}`;
    }
}

async function queryAIWithPdf(apiKey: string, pdfText: string, userMessage: string, conversationHistory: Array<{role: string, content: string}>): Promise<string> {
    try {
        const anthropic = new Anthropic({ apiKey });

        const contextMessage = `I have uploaded a PDF document. Here is its content:\n\n${pdfText}\n\nNow, please answer this question: ${userMessage}`;

        const messages = [
            ...conversationHistory.map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            })),
            { role: 'user', content: contextMessage }
        ];

        const response = await anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 8096,
            messages: messages as any
        });

        if (response.content && response.content.length > 0) {
            const textContent = response.content[0];
            if ('text' in textContent) {
                return textContent.text;
            }
        }

        return 'Sorry, I could not generate a response.';
    } catch (error: any) {
        console.error('Error calling Anthropic API with PDF:', error);
        return `Error: ${error.message || 'Unknown error occurred'}`;
    }
}

function formatAIResponse(text: string): string {
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang || '';
        return `<div class="code-block-wrapper"><div class="code-block-header"><span class="code-language">${language}</span><button class="copy-button" onclick="copyCode(this)">Copy</button></div><pre><code class="language-${language}">${escapeHtml(code.trim())}</code></pre></div>`;
    });

    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/\n/g, '<br>');

    return text;
}

function escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Helper function to generate CSS variables from theme
function generateThemeCSS(theme: MontyTheme): string {
    const c = theme.colors;
    return `
        :root {
            --primary-bg: ${c.primaryBg};
            --secondary-bg: ${c.secondaryBg};
            --gradient-bg: ${c.gradientBg};
            --primary-text: ${c.primaryText};
            --secondary-text: ${c.secondaryText};
            --primary: ${c.primary};
            --primary-hover: ${c.primaryHover};
            --secondary: ${c.secondary};
            --card-bg: ${c.cardBg};
            --card-border: ${c.cardBorder};
            --input-bg: ${c.inputBg};
            --input-border: ${c.inputBorder};
            --input-focus: ${c.inputFocus};
            --button-gradient-start: ${c.buttonGradientStart};
            --button-gradient-end: ${c.buttonGradientEnd};
            --button-text: ${c.buttonText};
            --user-message-start: ${c.userMessageGradientStart};
            --user-message-end: ${c.userMessageGradientEnd};
            --ai-message-bg: ${c.aiMessageBg};
            --ai-message-border: ${c.aiMessageBorder};
            --sidebar-bg: ${c.sidebarBg};
            --sidebar-header: ${c.sidebarHeader};
            --session-item-bg: ${c.sessionItemBg};
            --session-item-hover: ${c.sessionItemHover};
            --session-item-active: ${c.sessionItemActive};
            --scrollbar-thumb: ${c.scrollbarThumb};
            --scrollbar-thumb-hover: ${c.scrollbarThumbHover};
            --scrollbar-track: ${c.scrollbarTrack};
            --code-block-bg: ${c.codeBlockBg};
            --code-block-header-start: ${c.codeBlockHeaderStart};
            --code-block-header-end: ${c.codeBlockHeaderEnd};
        }
    `;
}

// Main registration function
export function registerMontyAI(context: vscode.ExtensionContext, firebaseInitialized: boolean, apiKey: string) {
    let currentSessionId: string | null = null;
    let userId: string | null = null;

    let disposable = vscode.commands.registerCommand('acspl.montyAI', async () => {
        const panel = vscode.window.createWebviewPanel(
            'montyAI',
            'Monty AI',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        panel.webview.html = getMontyWebviewContent();

        panel.webview.onDidReceiveMessage(
            async (message) => {
                if (message.command === 'requestLicense') {
                    vscode.env.openExternal(vscode.Uri.parse('mailto:barp@acsmotioncontrol.com?subject=Monty%20AI%20Secret%20Key%20Request&body=Hello,%0D%0A%0D%0AI%20would%20like%20to%20request%20a%20secret%20key%20for%20Monty%20AI.%0D%0A%0D%0AThank%20you!'));
                }

                if (message.command === 'authenticate') {
                    const specialCode = message.code;

                    if (!firebaseInitialized) {
                        panel.webview.postMessage({
                            command: 'authResult',
                            success: false,
                            message: 'Firebase is not configured. Please contact the administrator.'
                        });
                        return;
                    }

                    const isValid = await verifySpecialCode(specialCode);

                    if (isValid) {
                        userId = await getUserIdFromCode(specialCode);

                        if (userId) {
                            const sessions = await getUserSessions(userId);
                            const userName = await getUserName(userId);

                            panel.webview.postMessage({
                                command: 'authResult',
                                success: true,
                                message: 'Authentication successful!',
                                userName: userName
                            });

                            panel.webview.postMessage({
                                command: 'sessionsLoaded',
                                sessions: sessions,
                                currentSessionId: currentSessionId
                            });
                        } else {
                            panel.webview.postMessage({
                                command: 'authResult',
                                success: false,
                                message: 'Could not retrieve user information.'
                            });
                        }
                    } else {
                        panel.webview.postMessage({
                            command: 'authResult',
                            success: false,
                            message: 'Invalid access code. Please try again.'
                        });
                    }
                }

                if (message.command === 'requestSessions') {
                    if (userId) {
                        const sessions = await getUserSessions(userId);
                        panel.webview.postMessage({
                            command: 'sessionsLoaded',
                            sessions: sessions,
                            currentSessionId: currentSessionId
                        });
                    }
                }

                if (message.command === 'loadSession') {
                    if (userId) {
                        currentSessionId = message.sessionId;
                        if (currentSessionId) {
                            const messages = await getSessionMessages(userId, currentSessionId);

                            panel.webview.postMessage({
                                command: 'sessionLoaded',
                                messages: messages
                            });
                        }
                    }
                }

                if (message.command === 'sendMessage') {
                    const userMessage = message.text;
                    const conversationHistory = message.history || [];
                    const systemPrompt = message.systemPrompt;

                    if (!userId) {
                        panel.webview.postMessage({
                            command: 'receiveMessage',
                            text: 'Please authenticate first.'
                        });
                        return;
                    }

                    if (!currentSessionId) {
                        const sessionName = `Chat ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
                        currentSessionId = await createChatSession(userId, sessionName);

                        const sessions = await getUserSessions(userId);
                        panel.webview.postMessage({
                            command: 'sessionsLoaded',
                            sessions: sessions,
                            currentSessionId: currentSessionId
                        });
                    }

                    await saveMessage(userId, currentSessionId, {
                        role: 'user',
                        content: userMessage,
                        timestamp: Date.now()
                    });

                    const aiResponse = await getAIResponse(apiKey, userMessage, conversationHistory, systemPrompt);
                    const formattedResponse = formatAIResponse(aiResponse);

                    await saveMessage(userId, currentSessionId, {
                        role: 'assistant',
                        content: aiResponse,
                        timestamp: Date.now()
                    });

                    panel.webview.postMessage({
                        command: 'receiveMessage',
                        text: formattedResponse
                    });

                    if (conversationHistory.length === 0) {
                        const shortTitle = userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : '');
                        await updateSessionTitle(userId, currentSessionId, shortTitle);

                        const sessions = await getUserSessions(userId);
                        panel.webview.postMessage({
                            command: 'sessionsLoaded',
                            sessions: sessions,
                            currentSessionId: currentSessionId
                        });
                    }
                }

                if (message.command === 'sendPdf') {
                    const pdfText = message.pdfText;
                    const userMessage = message.text;
                    const conversationHistory = message.history || [];

                    if (!userId) {
                        panel.webview.postMessage({
                            command: 'receiveMessage',
                            text: 'Please authenticate first.'
                        });
                        return;
                    }

                    if (!currentSessionId) {
                        const sessionName = `Chat ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
                        currentSessionId = await createChatSession(userId, sessionName);

                        const sessions = await getUserSessions(userId);
                        panel.webview.postMessage({
                            command: 'sessionsLoaded',
                            sessions: sessions,
                            currentSessionId: currentSessionId
                        });
                    }

                    await saveMessage(userId, currentSessionId, {
                        role: 'user',
                        content: `[PDF Upload] ${userMessage}`,
                        timestamp: Date.now()
                    });

                    const aiResponse = await queryAIWithPdf(apiKey, pdfText, userMessage, conversationHistory);
                    const formattedResponse = formatAIResponse(aiResponse);

                    await saveMessage(userId, currentSessionId, {
                        role: 'assistant',
                        content: aiResponse,
                        timestamp: Date.now()
                    });

                    panel.webview.postMessage({
                        command: 'receiveMessage',
                        text: formattedResponse
                    });
                }

                if (message.command === 'clearChat') {
                    if (userId) {
                        const sessionName = `Chat ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
                        currentSessionId = await createChatSession(userId, sessionName);
                        const sessions = await getUserSessions(userId);

                        panel.webview.postMessage({
                            command: 'sessionsLoaded',
                            sessions: sessions,
                            currentSessionId: currentSessionId
                        });

                        panel.webview.postMessage({
                            command: 'chatCleared'
                        });

                        panel.webview.postMessage({
                            command: 'receiveMessage',
                            text: '✨ New chat started! Your previous chat has been saved to the sidebar.\n\n👋 How can I help you today?'
                        });
                    }
                }

                if (message.command === 'deleteSession') {
                    if (userId) {
                        const sessionIdToDelete = message.sessionId;
                        await deleteSessionFromFirebase(userId, sessionIdToDelete);

                        if (currentSessionId === sessionIdToDelete) {
                            currentSessionId = null;
                        }

                        const sessions = await getUserSessions(userId);
                        panel.webview.postMessage({
                            command: 'sessionsLoaded',
                            sessions: sessions,
                            currentSessionId: currentSessionId
                        });

                        panel.webview.postMessage({
                            command: 'sessionDeleted'
                        });
                    }
                }

                if (message.command === 'changeTheme') {
                    const themeName = message.themeName;
                    const theme = themes[themeName];
                    if (theme) {
                        panel.webview.postMessage({
                            command: 'themeChanged',
                            theme: theme
                        });
                    }
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

function getMontyWebviewContent(): string {
    // Get all themes for the selector
    const themesData = JSON.stringify(Object.values(themes));

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monty AI</title>
    <style>
        /* Default theme (Israel Light) CSS Variables */
        :root {
            --primary-bg: #f0f8ff;
            --secondary-bg: #e6f4ff;
            --gradient-bg: linear-gradient(135deg, #f0f8ff 0%, #e6f4ff 50%, #d9edff 100%);
            --primary-text: #1e3a5f;
            --secondary-text: #4a6fa5;
            --primary: #0047ab;
            --primary-hover: #003d99;
            --secondary: #ffffff;
            --card-bg: #ffffff;
            --card-border: rgba(0, 71, 171, 0.2);
            --input-bg: #f8fbff;
            --input-border: #d1e5ff;
            --input-focus: #0047ab;
            --button-gradient-start: #0047ab;
            --button-gradient-end: #0066cc;
            --button-text: #ffffff;
            --user-message-start: #0047ab;
            --user-message-end: #0066cc;
            --ai-message-bg: #ffffff;
            --ai-message-border: #d1e5ff;
            --sidebar-bg: #ffffff;
            --sidebar-header: linear-gradient(135deg, #0047ab 0%, #0066cc 100%);
            --session-item-bg: #f8fbff;
            --session-item-hover: #e6f4ff;
            --session-item-active: linear-gradient(135deg, #d1e5ff 0%, #e6f4ff 100%);
            --scrollbar-thumb: #b3d9ff;
            --scrollbar-thumb-hover: #80c1ff;
            --scrollbar-track: #f8fbff;
            --code-block-bg: #1e3a5f;
            --code-block-header-start: #0047ab;
            --code-block-header-end: #0066cc;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: var(--gradient-bg);
            color: var(--primary-text);
            height: 100vh;
            overflow: hidden;
        }

        #auth-screen {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: var(--gradient-bg);
        }

        .auth-container {
            background: var(--card-bg);
            padding: 40px;
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 420px;
            width: 90%;
            border: 2px solid var(--card-border);
        }

        .logo-container {
            margin-bottom: 20px;
            font-size: 80px;
            animation: bounce 2s infinite;
        }

        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }

        .auth-container h2 {
            color: var(--primary);
            margin-bottom: 10px;
            font-size: 32px;
            font-weight: 700;
            background: linear-gradient(135deg, var(--button-gradient-start) 0%, var(--button-gradient-end) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .auth-container p {
            color: var(--secondary-text);
            margin-bottom: 30px;
            font-size: 16px;
        }

        .auth-input {
            width: 100%;
            padding: 16px;
            margin-bottom: 16px;
            border: 2px solid var(--input-border);
            border-radius: 12px;
            background: var(--input-bg);
            color: var(--primary-text);
            font-size: 16px;
            transition: all 0.3s ease;
        }

        .auth-input:focus {
            outline: none;
            border-color: var(--input-focus);
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
            background: var(--card-bg);
        }

        .auth-button {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, var(--button-gradient-start) 0%, var(--button-gradient-end) 100%);
            color: var(--button-text);
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            margin-bottom: 12px;
        }

        .auth-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
        }

        .auth-button:active {
            transform: translateY(0);
        }

        .request-key-button {
            width: 100%;
            padding: 16px;
            background: var(--card-bg);
            color: var(--primary);
            border: 2px solid var(--primary);
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .request-key-button:hover {
            background: var(--input-bg);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .request-key-button:active {
            transform: translateY(0);
        }

        .auth-error {
            color: #ef4444;
            margin-top: 15px;
            font-size: 14px;
            display: none;
            padding: 12px;
            background: #fee2e2;
            border-radius: 8px;
        }

        #chat-screen {
            display: none;
            height: 100vh;
            flex-direction: row;
        }

        #sidebar {
            width: 280px;
            background: var(--sidebar-bg);
            border-right: 2px solid var(--input-border);
            display: flex;
            flex-direction: column;
            overflow-y: auto;
        }

        #sidebar::-webkit-scrollbar {
            width: 8px;
        }

        #sidebar::-webkit-scrollbar-track {
            background: var(--scrollbar-track);
        }

        #sidebar::-webkit-scrollbar-thumb {
            background: var(--scrollbar-thumb);
            border-radius: 4px;
        }

        #sidebar::-webkit-scrollbar-thumb:hover {
            background: var(--scrollbar-thumb-hover);
        }

        .sidebar-header {
            padding: 24px;
            background: var(--sidebar-header);
            color: var(--button-text);
            font-weight: 700;
            font-size: 18px;
            text-align: center;
            border-bottom: 2px solid rgba(59, 130, 246, 0.1);
        }

        .session-item {
            padding: 16px;
            margin: 8px 12px;
            background: var(--session-item-bg);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid transparent;
            position: relative;
        }

        .session-item:hover {
            background: var(--session-item-hover);
            border-color: var(--primary);
            transform: translateX(5px);
        }

        .session-item.active {
            background: var(--session-item-active);
            border-color: var(--primary);
        }

        .session-name {
            color: var(--primary-text);
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 6px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .session-date {
            color: var(--secondary-text);
            font-size: 12px;
        }

        .delete-session {
            position: absolute;
            top: 12px;
            right: 12px;
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            font-size: 14px;
            cursor: pointer;
            display: none;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .session-item:hover .delete-session {
            display: flex;
        }

        .delete-session:hover {
            background: #dc2626;
            transform: scale(1.1);
        }

        #main-chat {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: var(--gradient-bg);
        }

        #chat-header {
            padding: 24px;
            background: var(--card-bg);
            border-bottom: 2px solid var(--input-border);
            color: var(--primary-text);
            font-weight: 700;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            position: relative;
        }

        .header-title {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            justify-content: center;
        }

        .header-emoji {
            font-size: 32px;
        }

        .user-info {
            position: absolute;
            right: 24px;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: var(--session-item-hover);
            border-radius: 12px;
            border: 2px solid var(--primary);
        }

        .user-icon {
            font-size: 20px;
        }

        .user-name {
            font-size: 14px;
            font-weight: 600;
            color: var(--primary);
        }

        #messages {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        #messages::-webkit-scrollbar {
            width: 10px;
        }

        #messages::-webkit-scrollbar-track {
            background: transparent;
        }

        #messages::-webkit-scrollbar-thumb {
            background: var(--scrollbar-thumb);
            border-radius: 5px;
        }

        #messages::-webkit-scrollbar-thumb:hover {
            background: var(--scrollbar-thumb-hover);
        }

        .message {
            max-width: 70%;
            padding: 16px 20px;
            border-radius: 20px;
            line-height: 1.6;
            animation: slideIn 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .user-message {
            align-self: flex-end;
            background: linear-gradient(135deg, var(--user-message-start) 0%, var(--user-message-end) 100%);
            color: var(--button-text);
            border-bottom-right-radius: 6px;
        }

        .ai-message {
            align-self: flex-start;
            background: var(--ai-message-bg);
            color: var(--primary-text);
            border: 2px solid var(--ai-message-border);
            border-bottom-left-radius: 6px;
        }

        .code-block-wrapper {
            margin: 15px 0;
            border-radius: 12px;
            overflow: hidden;
            background: var(--code-block-bg);
            border: 2px solid var(--ai-message-border);
        }

        .code-block-header {
            background: linear-gradient(135deg, var(--code-block-header-start) 0%, var(--code-block-header-end) 100%);
            padding: 10px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .code-language {
            color: var(--button-text);
            font-size: 13px;
            font-weight: 600;
        }

        .copy-button {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            padding: 6px 14px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .copy-button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.05);
        }

        .code-block-wrapper pre {
            margin: 0;
            padding: 16px;
            overflow-x: auto;
            background: var(--code-block-bg);
        }

        .code-block-wrapper code {
            color: var(--secondary-bg);
            font-family: 'Courier New', monospace;
            font-size: 14px;
        }

        #input-container {
            padding: 20px;
            background: var(--card-bg);
            border-top: 2px solid var(--input-border);
            display: flex;
            gap: 12px;
            align-items: center;
        }

        #pdf-upload {
            display: none;
        }

        #pdf-button {
            padding: 12px 20px;
            background: var(--input-bg);
            color: var(--primary);
            border: 2px solid var(--primary);
            border-radius: 12px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        #pdf-button:hover {
            background: var(--session-item-hover);
            transform: scale(1.05);
        }

        #user-input {
            flex: 1;
            padding: 16px;
            border: 2px solid var(--input-border);
            border-radius: 12px;
            background: var(--input-bg);
            color: var(--primary-text);
            font-size: 15px;
            resize: none;
            transition: all 0.3s ease;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        #user-input:focus {
            outline: none;
            border-color: var(--input-focus);
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
            background: var(--card-bg);
        }

        #send-button, #clear-button {
            padding: 12px 24px;
            background: linear-gradient(135deg, var(--button-gradient-start) 0%, var(--button-gradient-end) 100%);
            color: var(--button-text);
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-size: 15px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        #send-button:hover, #clear-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        #send-button:active, #clear-button:active {
            transform: translateY(0);
        }

        #pdf-status {
            padding: 12px;
            background: var(--input-bg);
            border-radius: 12px;
            display: none;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
            border: 2px solid var(--primary);
        }

        .pdf-name {
            flex: 1;
            color: var(--primary-text);
            font-size: 14px;
            font-weight: 600;
        }

        .remove-pdf {
            background: #ef4444;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .remove-pdf:hover {
            background: #dc2626;
            transform: scale(1.05);
        }

        /* Theme Selector Styles */
        .theme-selector {
            position: absolute;
            left: 24px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .theme-button {
            padding: 8px 16px;
            background: var(--card-bg);
            color: var(--primary);
            border: 2px solid var(--primary);
            border-radius: 12px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .theme-button:hover {
            background: var(--input-bg);
            transform: scale(1.05);
        }

        .theme-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            margin-top: 8px;
            background: var(--card-bg);
            border: 2px solid var(--card-border);
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            min-width: 200px;
            display: none;
            z-index: 1000;
            max-height: 400px;
            overflow-y: auto;
        }

        .theme-dropdown.show {
            display: block;
        }

        .theme-option {
            padding: 12px 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            border-bottom: 1px solid var(--input-border);
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--primary-text);
        }

        .theme-option:last-child {
            border-bottom: none;
        }

        .theme-option:hover {
            background: var(--session-item-hover);
        }

        .theme-option.active {
            background: var(--primary);
            color: white;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div id="auth-screen">
        <div class="auth-container">
            <div class="logo-container">🐴</div>
            <h2>Monty AI</h2>
            <p>Enter your secret key to continue</p>
            <input type="password" id="access-code" class="auth-input" placeholder="Enter your secret key" />
            <button id="auth-button" class="auth-button">Authenticate</button>
            <button id="request-key-button" class="request-key-button">📧 Request A Secret Key</button>
            <div id="auth-error" class="auth-error"></div>
        </div>
    </div>

    <div id="chat-screen">
        <div id="sidebar">
            <div class="sidebar-header">Chat History</div>
            <div id="session-list"></div>
        </div>

        <div id="main-chat">
            <div id="chat-header">
                <div class="theme-selector">
                    <button class="theme-button" id="theme-button">
                        <span id="current-theme-flag">🇮🇱</span>
                        <span id="current-theme-name">ACS - Israel Light</span>
                    </button>
                    <div class="theme-dropdown" id="theme-dropdown">
                        <!-- Theme options will be populated by JavaScript -->
                    </div>
                </div>
                <div class="header-title">
                    <span class="header-emoji">🐴</span> Monty AI
                </div>
                <div class="user-info" style="display: none;">
                    <span class="user-icon">👤</span>
                    <span class="user-name" id="user-name-display"></span>
                </div>
            </div>
            <div id="messages"></div>
            <div id="input-container">
                <div id="pdf-status">
                    <span class="pdf-name"></span>
                    <button class="remove-pdf">Remove</button>
                </div>
                <input type="file" id="pdf-upload" accept=".pdf" />
                <button id="pdf-button">📄 PDF</button>
                <textarea id="user-input" rows="1" placeholder="Type your message here..."></textarea>
                <button id="send-button">Send</button>
                <button id="clear-button">Clear</button>
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.min.js"></script>
    <script>
        const vscode = acquireVsCodeApi();
        let conversationHistory = [];
        let uploadedPdfText = null;
        let uploadedPdfName = null;
        let currentTheme = 'israel-light';

        // Available themes
        const availableThemes = ${themesData};

        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js';

        // Initialize theme selector
        function initializeThemeSelector() {
            const themeDropdown = document.getElementById('theme-dropdown');

            availableThemes.forEach(theme => {
                const option = document.createElement('div');
                option.className = 'theme-option';
                if (theme.name === currentTheme) {
                    option.classList.add('active');
                }
                option.innerHTML = \`<span>\${theme.flag}</span> <span>\${theme.displayName}</span>\`;
                option.onclick = () => selectTheme(theme);
                themeDropdown.appendChild(option);
            });
        }

        // Apply theme function
        function applyTheme(theme) {
            const root = document.documentElement;
            const c = theme.colors;
            const t = theme.translations;

            root.style.setProperty('--primary-bg', c.primaryBg);
            root.style.setProperty('--secondary-bg', c.secondaryBg);
            root.style.setProperty('--gradient-bg', c.gradientBg);
            root.style.setProperty('--primary-text', c.primaryText);
            root.style.setProperty('--secondary-text', c.secondaryText);
            root.style.setProperty('--primary', c.primary);
            root.style.setProperty('--primary-hover', c.primaryHover);
            root.style.setProperty('--secondary', c.secondary);
            root.style.setProperty('--card-bg', c.cardBg);
            root.style.setProperty('--card-border', c.cardBorder);
            root.style.setProperty('--input-bg', c.inputBg);
            root.style.setProperty('--input-border', c.inputBorder);
            root.style.setProperty('--input-focus', c.inputFocus);
            root.style.setProperty('--button-gradient-start', c.buttonGradientStart);
            root.style.setProperty('--button-gradient-end', c.buttonGradientEnd);
            root.style.setProperty('--button-text', c.buttonText);
            root.style.setProperty('--user-message-start', c.userMessageGradientStart);
            root.style.setProperty('--user-message-end', c.userMessageGradientEnd);
            root.style.setProperty('--ai-message-bg', c.aiMessageBg);
            root.style.setProperty('--ai-message-border', c.aiMessageBorder);
            root.style.setProperty('--sidebar-bg', c.sidebarBg);
            root.style.setProperty('--sidebar-header', c.sidebarHeader);
            root.style.setProperty('--session-item-bg', c.sessionItemBg);
            root.style.setProperty('--session-item-hover', c.sessionItemHover);
            root.style.setProperty('--session-item-active', c.sessionItemActive);
            root.style.setProperty('--scrollbar-thumb', c.scrollbarThumb);
            root.style.setProperty('--scrollbar-thumb-hover', c.scrollbarThumbHover);
            root.style.setProperty('--scrollbar-track', c.scrollbarTrack);
            root.style.setProperty('--code-block-bg', c.codeBlockBg);
            root.style.setProperty('--code-block-header-start', c.codeBlockHeaderStart);
            root.style.setProperty('--code-block-header-end', c.codeBlockHeaderEnd);

            // Update current theme display
            document.getElementById('current-theme-flag').textContent = theme.flag;
            document.getElementById('current-theme-name').textContent = theme.displayName;

            // Apply translations
            const sidebarHeader = document.querySelector('.sidebar-header');
            if (sidebarHeader) sidebarHeader.textContent = t.chatHistory;

            const userInput = document.getElementById('user-input');
            if (userInput) userInput.placeholder = t.typeMessage;

            const sendButton = document.getElementById('send-button');
            if (sendButton) sendButton.textContent = t.send;

            const clearButton = document.getElementById('clear-button');
            if (clearButton) clearButton.textContent = t.clear;

            const pdfButton = document.getElementById('pdf-button');
            if (pdfButton) pdfButton.textContent = t.pdfButton;

            const authInput = document.getElementById('access-code');
            if (authInput) authInput.placeholder = t.enterSecretKey;

            const authButton = document.getElementById('auth-button');
            if (authButton) authButton.textContent = t.authenticate;

            const requestKeyButton = document.getElementById('request-key-button');
            if (requestKeyButton) requestKeyButton.textContent = t.requestSecretKey;

            // Save theme and system prompt to localStorage
            localStorage.setItem('monty-theme', theme.name);
            localStorage.setItem('monty-system-prompt', theme.translations.systemPrompt);
        }

        // Select theme function
        function selectTheme(theme) {
            currentTheme = theme.name;
            applyTheme(theme);

            // Update active state in dropdown
            document.querySelectorAll('.theme-option').forEach(opt => {
                opt.classList.remove('active');
            });
            event.target.closest('.theme-option').classList.add('active');

            // Close dropdown
            document.getElementById('theme-dropdown').classList.remove('show');
        }

        // Theme button toggle
        document.getElementById('theme-button').addEventListener('click', () => {
            document.getElementById('theme-dropdown').classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.theme-selector')) {
                document.getElementById('theme-dropdown').classList.remove('show');
            }
        });

        // Load saved theme from localStorage
        window.addEventListener('DOMContentLoaded', () => {
            const savedTheme = localStorage.getItem('monty-theme');
            if (savedTheme) {
                const theme = availableThemes.find(t => t.name === savedTheme);
                if (theme) {
                    currentTheme = savedTheme;
                    applyTheme(theme);
                }
            }
            initializeThemeSelector();
        });

        document.getElementById('auth-button').addEventListener('click', () => {
            const code = document.getElementById('access-code').value.trim();
            if (code) {
                vscode.postMessage({
                    command: 'authenticate',
                    code: code
                });
            }
        });

        document.getElementById('access-code').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('auth-button').click();
            }
        });

        document.getElementById('request-key-button').addEventListener('click', () => {
            vscode.postMessage({
                command: 'requestLicense'
            });
        });

        document.getElementById('pdf-button').addEventListener('click', () => {
            document.getElementById('pdf-upload').click();
        });

        document.getElementById('pdf-upload').addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file && file.type === 'application/pdf') {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let fullText = '';

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item) => item.str).join(' ');
                    fullText += pageText + '\\n';
                }

                uploadedPdfText = fullText;
                uploadedPdfName = file.name;

                document.querySelector('.pdf-name').textContent = file.name;
                document.getElementById('pdf-status').style.display = 'flex';
            }
        });

        document.querySelector('.remove-pdf').addEventListener('click', () => {
            uploadedPdfText = null;
            uploadedPdfName = null;
            document.getElementById('pdf-upload').value = '';
            document.getElementById('pdf-status').style.display = 'none';
        });

        document.getElementById('send-button').addEventListener('click', () => {
            const input = document.getElementById('user-input');
            const text = input.value.trim();

            if (text) {
                addMessage(text, 'user');

                const systemPrompt = localStorage.getItem('monty-system-prompt') || 'You are a helpful AI assistant.';

                if (uploadedPdfText) {
                    vscode.postMessage({
                        command: 'sendPdf',
                        text: text,
                        pdfText: uploadedPdfText,
                        history: conversationHistory,
                        systemPrompt: systemPrompt
                    });
                    uploadedPdfText = null;
                    uploadedPdfName = null;
                    document.getElementById('pdf-upload').value = '';
                    document.getElementById('pdf-status').style.display = 'none';
                } else {
                    vscode.postMessage({
                        command: 'sendMessage',
                        text: text,
                        history: conversationHistory,
                        systemPrompt: systemPrompt
                    });
                }

                conversationHistory.push({ role: 'user', content: text });
                input.value = '';
            }
        });

        document.getElementById('user-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                document.getElementById('send-button').click();
            }
        });

        document.getElementById('clear-button').addEventListener('click', () => {
            vscode.postMessage({ command: 'clearChat' });
        });

        function addMessage(text, sender) {
            const messagesDiv = document.getElementById('messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = sender === 'user' ? 'message user-message' : 'message ai-message';
            messageDiv.innerHTML = text;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        function loadSessions(sessions, currentSessionId) {
            const sessionList = document.getElementById('session-list');
            sessionList.innerHTML = '';

            sessions.sort((a, b) => b.createdAt - a.createdAt);

            sessions.forEach(session => {
                const sessionItem = document.createElement('div');
                sessionItem.className = 'session-item';
                if (session.id === currentSessionId) {
                    sessionItem.classList.add('active');
                }

                const sessionName = document.createElement('div');
                sessionName.className = 'session-name';
                sessionName.textContent = session.name;

                const sessionDate = document.createElement('div');
                sessionDate.className = 'session-date';
                const date = new Date(session.createdAt);
                if (isNaN(date.getTime())) {
                    sessionDate.textContent = 'Recent';
                } else {
                    const options = {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    };
                    sessionDate.textContent = date.toLocaleString('en-US', options);
                }

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-session';
                deleteBtn.textContent = '×';
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    vscode.postMessage({
                        command: 'deleteSession',
                        sessionId: session.id
                    });
                };

                sessionItem.appendChild(sessionName);
                sessionItem.appendChild(sessionDate);
                sessionItem.appendChild(deleteBtn);

                sessionItem.onclick = () => {
                    vscode.postMessage({
                        command: 'loadSession',
                        sessionId: session.id
                    });
                };

                sessionList.appendChild(sessionItem);
            });
        }

        function copyCode(button) {
            const codeBlock = button.closest('.code-block-wrapper').querySelector('code');
            const code = codeBlock.textContent;

            navigator.clipboard.writeText(code).then(() => {
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 2000);
            });
        }

        window.addEventListener('message', event => {
            const message = event.data;

            if (message.command === 'authResult') {
                if (message.success) {
                    document.getElementById('auth-screen').style.display = 'none';
                    document.getElementById('chat-screen').style.display = 'flex';

                    // Display user name
                    if (message.userName) {
                        document.getElementById('user-name-display').textContent = message.userName;
                        document.querySelector('.user-info').style.display = 'flex';
                    }

                    vscode.postMessage({ command: 'requestSessions' });
                } else {
                    const errorDiv = document.getElementById('auth-error');
                    errorDiv.textContent = message.message;
                    errorDiv.style.display = 'block';
                }
            }

            if (message.command === 'receiveMessage') {
                addMessage(message.text, 'ai');
                conversationHistory.push({ role: 'assistant', content: message.text });
            }

            if (message.command === 'sessionsLoaded') {
                loadSessions(message.sessions, message.currentSessionId);
            }

            if (message.command === 'sessionLoaded') {
                const messagesDiv = document.getElementById('messages');
                messagesDiv.innerHTML = '';
                conversationHistory = [];

                message.messages.forEach(msg => {
                    addMessage(msg.content, msg.role);
                    conversationHistory.push({ role: msg.role, content: msg.content });
                });
            }

            if (message.command === 'chatCleared') {
                const messagesDiv = document.getElementById('messages');
                messagesDiv.innerHTML = '';
                conversationHistory = [];
            }

            if (message.command === 'sessionDeleted') {
                const messagesDiv = document.getElementById('messages');
                messagesDiv.innerHTML = '';
                conversationHistory = [];
            }
        });
    </script>
</body>
</html>`;
}
