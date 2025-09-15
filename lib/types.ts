import { z } from 'zod';
import type { getCurrentTime } from './ai/tools/time';
import type { addTask, editTask, deleteTask, listTasks, toggleAllTasks, clearCompletedTasks } from './ai/tools/task';
import type { createDocument } from './ai/tools/create-document';
import type { updateDocument } from './ai/tools/update-document';
import type { requestSuggestions } from './ai/tools/request-suggestions';
import type { InferUITool, UIMessage } from 'ai';

import type { ArtifactKind } from '@/components/artifact';
import type { Suggestion } from './db/schema';

export type DataPart = { type: 'append-message'; message: string };

export const messageMetadataSchema = z.object({
    createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

type getCurrentTime = InferUITool<typeof getCurrentTime>;
type addTaskTool = InferUITool<typeof addTask>;
type editTaskTool = InferUITool<typeof editTask>;
type deleteTaskTool = InferUITool<typeof deleteTask>;
type listTasksTool = InferUITool<typeof listTasks>;
type toggleAllTasksTool = InferUITool<typeof toggleAllTasks>;
type clearCompletedTasksTool = InferUITool<typeof clearCompletedTasks>;

type createDocumentTool = InferUITool<ReturnType<typeof createDocument>>;
type updateDocumentTool = InferUITool<ReturnType<typeof updateDocument>>;
type requestSuggestionsTool = InferUITool<
    ReturnType<typeof requestSuggestions>
>;

export type ChatTools = {
    getCurrentTime: getCurrentTime;
    addTask: addTaskTool;
    editTask: editTaskTool;
    deleteTask: deleteTaskTool;
    listTasks: listTasksTool;
    toggleAllTasks: toggleAllTasksTool;
    clearCompletedTasks: clearCompletedTasksTool;
    createDocument: createDocumentTool;
    updateDocument: updateDocumentTool;
    requestSuggestions: requestSuggestionsTool;
};

export type CustomUIDataTypes = {
    textDelta: string;
    imageDelta: string;
    sheetDelta: string;
    codeDelta: string;
    suggestion: Suggestion;
    appendMessage: string;
    id: string;
    title: string;
    kind: ArtifactKind;
    clear: null;
    finish: null;
};

export type ChatMessage = UIMessage<
    MessageMetadata,
    CustomUIDataTypes,
    ChatTools
>;

export interface Attachment {
    name: string;
    url: string;
    contentType: string;
}
