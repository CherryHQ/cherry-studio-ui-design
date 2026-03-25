import React, { createContext, useContext, useMemo } from 'react';

/**
 * GlobalActionContext — Centralises cross-cutting navigation & action callbacks
 * so that deeply-nested page components can call them without prop-drilling
 * through MainContent -> TabContent -> Page.
 *
 * Split into two contexts for performance:
 * - GlobalActionFunctionsContext: stable action callbacks (rarely trigger re-renders)
 * - GlobalActionStateContext: mutable state values (only consumers who need state re-render)
 */

// ===========================
// Types
// ===========================

/** Stable action functions (references should be stable via useCallback) */
export interface GlobalActionFunctions {
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
}

/** Mutable state values consumed by pages */
export interface GlobalActionState {
  /** Resource ID that Library should open in edit mode (if any) */
  libraryEditResourceId: string | null;
  /** Pre-selected create type when Library was opened from agent/assistant run page */
  libraryCreateType: 'agent' | 'assistant' | null;
}

/** Combined interface for backward compatibility */
export interface GlobalActions extends GlobalActionFunctions, GlobalActionState {}

// ===========================
// Contexts
// ===========================

const noop = () => {};

const defaultFunctions: GlobalActionFunctions = {
  openMiniApp: noop,
  pinTab: noop,
  editAssistantInLibrary: noop,
  navigateToKnowledge: noop,
  navigateToLibrary: noop,
  libraryReturn: noop,
  changeTabTitle: noop,
  openSettings: noop,
};

const defaultState: GlobalActionState = {
  libraryEditResourceId: null,
  libraryCreateType: null,
};

const GlobalActionFunctionsContext = createContext<GlobalActionFunctions>(defaultFunctions);
const GlobalActionStateContext = createContext<GlobalActionState>(defaultState);

// ===========================
// Provider
// ===========================

interface GlobalActionProviderProps {
  value: GlobalActions;
  children: React.ReactNode;
}

/**
 * Provider that splits the combined GlobalActions into two contexts.
 * Action functions go into one context (stable reference, rarely changes).
 * State values go into another (changes when state updates).
 */
export function GlobalActionProvider({ value, children }: GlobalActionProviderProps) {
  // Extract functions (stable references from useCallback in parent)
  const functions = useMemo<GlobalActionFunctions>(() => ({
    openMiniApp: value.openMiniApp,
    pinTab: value.pinTab,
    editAssistantInLibrary: value.editAssistantInLibrary,
    navigateToKnowledge: value.navigateToKnowledge,
    navigateToLibrary: value.navigateToLibrary,
    libraryReturn: value.libraryReturn,
    changeTabTitle: value.changeTabTitle,
    openSettings: value.openSettings,
  }), [
    value.openMiniApp, value.pinTab, value.editAssistantInLibrary,
    value.navigateToKnowledge, value.navigateToLibrary, value.libraryReturn,
    value.changeTabTitle, value.openSettings,
  ]);

  // Extract state (changes when libraryEditResourceId or libraryCreateType change)
  const state = useMemo<GlobalActionState>(() => ({
    libraryEditResourceId: value.libraryEditResourceId,
    libraryCreateType: value.libraryCreateType,
  }), [value.libraryEditResourceId, value.libraryCreateType]);

  return (
    <GlobalActionFunctionsContext.Provider value={functions}>
      <GlobalActionStateContext.Provider value={state}>
        {children}
      </GlobalActionStateContext.Provider>
    </GlobalActionFunctionsContext.Provider>
  );
}

// ===========================
// Hooks
// ===========================

/**
 * Combined hook — backward compatible.
 * Returns both actions and state merged into one object.
 * Use this when you need both, or when migrating existing code.
 */
export function useGlobalActions(): GlobalActions {
  const functions = useContext(GlobalActionFunctionsContext);
  const state = useContext(GlobalActionStateContext);
  return useMemo(() => ({ ...functions, ...state }), [functions, state]);
}

/**
 * Hook for action functions only.
 * Components that only dispatch actions (not read state) should use this
 * to avoid unnecessary re-renders when state changes.
 */
export function useGlobalActionFunctions(): GlobalActionFunctions {
  return useContext(GlobalActionFunctionsContext);
}

/**
 * Hook for state values only.
 * Components that only read state should use this.
 */
export function useGlobalActionState(): GlobalActionState {
  return useContext(GlobalActionStateContext);
}
