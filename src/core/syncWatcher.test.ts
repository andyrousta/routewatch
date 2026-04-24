import * as fs from 'fs';
import * as path from 'path';
import { startWatcher, stopWatcher } from './syncWatcher';
import * as docGenerator from './docGenerator';
import * as routeExtractor from './routeExtractor';

jest.mock('fs');
jest.mock('./docGenerator');
jest.mock('./routeExtractor');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockGenerateDoc = docGenerator.generateDoc as jest.Mock;
const mockExtractRoutes = routeExtractor.extractRoutes as jest.Mock;

describe('syncWatcher', () => {
  let mockApp: any;
  let mockWatcher: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApp = {};
    mockWatcher = { close: jest.fn() };

    mockExtractRoutes.mockReturnValue([
      { method: 'GET', path: '/api/users' },
    ]);
    mockGenerateDoc.mockReturnValue('# API Docs\n\n- GET /api/users');

    mockFs.existsSync = jest.fn().mockReturnValue(true);
    mockFs.mkdirSync = jest.fn();
    mockFs.writeFileSync = jest.fn();
    mockFs.watch = jest.fn().mockReturnValue(mockWatcher);
  });

  it('should write initial docs on start', () => {
    startWatcher(mockApp, './src');

    expect(mockExtractRoutes).toHaveBeenCalledWith(mockApp);
    expect(mockGenerateDoc).toHaveBeenCalled();
    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      './API_DOCS.md',
      '# API Docs\n\n- GET /api/users',
      'utf-8'
    );
  });

  it('should use custom outputPath and format from options', () => {
    startWatcher(mockApp, './src', { outputPath: './docs/api.json', format: 'json' });

    expect(mockGenerateDoc).toHaveBeenCalledWith(expect.any(Array), 'json');
    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      './docs/api.json',
      expect.any(String),
      'utf-8'
    );
  });

  it('should create output directory if it does not exist', () => {
    mockFs.existsSync = jest.fn().mockReturnValue(false);
    startWatcher(mockApp, './src', { outputPath: './new-dir/docs.md' });
    expect(mockFs.mkdirSync).toHaveBeenCalledWith('./new-dir', { recursive: true });
  });

  it('should stop the watcher and clear timers', () => {
    const watcher = startWatcher(mockApp, './src');
    stopWatcher(watcher);
    expect(mockWatcher.close).toHaveBeenCalled();
  });
});
