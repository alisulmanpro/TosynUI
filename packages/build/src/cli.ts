import { watch } from 'chokidar';
import { buildStyles, type BuildOptions } from './pipeline.js';

function getArg(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function optionsFromArgs(args: string[]): BuildOptions {
  const inputPath = getArg(args, '--input');
  const tokensPath = getArg(args, '--tokens');
  const contractPath = getArg(args, '--contract');
  const outputDir = getArg(args, '--output-dir');
  if (!inputPath || !tokensPath || !contractPath || !outputDir) {
    throw new Error(
      'Usage: tosynui-build --input <index.css> --tokens <tokens.json> --contract <contract.json> --output-dir <dist> [--watch]',
    );
  }
  return { inputPath, tokensPath, contractPath, outputDir };
}

const args = process.argv.slice(2);
const watchMode = args.includes('--watch');
const options = optionsFromArgs(args);

async function runBuild(): Promise<void> {
  try {
    await buildStyles(options);
    console.log(`[tosynui-build] wrote CSS artifacts to ${options.outputDir}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[tosynui-build] ${message}`);
    if (!watchMode) process.exitCode = 1;
  }
}

await runBuild();
if (watchMode) {
  const watcher = watch([options.inputPath, options.tokensPath, options.contractPath], {
    ignoreInitial: true,
  });
  let timer: ReturnType<typeof setTimeout> | undefined;
  watcher.on('all', () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void runBuild(), 75);
  });
  process.once('SIGINT', () => void watcher.close());
}
