import { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppAction, FlowStep, MoodOption, BrandKit, UnsplashPhoto } from '../types';

const SESSION_KEY = 'mb_session_id';

function getOrCreateSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

const INITIAL_STATE: AppState = {
  step: 'brief',
  brief: '',
  projectName: '',
  moods: [],
  selectedMood: null,
  brandKit: null,
  images: [],
  projectId: null,
  loading: false,
  loadingStep: null,
  error: null,
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_BRIEF':
      return { ...state, brief: action.brief, error: null };
    case 'SET_PROJECT_NAME':
      return { ...state, projectName: action.name };
    case 'SET_MOODS':
      return { ...state, moods: action.moods, loading: false, loadingStep: null, error: null };
    case 'SELECT_MOOD':
      return { ...state, selectedMood: action.mood, projectName: action.mood.name };
    case 'SET_BRAND_KIT':
      return { ...state, brandKit: action.brandKit, loading: false, loadingStep: null, error: null };
    case 'PATCH_BRAND_KIT':
      if (!state.brandKit) return state;
      return { ...state, brandKit: { ...state.brandKit, ...action.patch } };
    case 'SET_IMAGES':
      return { ...state, images: action.images };
    case 'SET_PROJECT_ID':
      return { ...state, projectId: action.projectId };
    case 'SET_FLOW_STEP':
      return { ...state, step: action.step };
    case 'SET_LOADING':
      return { ...state, loading: action.loading, loadingStep: action.loadingStep ?? null };
    case 'SET_ERROR':
      return { ...state, error: action.error, loading: false, loadingStep: null };
    case 'RESET':
      return { ...INITIAL_STATE };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  sessionId: string;
  goTo: (step: FlowStep) => void;
  reset: () => void;
  setLoading: (loading: boolean, step?: string) => void;
  setError: (error: string | null) => void;
  setMoods: (moods: MoodOption[]) => void;
  selectMood: (mood: MoodOption) => void;
  setBrandKit: (brandKit: BrandKit) => void;
  setImages: (images: UnsplashPhoto[]) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [sessionId] = useReducer(() => getOrCreateSessionId(), getOrCreateSessionId());

  const goTo = (step: FlowStep) => dispatch({ type: 'SET_FLOW_STEP', step });
  const reset = () => dispatch({ type: 'RESET' });
  const setLoading = (loading: boolean, step?: string) =>
    dispatch({ type: 'SET_LOADING', loading, loadingStep: step });
  const setError = (error: string | null) => dispatch({ type: 'SET_ERROR', error });
  const setMoods = (moods: MoodOption[]) => dispatch({ type: 'SET_MOODS', moods });
  const selectMood = (mood: MoodOption) => dispatch({ type: 'SELECT_MOOD', mood });
  const setBrandKit = (brandKit: BrandKit) => dispatch({ type: 'SET_BRAND_KIT', brandKit });
  const setImages = (images: UnsplashPhoto[]) => dispatch({ type: 'SET_IMAGES', images });

  return (
    <AppContext.Provider value={{
      state, dispatch, sessionId,
      goTo, reset, setLoading, setError,
      setMoods, selectMood, setBrandKit, setImages,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
