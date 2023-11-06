export const PROCESS_STATUS = {
  PARSING: "parsing",
  RETRY_PARSING: "retry_parsing",
  ABORDTED: "aborted",
  FINISHED: "finished",
  IDLE: "idle",
} as const;

export type ProcessStatus = typeof PROCESS_STATUS[keyof typeof PROCESS_STATUS];

export const PARSE_EVENTS = {
  ERROR: "parse:error",
  START: "parse:start",
  PROGRESS: "parse:progress",
  STATUS: "parse:status",
  CURRENT_URL: "parse:currentUrl",
  ABORT: "parse:abort",
  LOG: "parse:log",
  TOGGLE_PARSE_WINDOW: "parse:window:toggle",
} as const;

export type ParseStatus = typeof PARSE_EVENTS[keyof typeof PARSE_EVENTS];

export type ParseResult = {
  info: {
    id: string;
    name: string;
    uploads: number;
    subscribers: string;
    views: number;
    country: string;
    type: string;
    created: string;
  };
  viewers: any[];
  subscribers: any[];
};

export type FullParseResult = {
  [key: string]: ParseResult;
};
