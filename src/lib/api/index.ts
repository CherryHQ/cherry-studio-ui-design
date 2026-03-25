// ===========================
// Services barrel export
// ===========================

export {
  request, get, post, put, del, upload,
  streamRequest,
  setAccessToken, getAccessToken,
  onApiError,
  ApiError,
} from './apiClient';

export {
  getSessions, createSession, deleteSession,
  getMessages, sendMessage, sendMessageStream, stopGeneration,
} from './chatService';

export {
  uploadFile, getResources, createResource, updateResource, deleteResource,
  uploadKnowledgeDoc,
} from './resourceService';

export { initGlobalErrorHandler } from './errorHandler';
