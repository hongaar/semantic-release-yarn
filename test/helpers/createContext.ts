import { WritableStreamBuffer } from "stream-buffers";
import { directory } from "tempy";

export function createContext() {
  return {
    cwd: directory(),
    logger: { log: jest.fn(), error: jest.fn(), success: jest.fn() },
    stdout: new WritableStreamBuffer(),
    stderr: new WritableStreamBuffer(),
  };
}
