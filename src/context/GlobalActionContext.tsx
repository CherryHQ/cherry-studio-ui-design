import React, { createContext, useContext } from 'react';

/**
 * GlobalActionContext — Centralises cross-cutting navigation & action callbacks
 * so that deeply-nested page components can call them without prop-drilling
 * through MainContent → TabContent → Page.
 */

export interface GlobalActions {
  /** Open a MiniApp by descriptor */
  openMiniApp: (app: { id: string; name: string; color: string; initial: string; url: string; logoUrl?: string }) => void;
  /** Pin / un-pin a tab */
  pinTab: (tabId: string) => void;
  /** Navigate to the Library page and open the editor for a given assistant name */
  editAssistantInLibrary: (assistantName: string) => void;
  /** Navigate to the Knowledge page for a given knowledge-base name */
  navigateToKnowledge: (kbName: string) => void;
  /** Navigate to the Library page, optionally starting the create-flow for agent/assistant */
  navigateToLibrary: (createType?: 'agent' | 'assistant') => void;
  /** Return from Library back to the page that initiated the navigation */
  libraryReturn: () => void;
  /** Change the title of the currently-active tab */
  changeTabTitle: (title: string) => void;
  /** Open the global Settings overlay */
  openSettings: () => void;

  // --- State values consumed by pages ---
  /** Resource ID that Library should open in edit mode (if any) */
  libraryEditResourceId: string | null;
  /** Pre-selected create type when Library was opened from agent/assistant run page */
  libraryCreateType: 'agent' | 'assistant' | null;
}

const noop = () => {};

const GlobalActionContext = createContext<GlobalActions>({
  openMiniApp: noop,
  pinTab: noop,
  editAssistantInLibrary: noop,
  navigateToKnowledge: noop,
  navigateToLibrary: noop,
  libraryReturn: noop,
  changeTabTitle: noop,
  openSettings: noop,
  libraryEditResourceId: null,
  libraryCreateType: null,
});

export const GlobalActionProvider = GlobalActionContext.Provider;

export function useGlobalActions(): GlobalActions {
  return useContext(GlobalActionContext);
}
