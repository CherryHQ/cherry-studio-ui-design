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
  /** Open the global Settings overlay, optionally jumping to a specific section */
  openSettings: (section?: string) => void;
  /**
   * Open a tile from the Launchpad page. Target uses the same id namespace
   * as the legacy new-tab dialog: built-in menu id ("chat"), agent id
   * ("agent:<id>"), or html-artifact key ("html:pinned:<id>" /
   * "html:<staticKey>").
   */
  launchpadOpen: (target: string) => void;
  /**
   * iPhone-style "add to dock": pin a Launchpad tile to the sidebar so
   * the user can reach it without re-opening the Launchpad. For
   * `function` kind the id is the menuItem id (un-hides in the sidebar);
   * `miniapp` / `artifact` are surface placeholders for now.
   */
  pinToSidebar: (kind: 'function' | 'miniapp' | 'artifact', id: string, label?: string) => void;
  /** Inverse of pinToSidebar — invoked from the sidebar's right-click. */
  unpinFromSidebar: (kind: 'function' | 'miniapp' | 'artifact', id: string) => void;
  /**
   * Navigate to the Launchpad tab. When `editMode` is true, the
   * launchpad enters iPhone-jiggle "edit home screen" mode — tiles
   * grow a delete corner badge and the page shows a 完成 exit affordance.
   * Wired to the sidebar item's right-click "管理" entry.
   */
  openLaunchpad: (editMode?: boolean) => void;
  /**
   * Hide a mini-app or artifact tile from the Launchpad. Functions stay
   * built-in (only `hiddenApps` toggles their sidebar visibility, not
   * launchpad visibility).
   */
  removeFromLaunchpad: (kind: 'miniapp' | 'artifact', id: string) => void;
}

/** Mutable state values consumed by pages */
export interface GlobalActionState {
  /** Resource ID that Library should open in edit mode (if any) */
  libraryEditResourceId: string | null;
  /** Pre-selected create type when Library was opened from agent/assistant run page */
  libraryCreateType: 'agent' | 'assistant' | null;
  /**
   * Namespaced ids of tiles the user has removed from the launchpad
   * (e.g. `miniapp:gemini`, `artifact:roadmap`). The LaunchpadPage
   * filters its grids against this set.
   */
  removedFromLaunchpad: Set<string>;
  /**
   * iPhone-jiggle edit mode for the launchpad — tiles grow a sidebar
   * pin/unpin corner badge and shake. Toggled from the sidebar's
   * right-click 管理.
   */
  launchpadEditMode: boolean;
  /** Setter so LaunchpadPage's 完成 button can exit edit mode. */
  setLaunchpadEditMode: (v: boolean) => void;
  /**
   * Menu item ids the user has hidden from the sidebar. Exposed so the
   * Launchpad's edit mode can render each function tile's current
   * "in sidebar?" state on the toggle badge.
   */
  hiddenSidebarApps: Set<string>;
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
  launchpadOpen: noop,
  pinToSidebar: noop,
  unpinFromSidebar: noop,
  openLaunchpad: noop,
  removeFromLaunchpad: noop,
};

const defaultState: GlobalActionState = {
  libraryEditResourceId: null,
  libraryCreateType: null,
  removedFromLaunchpad: new Set<string>(),
  launchpadEditMode: false,
  setLaunchpadEditMode: noop,
  hiddenSidebarApps: new Set<string>(),
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
    launchpadOpen: value.launchpadOpen,
    pinToSidebar: value.pinToSidebar,
    unpinFromSidebar: value.unpinFromSidebar,
    openLaunchpad: value.openLaunchpad,
    removeFromLaunchpad: value.removeFromLaunchpad,
  }), [
    value.openMiniApp, value.pinTab, value.editAssistantInLibrary,
    value.navigateToKnowledge, value.navigateToLibrary, value.libraryReturn,
    value.changeTabTitle, value.openSettings, value.launchpadOpen,
    value.pinToSidebar, value.unpinFromSidebar, value.openLaunchpad,
    value.removeFromLaunchpad,
  ]);

  // Extract state (changes when libraryEditResourceId or libraryCreateType change)
  const state = useMemo<GlobalActionState>(() => ({
    libraryEditResourceId: value.libraryEditResourceId,
    libraryCreateType: value.libraryCreateType,
    removedFromLaunchpad: value.removedFromLaunchpad,
    launchpadEditMode: value.launchpadEditMode,
    setLaunchpadEditMode: value.setLaunchpadEditMode,
    hiddenSidebarApps: value.hiddenSidebarApps,
  }), [
    value.libraryEditResourceId, value.libraryCreateType, value.removedFromLaunchpad,
    value.launchpadEditMode, value.setLaunchpadEditMode, value.hiddenSidebarApps,
  ]);

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
