import { ipcRenderer } from "electron";
import React, { FC, useContext, useEffect, useReducer } from "react";
import { ProcessStatus, PROCESS_STATUS, PARSE_EVENTS } from "../../main/model";

export type SharedData = {
  channels: string[];
  progress: number;
  errors: Array<{ channel: string; error: string }>;
  currentUrl: string;
  status: ProcessStatus;
  resetData: () => void;
};

const initialState: SharedData = {
  channels: [],
  progress: 0,
  errors: [],
  currentUrl: "",
  status: PROCESS_STATUS.IDLE,
  resetData: () => {
    return void true;
  },
};

const reducer = (state: SharedData, action: { type: string; payload: any }) => {
  switch (action.type) {
    case "SET_CHANNELS": {
      return {
        ...state,
        channels: action.payload,
      };
    }
    case "SET_PROGRESS": {
      return {
        ...state,
        progress: action.payload,
      };
    }
    case "SET_STATUS": {
      return {
        ...state,
        status: action.payload,
      };
    }
    case "SET_CURRENT_URL":
      return {
        ...state,
        currentUrl: action.payload,
      };
    case "HANDLE_ERROR":
      return {
        ...state,
        errors: [...state.errors, action.payload],
      };
    case "RESET":
      return {
        ...initialState,
        channels: state.channels,
      };
    case "RESET_CHANNELS":
      return {
        ...state,
        channels: [],
      };
    default:
      return state;
  }
};

type ParseContextValue = {
  state: SharedData;
  dispatch: React.Dispatch<{ type: string; payload: any }>;
};

export const ParseContext = React.createContext<ParseContextValue>(
  {} as ParseContextValue
);

export const useParseContext = () => {
  return useContext(ParseContext);
};
const ParseProvider: FC<{ children: any }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    ipcRenderer.on(PARSE_EVENTS.START, () => {
      dispatch({ type: "RESET", payload: null });
    });
    ipcRenderer.on(PARSE_EVENTS.ERROR, (_, errorData) => {
      dispatch({ type: "HANDLE_ERROR", payload: errorData });
    });
    ipcRenderer.on(PARSE_EVENTS.PROGRESS, (_, progress) => {
      dispatch({ type: "SET_PROGRESS", payload: progress });
    });
    ipcRenderer.on(PARSE_EVENTS.STATUS, (_, status) => {
      dispatch({ type: "SET_STATUS", payload: status });
    });
    ipcRenderer.on(PARSE_EVENTS.CURRENT_URL, (_, url) => {
      dispatch({ type: "SET_CURRENT_URL", payload: url });
    });
  }, []);

  return (
    <ParseContext.Provider value={{ state, dispatch }}>
      {children}
    </ParseContext.Provider>
  );
};
export { ParseProvider };
