declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: number;
    WORK_START_TIME: number;
    WORK_END_TIME: number;
  }
}
