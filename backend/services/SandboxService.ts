import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import axios from 'axios';
import config from '../utils/config';

// Blocks obviously dangerous commands to keep AI-driven execution limited
const BLOCKED_COMMANDS = [
    'rm -rf /', 'rm -fr /', 'del /', 'format c:', 'format c\\',
    'mkfs', 'shutdown', 'reboot', 'init 0', 'dd if=', '> /dev/sda',
    'sudo', 'curl | sh', 'wget | sh', 'powershell -c iwr', 'reg delete',
    'taskkill /f /im explorer', 'net user', 'net localgroup', 'sc stop', 'sc delete'
];

export interface CommandResult {
    success: boolean;
    stdout: string;
    stderr: string;
    exitCode: number | null;
}

export class SandboxContext {
    sessionId: string;
    rootPath: string;

    constructor(sessionId: string) {
        this.sessionId = sessionId;
        const baseRoot = config.sandbox?.root_dir || "./sandbox_env";
        this.rootPath = path.resolve(baseRoot, sessionId);
        this.init();
    }

    private init() {
        if (!fs.existsSync(this.rootPath)) {
            fs.mkdirSync(this.rootPath, { recursive: true });
        }
    }

    writeFile(filePath: string, content: string) {
        const fullPath = path.join(this.rootPath, filePath);
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(fullPath, content);
    }

    readFile(filePath: string): string {
        const fullPath = path.join(this.rootPath, filePath);
        return fs.readFileSync(fullPath, 'utf8');
    }

    fileExists(filePath: string): boolean {
        const fullPath = path.join(this.rootPath, filePath);
        return fs.existsSync(fullPath);
    }

    listFiles(): string[] {
        const walk = (dir: string): string[] => {
            let results: string[] = [];
            const list = fs.readdirSync(dir);
            list.forEach((file) => {
                file = path.join(dir, file);
                const stat = fs.statSync(file);
                if (stat && stat.isDirectory()) {
                    results = results.concat(walk(file));
                } else {
                    results.push(path.relative(this.rootPath, file).replace(/\\/g, '/'));
                }
            });
            return results;
        };
        return walk(this.rootPath);
    }
    getRootDir(): string {
        return this.rootPath;
    }

    /**
     * Run a shell command inside the sandbox directory with a timeout.
     * Blocked dangerous commands are rejected before execution.
     */
    runCommand(command: string, timeoutMs: number = 60000, maxOutputChars: number = 30000): Promise<CommandResult> {
        return new Promise((resolvePromise) => {
            const normalized = command.trim().toLowerCase();
            if (BLOCKED_COMMANDS.some(b => normalized.includes(b))) {
                return resolvePromise({
                    success: false,
                    stdout: '',
                    stderr: `Blocked: command contains a restricted operation.`,
                    exitCode: 1
                });
            }
            exec(command, {
                cwd: this.rootPath,
                timeout: timeoutMs,
                maxBuffer: maxOutputChars * 2,
                windowsHide: true,
                env: { ...process.env, FORCE_COLOR: '0', CI: '1' }
            }, (error, stdout, stderr) => {
                const success = !error;
                resolvePromise({
                    success,
                    stdout: (stdout || '').slice(0, maxOutputChars),
                    stderr: (stderr || '').slice(0, maxOutputChars),
                    exitCode: error && typeof (error as any).code === 'number' ? (error as any).code : error ? 1 : 0
                });
            });
        });
    }

    /**
     * Download a remote file into the sandbox. Throws on failure.
     */
    async downloadFile(url: string, destPath?: string): Promise<{ path: string; size: number }> {
        const target = destPath && destPath.trim() ? destPath.trim() : (url.split('/').pop()?.split('?')[0] || 'download.bin');
        const fullPath = path.join(this.rootPath, target);
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const res = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 120000,
            maxContentLength: 100 * 1024 * 1024,
            validateStatus: (s) => s >= 200 && s < 300
        });
        fs.writeFileSync(fullPath, Buffer.from(res.data));
        return { path: target, size: Buffer.byteLength(res.data) };
    }
}
