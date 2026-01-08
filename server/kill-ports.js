import { execSync } from 'child_process';

const killPort = (port) => {
    try {
        console.log(`Searching for process on port ${port}...`);
        const output = execSync(`netstat -ano | findstr :${port}`).toString();
        const lines = output.trim().split('\n');
        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            // Proto Local Address Foreign Address State PID
            // TCP    0.0.0.0:3001   0.0.0.0:0       LISTENING   1234
            const pid = parts[parts.length - 1];
            if (pid && parseInt(pid) > 0) {
                console.log(`Found PID ${pid} on port ${port}. Killing...`);
                try {
                    execSync(`taskkill /F /PID ${pid}`);
                    console.log(`Successfully killed PID ${pid}`);
                } catch (e) {
                    console.log(`Failed to kill PID ${pid}: ${e.message}`);
                }
            }
        });
    } catch (e) {
        console.log(`No process found on port ${port}`);
    }
};

console.log('--- Cleaning up ports ---');
killPort(3000);
killPort(3001);
console.log('--- Done ---');
