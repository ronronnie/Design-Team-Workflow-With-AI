"use client";

import { FormEvent, useMemo, useState } from "react";
import type { DemoResponse, ReviewDecision } from "@/lib/types";

const sampleUrl =
  "https://www.figma.com/design/FILE_KEY/Product-Concept?node-id=123-456";

export default function Home() {
  const [figmaUrl, setFigmaUrl] = useState(sampleUrl);
  const [nodeId, setNodeId] = useState("123:456");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<DemoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<ReviewDecision | null>(null);
  const [notes, setNotes] = useState("");
  const [parseResult, setParseResult] = useState<{
    fileKey: string;
    nodeId: string;
    mode: "real" | "mock";
    hasFigmaToken: boolean;
  } | null>(null);

  const hasResult = Boolean(result);
  const linterStatus = useMemo(() => {
    if (!result) return null;
    const failed = result.lintResults.filter((item) => item.status === "fail");
    const warnings = result.lintResults.filter((item) => item.status === "warn");
    if (failed.length > 0) return `${failed.length} failed`;
    if (warnings.length > 0) return `${warnings.length} warnings`;
    return "All checks passed";
  }, [result]);

  async function runDemo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsRunning(true);
    setError(null);
    setDecision(null);

    try {
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ figmaUrl, nodeId })
      });

      const data = (await response.json()) as DemoResponse | { error: string };
      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Demo run failed.");
      }

      setResult(data as DemoResponse);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unexpected error.");
    } finally {
      setIsRunning(false);
    }
  }

  async function parseFrame() {
    setError(null);

    try {
      const response = await fetch("/api/figma/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ figmaUrl, nodeId })
      });
      const data = (await response.json()) as
        | {
            parsed: { fileKey: string; nodeId: string; mode: "real" | "mock" };
            hasFigmaToken: boolean;
          }
        | { error: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Parse failed.");
      }

      if ("parsed" in data) {
        setParseResult({
          ...data.parsed,
          hasFigmaToken: data.hasFigmaToken
        });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unexpected error.");
    }
  }

  async function saveDecision(nextDecision: ReviewDecision) {
    if (!result) return;

    setDecision(nextDecision);
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId: result.runId,
        decision: nextDecision,
        notes
      })
    });
  }

  return (
    <main className="shell">
      <section className="masthead">
        <div>
          <p className="eyebrow">V0 demo</p>
          <h1>Empty-state expansion review</h1>
          <p className="lede">
            Paste a Figma frame, generate one empty-state proposal, inspect the
            model representation and linter checks, then capture the designer's
            decision.
          </p>
        </div>
      </section>

      <section className="workspace">
        <form className="panel input-panel" onSubmit={runDemo}>
          <div className="panel-header">
            <div>
              <p className="eyebrow">Input</p>
              <h2>Figma frame</h2>
            </div>
            <span className="status-pill">
              {result?.frame.mode === "real" ? "Figma connected" : "Mock-ready"}
            </span>
          </div>

          <label>
            Figma URL
            <input
              value={figmaUrl}
              onChange={(event) => setFigmaUrl(event.target.value)}
              placeholder="https://www.figma.com/design/..."
            />
          </label>

          <label>
            Node ID
            <input
              value={nodeId}
              onChange={(event) => setNodeId(event.target.value)}
              placeholder="123:456"
            />
          </label>

          <div className="input-actions">
            <button className="primary" disabled={isRunning}>
              {isRunning ? "Running pipeline..." : "Generate empty state"}
            </button>
            <button type="button" onClick={parseFrame}>
              Parse frame
            </button>
          </div>

          {parseResult ? (
            <div className="parse-result">
              <p>
                <strong>File:</strong> {parseResult.fileKey}
              </p>
              <p>
                <strong>Node:</strong> {parseResult.nodeId}
              </p>
              <p>
                <strong>Mode:</strong> {parseResult.mode}
              </p>
              <p>
                <strong>Figma token:</strong>{" "}
                {parseResult.hasFigmaToken ? "present" : "missing"}
              </p>
            </div>
          ) : null}

          {error ? <p className="error">{error}</p> : null}
        </form>

        <section className="panel result-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Output</p>
              <h2>Generated proposal</h2>
            </div>
            {linterStatus ? <span className="status-pill">{linterStatus}</span> : null}
          </div>

          {!hasResult ? (
            <div className="empty-preview">
              <p>Run the pipeline to see the first expansion proposal.</p>
            </div>
          ) : (
            <div className="proposal-grid">
              <article className="proposal-preview">
                {result!.frame.imageUrl ? (
                  <img
                    className="frame-image"
                    src={result!.frame.imageUrl}
                    alt={`${result!.frame.name} rendered from Figma`}
                  />
                ) : null}
                <p className="eyebrow">{result!.generation.expansionType}</p>
                <h3>{result!.generation.title}</h3>
                <p>{result!.generation.body}</p>
                <div className="proposal-actions">
                  {result!.generation.primaryAction ? (
                    <button>{result!.generation.primaryAction}</button>
                  ) : null}
                  {result!.generation.secondaryAction ? (
                    <button className="secondary">
                      {result!.generation.secondaryAction}
                    </button>
                  ) : null}
                </div>
                <ul>
                  {result!.generation.componentPlan.map((component) => (
                    <li key={component}>{component}</li>
                  ))}
                </ul>
              </article>

              <div className="review-box">
                <label>
                  Review notes
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="What worked, what failed, what should the model learn?"
                  />
                </label>
                <div className="decision-row">
                  <button onClick={() => saveDecision("accept")}>Accept</button>
                  <button onClick={() => saveDecision("edit")}>Edit</button>
                  <button onClick={() => saveDecision("dismiss")}>Dismiss</button>
                </div>
                {decision ? (
                  <p className="saved">Saved decision: {decision}</p>
                ) : null}
              </div>
            </div>
          )}
        </section>
      </section>

      {result ? (
        <section className="detail-grid">
          <JsonPanel title="Representation JSON" value={result.representation} />
          <JsonPanel title="Linter checks" value={result.lintResults} />
          <JsonPanel title="Raw frame summary" value={result.frame} />
        </section>
      ) : null}
    </main>
  );
}

function JsonPanel({ title, value }: { title: string; value: unknown }) {
  return (
    <section className="panel json-panel">
      <div className="panel-header">
        <h2>{title}</h2>
      </div>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </section>
  );
}
