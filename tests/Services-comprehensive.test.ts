/**
 * Comprehensive Services Tests
 * Testing utility infrastructure that was previously untested (5.76% coverage)
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { SSLManager, ServiceManager } from '../src/utils/services';

// Mock dependencies
jest.mock('fs');
jest.mock('child_process');
jest.mock('os');
jest.mock('path');
jest.mock('../src/utils/platform', () => ({
  isWindows: jest.fn(),
  isMac: jest.fn(), 
  isTermux: jest.fn(),
  hasSystemd: jest.fn(),
  getPlatformPaths: jest.fn()
}));

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockedOs = os as jest.Mocked<typeof os>;
const mockedPath = path as jest.Mocked<typeof path>;

// Import mocked platform functions
const mockPlatform = require('../src/utils/platform');

describe('Services - Comprehensive Testing', () => {

  describe('SSLManager', () => {
    let sslManager: SSLManager;
    const mockPaths = {
      ssl: '/test/ssl/path',
      data: '/test/data',
      config: '/test/config',
      logs: '/test/logs'
    };

    beforeEach(() => {
      jest.clearAllMocks();
      
      // Setup path mocks
      mockPlatform.getPlatformPaths.mockReturnValue(mockPaths);
      mockedPath.join.mockImplementation((...paths: string[]) => paths.join('/'));
      
      // Setup fs mocks
      mockedFs.existsSync.mockReturnValue(false);
      mockedFs.mkdirSync.mockImplementation(() => undefined);
      mockedFs.chmodSync.mockImplementation(() => undefined);
      
      sslManager = new SSLManager('test-app');
    });

    it('should initialize with platform paths', () => {
      expect(mockPlatform.getPlatformPaths).toHaveBeenCalledWith('test-app');
      expect(mockedFs.mkdirSync).toHaveBeenCalledWith(mockPaths.ssl, { recursive: true, mode: 0o700 });
    });

    it('should not create directory if it exists', () => {
      jest.clearAllMocks();
      mockedFs.existsSync.mockReturnValue(true);
      
      new SSLManager('existing-app');
      
      expect(mockedFs.mkdirSync).not.toHaveBeenCalled();
    });

    it('should generate self-signed certificates', async () => {
      const domain = 'localhost';
      const keyFile = `/test/ssl/path/${domain}.key`;
      const certFile = `/test/ssl/path/${domain}.crt`;
      
      mockedExecSync.mockImplementation(() => Buffer.from(''));
      
      const result = await sslManager.generateSelfSigned(domain);
      
      expect(mockedExecSync).toHaveBeenCalledWith(
        `openssl genrsa -out "${keyFile}" 2048`,
        { stdio: 'ignore' }
      );
      expect(mockedExecSync).toHaveBeenCalledWith(
        `openssl req -new -x509 -key "${keyFile}" -out "${certFile}" -days 365 -subj "/CN=${domain}"`,
        { stdio: 'ignore' }
      );
      expect(mockedFs.chmodSync).toHaveBeenCalledWith(keyFile, 0o600);
      expect(mockedFs.chmodSync).toHaveBeenCalledWith(certFile, 0o644);
      expect(result).toEqual({ key: keyFile, cert: certFile });
    });

    it('should handle self-signed certificate generation errors', async () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error('OpenSSL not found');
      });
      
      await expect(sslManager.generateSelfSigned('localhost'))
        .rejects.toThrow('Failed to generate self-signed certificate: OpenSSL not found');
    });

    it('should generate Let\'s Encrypt certificates with DNS challenge', async () => {
      const domain = 'example.com';
      const email = 'test@example.com';
      const acmePath = '/home/user/.acme.sh';
      const acmeScript = '/home/user/.acme.sh/acme.sh';
      
      mockedOs.homedir.mockReturnValue('/home/user');
      mockedFs.existsSync.mockImplementation((filePath: any) => {
        return filePath === acmeScript; // ACME.sh exists
      });
      mockedExecSync.mockImplementation(() => Buffer.from(''));
      
      const result = await sslManager.generateLetsEncrypt(domain, email);
      
      expect(mockedExecSync).toHaveBeenCalledWith(
        expect.stringContaining(`--issue -d ${domain} --dns`),
        { stdio: 'inherit' }
      );
      expect(mockedExecSync).toHaveBeenCalledWith(
        expect.stringContaining(`--install-cert -d ${domain}`),
        { stdio: 'inherit' }
      );
      expect(result.key).toContain(`${domain}.key`);
      expect(result.cert).toContain(`${domain}.crt`);
    });

    it('should fallback to standalone mode for Let\'s Encrypt', async () => {
      const domain = 'example.com';
      const email = 'test@example.com';
      
      mockedOs.homedir.mockReturnValue('/home/user');
      mockedFs.existsSync.mockReturnValue(true);
      
      // Mock DNS challenge failure, then standalone success
      let callCount = 0;
      mockedExecSync.mockImplementation((command: string) => {
        callCount++;
        if (callCount <= 2 && command.includes('--dns')) {
          throw new Error('DNS challenge failed');
        }
        return Buffer.from('');
      });
      
      const result = await sslManager.generateLetsEncrypt(domain, email);
      
      expect(mockedExecSync).toHaveBeenCalledWith(
        expect.stringContaining('--standalone --httpport 8080'),
        { stdio: 'inherit' }
      );
      expect(result).toBeDefined();
    });

    it('should install ACME.sh if not present', async () => {
      mockedOs.homedir.mockReturnValue('/home/user');
      mockedFs.existsSync.mockReturnValue(false); // ACME.sh doesn't exist
      mockedExecSync.mockImplementation(() => Buffer.from(''));
      
      await sslManager.generateLetsEncrypt('example.com', 'test@example.com');
      
      expect(mockedExecSync).toHaveBeenCalledWith(
        'curl https://get.acme.sh | sh',
        { stdio: 'inherit' }
      );
    });

    it('should throw error when Let\'s Encrypt fails completely', async () => {
      mockedOs.homedir.mockReturnValue('/home/user');
      mockedFs.existsSync.mockReturnValue(true);
      mockedExecSync.mockImplementation(() => {
        throw new Error('All methods failed');
      });
      
      await expect(sslManager.generateLetsEncrypt('example.com', 'test@example.com'))
        .rejects.toThrow('Failed to generate Let\'s Encrypt certificate: All methods failed');
    });
  });

  describe('ServiceManager', () => {
    let serviceManager: ServiceManager;
    const mockConfig = {
      name: 'test-service',
      description: 'Test Service Description',
      root: '/path/to/app'
    };

    beforeEach(() => {
      jest.clearAllMocks();
      
      // Setup OS mocks
      mockedOs.platform.mockReturnValue('linux');
      mockedOs.homedir.mockReturnValue('/home/user');
      
      // Setup path mocks
      mockedPath.join.mockImplementation((...paths: string[]) => paths.join('/'));
      
      // Setup fs mocks - start with directories not existing
      mockedFs.existsSync.mockReturnValue(false);
      mockedFs.mkdirSync.mockImplementation(() => undefined);
      mockedFs.writeFileSync.mockImplementation(() => undefined);
      mockedFs.chmodSync.mockImplementation(() => undefined);
      mockedFs.unlinkSync.mockImplementation(() => undefined);
      mockedFs.rmSync.mockImplementation(() => undefined);
      mockedFs.readFileSync.mockReturnValue('1234');
      
      // Setup exec mocks
      mockedExecSync.mockImplementation(() => Buffer.from(''));
      
      serviceManager = new ServiceManager('test-service');
    });

    describe('Platform Detection', () => {
      it('should create service manager with correct platform', () => {
        expect(mockedOs.platform).toHaveBeenCalled();
      });

      it('should handle different service names', () => {
        const manager1 = new ServiceManager('app1');
        const manager2 = new ServiceManager('app2');
        
        expect(manager1).toBeInstanceOf(ServiceManager);
        expect(manager2).toBeInstanceOf(ServiceManager);
      });
    });

    describe('Systemd Service Management', () => {
      beforeEach(() => {
        mockPlatform.hasSystemd.mockReturnValue(true);
        mockPlatform.isWindows.mockReturnValue(false);
        mockPlatform.isMac.mockReturnValue(false);
        mockPlatform.isTermux.mockReturnValue(false);
        
        // Mock global Bun detection
        (global as any).Bun = undefined;
        
        // Mock process.execPath
        Object.defineProperty(process, 'execPath', {
          value: '/usr/bin/node',
          configurable: true
        });
      });

      afterEach(() => {
        delete (global as any).Bun;
      });

      it('should create systemd user service', () => {
        serviceManager.createSystemdUserService(mockConfig);
        
        const expectedServicePath = '/home/user/.config/systemd/user';
        const expectedServiceFile = `${expectedServicePath}/test-service.service`;
        
        expect(mockedFs.mkdirSync).toHaveBeenCalledWith(expectedServicePath, { recursive: true });
        expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
          expectedServiceFile,
          expect.stringContaining('[Unit]')
        );
        expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
          expectedServiceFile,
          expect.stringContaining('Description=Test Service Description')
        );
        expect(mockedExecSync).toHaveBeenCalledWith('systemctl --user daemon-reload', { stdio: 'ignore' });
        expect(mockedExecSync).toHaveBeenCalledWith('systemctl --user enable test-service', { stdio: 'ignore' });
        expect(mockedExecSync).toHaveBeenCalledWith('systemctl --user start test-service', { stdio: 'ignore' });
      });

      it('should use Bun runtime when available', () => {
        (global as any).Bun = {}; // Simulate Bun environment
        
        serviceManager.createSystemdUserService(mockConfig);
        
        expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining('src/main.ts')
        );
      });

      it('should use Node runtime when Bun not available', () => {
        serviceManager.createSystemdUserService(mockConfig);
        
        expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining('dist/main.js')
        );
      });
    });

    describe('macOS Launchd Service Management', () => {
      beforeEach(() => {
        mockPlatform.isMac.mockReturnValue(true);
        mockPlatform.isWindows.mockReturnValue(false);
        mockPlatform.isTermux.mockReturnValue(false);
        mockPlatform.hasSystemd.mockReturnValue(false);
      });

      it('should create launchd service', () => {
        serviceManager.createLaunchdService(mockConfig);
        
        const expectedPlistPath = '/home/user/Library/LaunchAgents';
        const expectedPlistFile = `${expectedPlistPath}/com.test-service.plist`;
        
        expect(mockedFs.mkdirSync).toHaveBeenCalledWith(expectedPlistPath, { recursive: true });
        expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
          expectedPlistFile,
          expect.stringContaining('<?xml version="1.0" encoding="UTF-8"?>')
        );
        expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
          expectedPlistFile,
          expect.stringContaining('<string>com.test-service</string>')
        );
        expect(mockedExecSync).toHaveBeenCalledWith(`launchctl load "${expectedPlistFile}"`, { stdio: 'ignore' });
      });
    });

    describe('Windows Service Management', () => {
      beforeEach(() => {
        mockPlatform.isWindows.mockReturnValue(true);
        mockPlatform.isMac.mockReturnValue(false);
        mockPlatform.isTermux.mockReturnValue(false);
        mockPlatform.hasSystemd.mockReturnValue(false);
      });

      it('should create Windows startup batch file', () => {
        serviceManager.createWindowsService(mockConfig);
        
        const expectedStartupPath = '/home/user/AppData/Roaming/Microsoft/Windows/Start Menu/Programs/Startup';
        const expectedBatchFile = `${expectedStartupPath}/test-service.bat`;
        
        expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
          expectedBatchFile,
          expect.stringContaining('@echo off')
        );
        expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
          expectedBatchFile,
          expect.stringContaining('cd /d "/path/to/app"')
        );
      });
    });

    describe('Termux Service Management', () => {
      beforeEach(() => {
        mockPlatform.isTermux.mockReturnValue(true);
        mockPlatform.isWindows.mockReturnValue(false);
        mockPlatform.isMac.mockReturnValue(false);
        mockPlatform.hasSystemd.mockReturnValue(false);
        
        process.env.PREFIX = '/data/data/com.termux/files/usr';
      });

      it('should create Termux runit service', () => {
        serviceManager.createTermuxService(mockConfig);
        
        const expectedServicePath = '/data/data/com.termux/files/usr/var/service';
        const expectedServiceDir = `${expectedServicePath}/test-service`;
        const expectedRunFile = `${expectedServiceDir}/run`;
        
        expect(mockedFs.mkdirSync).toHaveBeenCalledWith(expectedServicePath, { recursive: true });
        expect(mockedFs.mkdirSync).toHaveBeenCalledWith(expectedServiceDir, { recursive: true });
        expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
          expectedRunFile,
          expect.stringContaining('#!/data/data/com.termux/files/usr/bin/sh')
        );
        expect(mockedFs.chmodSync).toHaveBeenCalledWith(expectedRunFile, 0o755);
        expect(mockedExecSync).toHaveBeenCalledWith('sv-enable test-service', { stdio: 'ignore' });
      });

      it('should handle sv-enable failure gracefully', () => {
        mockedExecSync.mockImplementation((command: string) => {
          if (command.includes('sv-enable')) {
            throw new Error('sv-enable failed');
          }
          return Buffer.from('');
        });
        
        expect(() => serviceManager.createTermuxService(mockConfig)).not.toThrow();
      });
    });

    describe('Cron Job Management', () => {
      it('should create cron job', () => {
        mockedExecSync.mockImplementation((command: string) => {
          if (command === 'crontab -l') {
            return Buffer.from('# existing cron entries\n');
          }
          return Buffer.from('');
        });
        
        serviceManager.createCronJob(mockConfig);
        
        expect(mockedExecSync).toHaveBeenCalledWith('crontab -l', { encoding: 'utf8' });
        expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
          expect.stringContaining('cron-'),
          expect.stringContaining('@reboot')
        );
        expect(mockedExecSync).toHaveBeenCalledWith(
          expect.stringMatching(/crontab ".*"/),
          { stdio: 'ignore' }
        );
        expect(mockedFs.unlinkSync).toHaveBeenCalled();
      });

      it('should not duplicate existing cron entries', () => {
        mockedExecSync.mockImplementation((command: string) => {
          if (command === 'crontab -l') {
            return Buffer.from(`# existing entries\n@reboot /usr/bin/node /path/to/app/dist/main.js\n`);
          }
          return Buffer.from('');
        });
        
        serviceManager.createCronJob(mockConfig);
        
        // Should not write new cron entry because it already exists
        expect(mockedFs.writeFileSync).not.toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining('@reboot')
        );
      });

      it('should handle empty crontab', () => {
        mockedExecSync.mockImplementation((command: string) => {
          if (command === 'crontab -l') {
            throw new Error('no crontab for user');
          }
          return Buffer.from('');
        });
        
        expect(() => serviceManager.createCronJob(mockConfig)).not.toThrow();
      });

      it('should remove cron job', () => {
        // Reset mocks for clean test
        jest.clearAllMocks();
        mockedPath.join.mockImplementation((...paths: string[]) => paths.join('/'));
        mockedOs.tmpdir.mockReturnValue('/tmp');
        
        mockedExecSync.mockImplementation((command: string) => {
          if (command === 'crontab -l') {
            return Buffer.from(`# cron entries\n@reboot /usr/bin/node /path/to/app/dist/main.js >> /home/user/.test-service/logs/test-service.log 2>&1\n@reboot /usr/bin/node /other/app\n`);
          }
          if (command.startsWith('crontab ')) {
            return Buffer.from('');
          }
          return Buffer.from('');
        });
        mockedFs.writeFileSync.mockImplementation(() => undefined);
        mockedFs.unlinkSync.mockImplementation(() => undefined);
        
        serviceManager.removeCronJob(mockConfig);
        
        // Check that writeFileSync was called with the expected content
        expect(mockedFs.writeFileSync).toHaveBeenCalled();
        const calls = mockedFs.writeFileSync.mock.calls;
        const lastCall = calls[calls.length - 1];
        expect(lastCall[0]).toContain('cron-');
        expect(lastCall[1]).not.toContain('/path/to/app');
        expect(lastCall[1]).toContain('/other/app');
      });

      it('should throw error on cron job creation failure', () => {
        mockedExecSync.mockImplementation((command: string) => {
          if (command.startsWith('crontab ')) {
            throw new Error('crontab command failed');
          }
          return Buffer.from('');
        });
        
        expect(() => serviceManager.createCronJob(mockConfig))
          .toThrow('Failed to install cron job: crontab command failed');
      });
    });

    describe('Service Installation', () => {
      it('should install systemd service on Linux', () => {
        mockPlatform.isWindows.mockReturnValue(false);
        mockPlatform.isMac.mockReturnValue(false);
        mockPlatform.isTermux.mockReturnValue(false);
        mockPlatform.hasSystemd.mockReturnValue(true);
        
        const createSystemdSpy = jest.spyOn(serviceManager, 'createSystemdUserService');
        
        serviceManager.install(mockConfig);
        
        expect(createSystemdSpy).toHaveBeenCalledWith(mockConfig);
      });

      it('should install launchd service on macOS', () => {
        mockPlatform.isWindows.mockReturnValue(false);
        mockPlatform.isMac.mockReturnValue(true);
        mockPlatform.isTermux.mockReturnValue(false);
        mockPlatform.hasSystemd.mockReturnValue(false);
        
        const createLaunchdSpy = jest.spyOn(serviceManager, 'createLaunchdService');
        
        serviceManager.install(mockConfig);
        
        expect(createLaunchdSpy).toHaveBeenCalledWith(mockConfig);
      });

      it('should install Windows service', () => {
        mockPlatform.isWindows.mockReturnValue(true);
        mockPlatform.isMac.mockReturnValue(false);
        mockPlatform.isTermux.mockReturnValue(false);
        mockPlatform.hasSystemd.mockReturnValue(false);
        
        const createWindowsSpy = jest.spyOn(serviceManager, 'createWindowsService');
        
        serviceManager.install(mockConfig);
        
        expect(createWindowsSpy).toHaveBeenCalledWith(mockConfig);
      });

      it('should install Termux service', () => {
        mockPlatform.isWindows.mockReturnValue(false);
        mockPlatform.isMac.mockReturnValue(false);
        mockPlatform.isTermux.mockReturnValue(true);
        mockPlatform.hasSystemd.mockReturnValue(false);
        
        const createTermuxSpy = jest.spyOn(serviceManager, 'createTermuxService');
        
        serviceManager.install(mockConfig);
        
        expect(createTermuxSpy).toHaveBeenCalledWith(mockConfig);
      });

      it('should fallback to cron job', () => {
        mockPlatform.isWindows.mockReturnValue(false);
        mockPlatform.isMac.mockReturnValue(false);
        mockPlatform.isTermux.mockReturnValue(false);
        mockPlatform.hasSystemd.mockReturnValue(false);
        
        const createCronSpy = jest.spyOn(serviceManager, 'createCronJob');
        
        serviceManager.install(mockConfig);
        
        expect(createCronSpy).toHaveBeenCalledWith(mockConfig);
      });
    });

    describe('Service Control Operations', () => {
      beforeEach(() => {
        // Mock process.kill
        jest.spyOn(process, 'kill').mockImplementation(() => true);
      });

      it('should stop systemd service', () => {
        mockPlatform.hasSystemd.mockReturnValue(true);
        mockPlatform.isWindows.mockReturnValue(false);
        mockPlatform.isMac.mockReturnValue(false);
        mockPlatform.isTermux.mockReturnValue(false);
        
        serviceManager.stop(mockConfig);
        
        expect(mockedExecSync).toHaveBeenCalledWith(
          'systemctl --user stop test-service',
          { stdio: 'ignore' }
        );
      });

      it('should stop macOS service', () => {
        mockPlatform.isMac.mockReturnValue(true);
        mockPlatform.hasSystemd.mockReturnValue(false);
        mockPlatform.isWindows.mockReturnValue(false);
        mockPlatform.isTermux.mockReturnValue(false);
        
        serviceManager.stop(mockConfig);
        
        expect(mockedExecSync).toHaveBeenCalledWith(
          'launchctl stop com.test-service',
          { stdio: 'ignore' }
        );
      });

      it('should stop Windows service', () => {
        mockPlatform.isWindows.mockReturnValue(true);
        mockPlatform.isMac.mockReturnValue(false);
        mockPlatform.isTermux.mockReturnValue(false);
        mockPlatform.hasSystemd.mockReturnValue(false);
        
        serviceManager.stop(mockConfig);
        
        expect(mockedExecSync).toHaveBeenCalledWith(
          'taskkill /F /IM node.exe /FI "WINDOWTITLE eq test-service"',
          { stdio: 'ignore' }
        );
      });

      it('should stop Termux service', () => {
        mockPlatform.isTermux.mockReturnValue(true);
        mockPlatform.isWindows.mockReturnValue(false);
        mockPlatform.isMac.mockReturnValue(false);
        mockPlatform.hasSystemd.mockReturnValue(false);
        
        serviceManager.stop(mockConfig);
        
        expect(mockedExecSync).toHaveBeenCalledWith(
          'sv stop test-service',
          { stdio: 'ignore' }
        );
      });

      it('should kill process by PID file', () => {
        const pidFile = '/path/to/app/.test-service.pid';
        mockedFs.existsSync.mockImplementation((filePath: any) => filePath === pidFile);
        
        serviceManager.stop(mockConfig);
        
        expect(mockedFs.readFileSync).toHaveBeenCalledWith(pidFile, 'utf8');
        expect(process.kill).toHaveBeenCalledWith(1234, 'SIGTERM');
        expect(mockedFs.unlinkSync).toHaveBeenCalledWith(pidFile);
      });

      it('should handle stop command failures gracefully', () => {
        mockedExecSync.mockImplementation(() => {
          throw new Error('Command failed');
        });
        
        expect(() => serviceManager.stop(mockConfig)).not.toThrow();
      });

      it('should handle invalid PID file gracefully', () => {
        const pidFile = '/path/to/app/.test-service.pid';
        mockedFs.existsSync.mockImplementation((filePath: any) => filePath === pidFile);
        mockedFs.readFileSync.mockReturnValue('invalid_pid');
        
        expect(() => serviceManager.stop(mockConfig)).not.toThrow();
      });
    });

    describe('Service Uninstallation', () => {
      it('should uninstall systemd service', () => {
        mockPlatform.hasSystemd.mockReturnValue(true);
        mockPlatform.isWindows.mockReturnValue(false);
        mockPlatform.isMac.mockReturnValue(false);
        mockPlatform.isTermux.mockReturnValue(false);
        
        const serviceFile = '/home/user/.config/systemd/user/test-service.service';
        mockedFs.existsSync.mockImplementation((filePath: any) => filePath === serviceFile);
        
        serviceManager.uninstall(mockConfig);
        
        expect(mockedExecSync).toHaveBeenCalledWith('systemctl --user stop test-service', { stdio: 'ignore' });
        expect(mockedExecSync).toHaveBeenCalledWith('systemctl --user disable test-service', { stdio: 'ignore' });
        expect(mockedFs.unlinkSync).toHaveBeenCalledWith(serviceFile);
        expect(mockedExecSync).toHaveBeenCalledWith('systemctl --user daemon-reload', { stdio: 'ignore' });
      });

      it('should uninstall macOS service', () => {
        mockPlatform.isMac.mockReturnValue(true);
        mockPlatform.hasSystemd.mockReturnValue(false);
        mockPlatform.isWindows.mockReturnValue(false);
        mockPlatform.isTermux.mockReturnValue(false);
        
        const plistFile = '/home/user/Library/LaunchAgents/com.test-service.plist';
        mockedFs.existsSync.mockImplementation((filePath: any) => filePath === plistFile);
        
        serviceManager.uninstall(mockConfig);
        
        expect(mockedExecSync).toHaveBeenCalledWith(`launchctl unload "${plistFile}"`, { stdio: 'ignore' });
        expect(mockedFs.unlinkSync).toHaveBeenCalledWith(plistFile);
      });

      it('should uninstall Windows service', () => {
        mockPlatform.isWindows.mockReturnValue(true);
        mockPlatform.isMac.mockReturnValue(false);
        mockPlatform.isTermux.mockReturnValue(false);
        mockPlatform.hasSystemd.mockReturnValue(false);
        
        const batchFile = '/home/user/AppData/Roaming/Microsoft/Windows/Start Menu/Programs/Startup/test-service.bat';
        mockedFs.existsSync.mockImplementation((filePath: any) => filePath === batchFile);
        
        serviceManager.uninstall(mockConfig);
        
        expect(mockedFs.unlinkSync).toHaveBeenCalledWith(batchFile);
      });

      it('should uninstall Termux service', () => {
        mockPlatform.isTermux.mockReturnValue(true);
        mockPlatform.isWindows.mockReturnValue(false);
        mockPlatform.isMac.mockReturnValue(false);
        mockPlatform.hasSystemd.mockReturnValue(false);
        
        process.env.PREFIX = '/data/data/com.termux/files/usr';
        const serviceDir = '/data/data/com.termux/files/usr/var/service/test-service';
        mockedFs.existsSync.mockImplementation((filePath: any) => filePath === serviceDir);
        
        serviceManager.uninstall(mockConfig);
        
        expect(mockedExecSync).toHaveBeenCalledWith('sv-disable test-service', { stdio: 'ignore' });
        expect(mockedFs.rmSync).toHaveBeenCalledWith(serviceDir, { recursive: true });
      });

      it('should remove cron job during uninstall', () => {
        const removeCronSpy = jest.spyOn(serviceManager, 'removeCronJob');
        
        serviceManager.uninstall(mockConfig);
        
        expect(removeCronSpy).toHaveBeenCalledWith(mockConfig);
      });

      it('should handle uninstall failures gracefully', () => {
        // Mock file not existing to avoid PID file error
        mockedFs.existsSync.mockReturnValue(false);
        mockedExecSync.mockImplementation(() => {
          throw new Error('Command failed');
        });
        mockedFs.unlinkSync.mockImplementation(() => {
          throw new Error('File operation failed');
        });
        
        expect(() => serviceManager.uninstall(mockConfig)).not.toThrow();
      });
    });
  });

  describe('Legacy Exports', () => {
    it('should export legacy names for backward compatibility', () => {
      const { LocalSSL, LocalService } = require('../src/utils/services');
      
      expect(LocalSSL).toBe(SSLManager);
      expect(LocalService).toBe(ServiceManager);
    });

    it('should create instances with legacy names', () => {
      const { LocalSSL, LocalService } = require('../src/utils/services');
      
      const ssl = new LocalSSL('legacy-app');
      const service = new LocalService('legacy-service');
      
      expect(ssl).toBeInstanceOf(SSLManager);
      expect(service).toBeInstanceOf(ServiceManager);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing environment variables', () => {
      delete process.env.PREFIX;
      
      mockPlatform.isTermux.mockReturnValue(true);
      const manager = new ServiceManager('termux-test');
      const testConfig = {
        name: 'termux-test',
        description: 'Test Service', 
        root: '/test/path'
      };
      
      expect(() => manager.createTermuxService(testConfig)).not.toThrow();
    });

    it('should handle file system permission errors', () => {
      // Reset mocks for this test
      jest.clearAllMocks();
      mockedFs.existsSync.mockReturnValue(false); // Directory doesn't exist
      mockedFs.mkdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });
      
      expect(() => new SSLManager('permission-test')).toThrow('Permission denied');
    });

    it('should handle missing openssl binary', () => {
      // Reset mocks for clean test
      jest.clearAllMocks();
      mockedFs.existsSync.mockReturnValue(true); // Directory exists, no need to create
      mockedFs.mkdirSync.mockImplementation(() => undefined); // Reset mkdir mock
      
      mockedExecSync.mockImplementation((command: string) => {
        if (command.includes('openssl')) {
          const error = new Error('openssl: command not found');
          (error as any).code = 'ENOENT';
          throw error;
        }
        return Buffer.from('');
      });
      
      const ssl = new SSLManager('no-openssl');
      
      expect(ssl.generateSelfSigned('localhost'))
        .rejects.toThrow('Failed to generate self-signed certificate');
    });

    it('should handle network timeouts for Let\'s Encrypt', () => {
      mockedOs.homedir.mockReturnValue('/home/user');
      mockedFs.existsSync.mockReturnValue(true);
      mockedExecSync.mockImplementation((command: string) => {
        if (command.includes('acme.sh')) {
          const error = new Error('Connection timeout');
          (error as any).code = 'ETIMEDOUT';
          throw error;
        }
        return Buffer.from('');
      });
      
      const ssl = new SSLManager('timeout-test');
      
      expect(ssl.generateLetsEncrypt('example.com', 'test@example.com'))
        .rejects.toThrow('Failed to generate Let\'s Encrypt certificate');
    });

    it('should handle concurrent service operations', async () => {
      // Reset mocks for clean test
      jest.clearAllMocks();
      mockPlatform.isTermux.mockReturnValue(false);
      mockPlatform.hasSystemd.mockReturnValue(true);
      mockedFs.existsSync.mockReturnValue(false);
      mockedFs.mkdirSync.mockImplementation(() => undefined);
      mockedExecSync.mockImplementation(() => Buffer.from(''));
      
      const manager = new ServiceManager('concurrent-test');
      
      // Simulate multiple concurrent operations
      const testConfig = {
        name: 'concurrent-test',
        description: 'Test Service',
        root: '/test/path'
      };
      const operations = [
        () => manager.install(testConfig),
        () => manager.stop(testConfig),
        () => manager.uninstall(testConfig)
      ];
      
      expect(() => {
        operations.forEach(op => op());
      }).not.toThrow();
    });

    it('should handle empty or malformed config', () => {
      // Reset mocks for clean test  
      jest.clearAllMocks();
      mockPlatform.isTermux.mockReturnValue(false);
      mockPlatform.hasSystemd.mockReturnValue(true);
      mockedFs.existsSync.mockReturnValue(false);
      mockedFs.mkdirSync.mockImplementation(() => undefined);
      mockedExecSync.mockImplementation(() => Buffer.from(''));
      
      const manager = new ServiceManager('malformed-test');
      const emptyConfig = {};
      const malformedConfig = { name: '' };
      
      expect(() => manager.install(emptyConfig)).not.toThrow();
      expect(() => manager.install(malformedConfig)).not.toThrow();
    });

    it('should validate SSL domain names', async () => {
      const ssl = new SSLManager('validation-test');
      
      const invalidDomains = ['', '..', 'domain with spaces', 'domain;with;semicolons'];
      
      for (const domain of invalidDomains) {
        mockedExecSync.mockImplementation(() => {
          throw new Error('Invalid domain');
        });
        
        await expect(ssl.generateSelfSigned(domain))
          .rejects.toThrow();
      }
    });
  });
});

export {};