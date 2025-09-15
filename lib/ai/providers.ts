import {
    customProvider,
    extractReasoningMiddleware,
    wrapLanguageModel,
} from 'ai';
import { google } from '@ai-sdk/google';

export const myProvider = customProvider({
    languageModels: {
        'chat-model': google('gemini-2.0-flash-001'),
        'chat-model-reasoning': wrapLanguageModel({
            model: google('gemini-2.0-flash-001'),
            middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': google('gemini-2.0-flash-001'),
        'artifact-model': google('gemini-2.0-flash-001'),
    },
    imageModels: {
        'small-model': google.imageModel('gemini-2.0-flash-001'),
    },
});
