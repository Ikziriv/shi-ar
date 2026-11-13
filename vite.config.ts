import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function edgeTtsMiddlewarePlugin(): Plugin {
  return {
    name: 'edge-tts-middleware',
    configureServer(server) {
      server.middlewares.use('/api/edge-tts', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          let tempDir = '';
          try {
            const parsed = JSON.parse(body || '{}') as {
              text?: string;
              voice?: string;
              rate?: string;
            };
            const text = (parsed.text ?? '').trim();
            const voice = parsed.voice || 'id-ID-GadisNeural';
            const rate = parsed.rate || '+0%';

            if (!text) {
              res.statusCode = 400;
              res.end('Missing text');
              return;
            }

            tempDir = await mkdtemp(join(tmpdir(), 'shiar-tts-'));
            const outPath = join(tempDir, 'speech.mp3');

            await new Promise<void>((resolve, reject) => {
              execFile(
                'python',
                [
                  '-m',
                  'edge_tts',
                  '--voice',
                  voice,
                  '--rate',
                  rate,
                  '--text',
                  text,
                  '--write-media',
                  outPath,
                ],
                { timeout: 15000 },
                (err) => {
                  if (err) reject(err);
                  else resolve();
                }
              );
            });

            const audioBuffer = await readFile(outPath);
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Cache-Control', 'no-store');
            res.end(audioBuffer);
          } catch (err) {
            res.statusCode = 500;
            res.end(err instanceof Error ? err.message : 'Edge TTS failed');
          } finally {
            if (tempDir) {
              await rm(tempDir, { recursive: true, force: true }).catch(() => {});
            }
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const groqKey = env.VITE_GROQ_API_KEY || env.GROQ_API_KEY || '';

  return {
    plugins: [react(), tailwindcss(), edgeTtsMiddlewarePlugin()],
    define: {
      __GROQ_ENV_KEY__: JSON.stringify(groqKey),
    },
  };
});
