import { WritableStreamBuffer } from "stream-buffers";
export declare function createContext(): {
  cwd: string;
  logger: {
    log: jest.Mock<any, any>;
    error: jest.Mock<any, any>;
    success: jest.Mock<any, any>;
  };
  stdout: WritableStreamBuffer;
  stderr: WritableStreamBuffer;
};
