const MONACO_LANGUAGE_BY_EXT: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  py: 'python',
  rb: 'ruby',
  go: 'go',
  java: 'java',
  kt: 'kotlin',
  php: 'php',
  cs: 'csharp',
  rs: 'rust',
  sql: 'sql',
  json: 'json',
  yml: 'yaml',
  yaml: 'yaml',
  html: 'html',
  css: 'css',
  md: 'markdown',
};

export function monacoLanguageFor(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return MONACO_LANGUAGE_BY_EXT[ext] ?? 'typescript';
}
