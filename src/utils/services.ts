import os from 'os'
import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'
import { isWindows, isMac, isTermux, hasSystemd, getPlatformPaths } from './platform'

/**
 * SSL Certificate management utilities
 */
export class SSLManager {
    private sslPath: string
    
    constructor(appName = 'app') {
        const paths = getPlatformPaths(appName)
        this.sslPath = paths.ssl
        this.ensureDirectory()
    }
    
    private ensureDirectory() {
        if (!fs.existsSync(this.sslPath)) {
            fs.mkdirSync(this.sslPath, { recursive: true, mode: 0o700 })
        }
    }
    
    async generateSelfSigned(domain: string) {
        const keyFile = path.join(this.sslPath, `${domain}.key`)
        const certFile = path.join(this.sslPath, `${domain}.crt`)
        
        try {
            execSync(`openssl genrsa -out "${keyFile}" 2048`, { stdio: 'ignore' })
            execSync(`openssl req -new -x509 -key "${keyFile}" -out "${certFile}" -days 365 -subj "/CN=${domain}"`, { stdio: 'ignore' })
            
            fs.chmodSync(keyFile, 0o600)
            fs.chmodSync(certFile, 0o644)
            
            return { key: keyFile, cert: certFile }
        } catch (error: any) {
            throw new Error(`Failed to generate self-signed certificate: ${error.message}`)
        }
    }
    
    async generateLetsEncrypt(domain: string, email: string) {
        const acmePath = path.join(os.homedir(), '.acme.sh')
        const acmeScript = path.join(acmePath, 'acme.sh')
        
        if (!fs.existsSync(acmeScript)) {
            execSync('curl https://get.acme.sh | sh', { stdio: 'inherit' })
        }
        
        const keyFile = path.join(this.sslPath, `${domain}.key`)
        const certFile = path.join(this.sslPath, `${domain}.crt`)
        
        try {
            execSync(`"${acmeScript}" --issue -d ${domain} --dns --yes-I-know-dns-manual-mode-enough-go-ahead-please`, { stdio: 'inherit' })
            execSync(`"${acmeScript}" --install-cert -d ${domain} --key-file "${keyFile}" --fullchain-file "${certFile}"`, { stdio: 'inherit' })
            return { key: keyFile, cert: certFile }
        } catch {
            try {
                execSync(`"${acmeScript}" --issue -d ${domain} --standalone --httpport 8080`, { stdio: 'inherit' })
                execSync(`"${acmeScript}" --install-cert -d ${domain} --key-file "${keyFile}" --fullchain-file "${certFile}"`, { stdio: 'inherit' })
                return { key: keyFile, cert: certFile }
            } catch (error: any) {
                throw new Error(`Failed to generate Let's Encrypt certificate: ${error.message}`)
            }
        }
    }
}

/**
 * Service management utilities
 */
export class ServiceManager {
    private platform: string
    private serviceName: string
    
    constructor(serviceName: string) {
        this.platform = os.platform()
        this.serviceName = serviceName
    }
    
    createSystemdUserService(config: any) {
        const userServicePath = path.join(os.homedir(), '.config', 'systemd', 'user')
        if (!fs.existsSync(userServicePath)) {
            fs.mkdirSync(userServicePath, { recursive: true })
        }
        
        const serviceFile = path.join(userServicePath, `${this.serviceName}.service`)
        const runtime = typeof (global as any).Bun !== 'undefined' ? 'bun' : 'node'
        const mainFile = runtime === 'bun' ? 'src/main.ts' : 'dist/main.js'
        
        const serviceContent = `[Unit]
Description=${config.description || config.name}
After=network.target

[Service]
Type=simple
ExecStart=${process.execPath} ${path.join(config.root, mainFile)}
WorkingDirectory=${config.root}
Restart=always
RestartSec=10
StandardOutput=append:${path.join(os.homedir(), '.local', 'share', config.name, 'logs', `${config.name}.log`)}
StandardError=append:${path.join(os.homedir(), '.local', 'share', config.name, 'logs', `${config.name}.error.log`)}

[Install]
WantedBy=default.target`
        
        fs.writeFileSync(serviceFile, serviceContent)
        
        execSync('systemctl --user daemon-reload', { stdio: 'ignore' })
        execSync(`systemctl --user enable ${this.serviceName}`, { stdio: 'ignore' })
        execSync(`systemctl --user start ${this.serviceName}`, { stdio: 'ignore' })
    }
    
    createLaunchdService(config: any) {
        const plistPath = path.join(os.homedir(), 'Library', 'LaunchAgents')
        if (!fs.existsSync(plistPath)) {
            fs.mkdirSync(plistPath, { recursive: true })
        }
        
        const plistFile = path.join(plistPath, `com.${config.name}.plist`)
        const runtime = typeof (global as any).Bun !== 'undefined' ? 'bun' : 'node'
        const mainFile = runtime === 'bun' ? 'src/main.ts' : 'dist/main.js'
        
        const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.${config.name}</string>
    <key>ProgramArguments</key>
    <array>
        <string>${process.execPath}</string>
        <string>${path.join(config.root, mainFile)}</string>
    </array>
    <key>WorkingDirectory</key>
    <string>${config.root}</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${path.join(os.homedir(), 'Library', 'Logs', config.name, `${config.name}.log`)}</string>
    <key>StandardErrorPath</key>
    <string>${path.join(os.homedir(), 'Library', 'Logs', config.name, `${config.name}.error.log`)}</string>
</dict>
</plist>`
        
        fs.writeFileSync(plistFile, plistContent)
        execSync(`launchctl load "${plistFile}"`, { stdio: 'ignore' })
    }
    
    createWindowsService(config: any) {
        const startupPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup')
        const batchFile = path.join(startupPath, `${config.name}.bat`)
        const runtime = typeof (global as any).Bun !== 'undefined' ? 'bun' : 'node'
        const mainFile = runtime === 'bun' ? 'src\\main.ts' : 'dist\\main.js'
        
        const batchContent = `@echo off
cd /d "${config.root}"
start "" "${process.execPath}" "${path.join(config.root, mainFile)}"
exit`
        
        fs.writeFileSync(batchFile, batchContent)
    }
    
    createTermuxService(config: any) {
        const servicePath = path.join(process.env.PREFIX || '/data/data/com.termux/files/usr', 'var', 'service')
        if (!fs.existsSync(servicePath)) {
            fs.mkdirSync(servicePath, { recursive: true })
        }
        
        const serviceDir = path.join(servicePath, config.name)
        const runFile = path.join(serviceDir, 'run')
        
        fs.mkdirSync(serviceDir, { recursive: true })
        
        const runtime = typeof (global as any).Bun !== 'undefined' ? 'bun' : 'node'
        const mainFile = runtime === 'bun' ? 'src/main.ts' : 'dist/main.js'
        
        const runContent = `#!/data/data/com.termux/files/usr/bin/sh
exec ${process.execPath} ${path.join(config.root, mainFile)} 2>&1`
        
        fs.writeFileSync(runFile, runContent)
        fs.chmodSync(runFile, 0o755)
        
        try {
            execSync(`sv-enable ${config.name}`, { stdio: 'ignore' })
        } catch {}
    }
    
    install(config: any) {
        if (isWindows()) {
            this.createWindowsService(config)
        } else if (isMac()) {
            this.createLaunchdService(config)
        } else if (isTermux()) {
            this.createTermuxService(config)
        } else if (hasSystemd()) {
            this.createSystemdUserService(config)
        } else {
            this.createCronJob(config)
        }
    }
    
    createCronJob(config: any) {
        const runtime = typeof (global as any).Bun !== 'undefined' ? 'bun' : 'node'
        const mainFile = runtime === 'bun' ? 'src/main.ts' : 'dist/main.js'
        const cronCommand = `@reboot ${process.execPath} ${path.join(config.root, mainFile)} >> ${path.join(os.homedir(), `.${config.name}`, 'logs', `${config.name}.log`)} 2>&1`
        
        try {
            let currentCron = ''
            try {
                currentCron = execSync('crontab -l', { encoding: 'utf8' })
            } catch {}
            
            if (!currentCron.includes(config.root)) {
                const newCron = currentCron + '\n' + cronCommand + '\n'
                const tmpFile = path.join(os.tmpdir(), `cron-${Date.now()}`)
                fs.writeFileSync(tmpFile, newCron)
                execSync(`crontab "${tmpFile}"`, { stdio: 'ignore' })
                fs.unlinkSync(tmpFile)
            }
        } catch (error: any) {
            throw new Error(`Failed to install cron job: ${error.message}`)
        }
    }
    
    removeCronJob(config: any) {
        try {
            const currentCron = execSync('crontab -l', { encoding: 'utf8' })
            const lines = currentCron.split('\n').filter(line => !line.includes(config.root))
            const newCron = lines.join('\n')
            const tmpFile = path.join(os.tmpdir(), `cron-${Date.now()}`)
            fs.writeFileSync(tmpFile, newCron)
            execSync(`crontab "${tmpFile}"`, { stdio: 'ignore' })
            fs.unlinkSync(tmpFile)
        } catch {}
    }
    
    stop(config: any) {
        if (isWindows()) {
            try {
                execSync(`taskkill /F /IM node.exe /FI "WINDOWTITLE eq ${config.name}"`, { stdio: 'ignore' })
            } catch {}
        } else if (isMac()) {
            try {
                execSync(`launchctl stop com.${config.name}`, { stdio: 'ignore' })
            } catch {}
        } else if (isTermux()) {
            try {
                execSync(`sv stop ${config.name}`, { stdio: 'ignore' })
            } catch {}
        } else if (hasSystemd()) {
            try {
                execSync(`systemctl --user stop ${this.serviceName}`, { stdio: 'ignore' })
            } catch {}
        }
        
        const pidFile = path.join(config.root, `.${config.name}.pid`)
        if (fs.existsSync(pidFile)) {
            try {
                const pid = parseInt(fs.readFileSync(pidFile, 'utf8'))
                process.kill(pid, 'SIGTERM')
            } catch {}
            fs.unlinkSync(pidFile)
        }
    }
    
    uninstall(config: any) {
        this.stop(config)
        
        if (isWindows()) {
            const startupPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup')
            const batchFile = path.join(startupPath, `${config.name}.bat`)
            if (fs.existsSync(batchFile)) {
                fs.unlinkSync(batchFile)
            }
        } else if (isMac()) {
            const plistFile = path.join(os.homedir(), 'Library', 'LaunchAgents', `com.${config.name}.plist`)
            if (fs.existsSync(plistFile)) {
                try {
                    execSync(`launchctl unload "${plistFile}"`, { stdio: 'ignore' })
                } catch {}
                fs.unlinkSync(plistFile)
            }
        } else if (isTermux()) {
            try {
                execSync(`sv-disable ${config.name}`, { stdio: 'ignore' })
            } catch {}
            const serviceDir = path.join(process.env.PREFIX || '/data/data/com.termux/files/usr', 'var', 'service', config.name)
            if (fs.existsSync(serviceDir)) {
                fs.rmSync(serviceDir, { recursive: true })
            }
        } else if (hasSystemd()) {
            try {
                execSync(`systemctl --user stop ${this.serviceName}`, { stdio: 'ignore' })
                execSync(`systemctl --user disable ${this.serviceName}`, { stdio: 'ignore' })
            } catch {}
            const serviceFile = path.join(os.homedir(), '.config', 'systemd', 'user', `${this.serviceName}.service`)
            if (fs.existsSync(serviceFile)) {
                fs.unlinkSync(serviceFile)
                execSync('systemctl --user daemon-reload', { stdio: 'ignore' })
            }
        }
        
        this.removeCronJob(config)
    }
}

// Export legacy names for backward compatibility
export { SSLManager as LocalSSL, ServiceManager as LocalService }