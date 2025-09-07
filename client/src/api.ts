export interface RunCodeResponse {
  output?: string;
  error?: string;
}

export async function runCode(language: string, code: string): Promise<RunCodeResponse> {
  const res = await fetch("http://localhost:3001/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language, code }),
  });
  return res.json();
}