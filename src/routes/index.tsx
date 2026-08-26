import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Crosshair, Flame, RotateCcw, Target, Trophy, Zap } from "lucide-react";
import { QUESTIONS, shuffle, verdict, type Question } from "@/lib/quiz-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Standoff 2 Quiz — викторина для фанатов шутера" },
      {
        name: "description",
        content:
          "Интерактивная викторина по Standoff 2: 5 вопросов, мгновенная проверка ответов и итоговый результат.",
      },
      { property: "og:title", content: "Standoff 2 Quiz — викторина для фанатов шутера" },
      {
        property: "og:description",
        content: "Пройди 5 вопросов по Standoff 2 и узнай свой ранг знатока.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuizPage;
});

type Stage = "start" | "play" | "result";

type PreparedQuestion = Question & { shuffled: string[] };

function prepare(): PreparedQuestion[] {
  return QUESTIONS.map((q) => ({ ...q, shuffled: shuffle(q.options) }));
}

function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  return useCallback((kind: "correct" | "wrong") => {
    try {
      if (!ctxRef.current) {
        const Ctor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;
        ctxRef.current = new Ctor();
      }
      const ctx = ctxRef.current;
      void ctx.resume();
      const now = ctx.currentTime;
      const notes = kind === "correct" ? [660, 880, 1180] : [220, 150];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = kind === "correct" ? "triangle" : "sawtooth";
        osc.frequency.setValueAtTime(freq, now + i * 0.09);
        gain.gain.setValueAtTime(0.0001, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.16, now + i * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.22);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.24);
      });
    } catch {
      /* звук не критичен */
    }
  }, []);
}

function QuizPage() {
  const [stage, setStage] = useState<Stage>("start");
  const [questions, setQuestions] = useState<PreparedQuestion[]>(() => prepare());
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const play = useSound();

  const current = questions[index]!;
  const isCorrect = picked !== null && picked === current.correct;
  const progress = useMemo(() => ((index + (picked ? 1 : 0)) / questions.length) * 100, [
    index,
    picked,
    questions.length,
  ]);

  const start = () => {
    setQuestions(prepare());
    setIndex(0);
    setPicked(null);
    setScore(0);
    setStage("play");
  };

  const choose = (option: string) => {
    if (picked) return;
    setPicked(option);
    const ok = option === current.correct;
    if (ok) setScore((s) => s + 1);
    play(ok ? "correct" : "wrong");
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      setStage("result");
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        {stage === "start" && <StartScreen onStart={start} />}
        {stage === "play" && (
          <section key={current.id} className="animate-pop">
            <header className="mb-5 flex items-center justify-between gap-4">
              <span className="font-display text-sm uppercase tracking-[0.22em] text-accent">
                Вопрос {index + 1} из {questions.length}
              </span>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1 text-sm font-semibold">
                <Target className="size-4 text-primary" />
                {score}
              </span>
            </header>

            <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${progress}%`, background: "var(--gradient-fire)" }}
              />
            </div>

            <div className="surface-card rounded-2xl p-5 sm:p-7">
              <h1 className="text-balance text-xl font-bold leading-snug sm:text-2xl">
                {current.question}
              </h1>

              <div className="mt-6 grid gap-3">
                {current.shuffled.map((option) => {
                  const chosen = picked === option;
                  const revealCorrect = picked !== null && option === current.correct;
                  const state = revealCorrect
                    ? "answer-correct"
                    : chosen
                      ? "answer-wrong animate-shake"
                      : "border-border bg-secondary/50 hover:border-accent/60";
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => choose(option)}
                      disabled={picked !== null}
                      className={`flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 text-left font-semibold transition-all duration-200 disabled:cursor-default ${state}`}
                    >
                      <Crosshair className="size-5 shrink-0 opacity-70" />
                      <span className="min-w-0 flex-1">{option}</span>
                    </button>
                  );
                })}
              </div>

              {picked !== null && (
                <div className="animate-pop mt-6">
                  <p
                    className={`font-display text-lg uppercase tracking-wide ${
                      isCorrect ? "text-success" : "text-destructive"
                    }`}
                  >
                    {isCorrect ? "В десятку!" : "Промах!"}
                  </p>
                  {!isCorrect && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Правильный ответ: {current.correct}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={next}
                    className="btn-fire mt-5 w-full rounded-xl px-6 py-4 text-base font-bold"
                  >
                    {index + 1 === questions.length ? "Показать результат" : "Следующий вопрос"}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
        {stage === "result" && (
          <ResultScreen score={score} total={questions.length} onRestart={start} />
        )}
      </div>
    </main>
  );
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <section className="animate-pop surface-card rounded-3xl p-7 text-center sm:p-12">
      <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-secondary/60 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-accent">
        <Flame className="size-3.5" /> Mobile FPS
      </span>
      <h1 className="mt-6 text-4xl font-black uppercase leading-[1.05] sm:text-6xl">
        Standoff 2
        <span
          className="block bg-clip-text text-transparent"
          style={{ backgroundImage: "var(--gradient-fire)" }}
        >
          Quiz
        </span>
      </h1>
      <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
        5 вопросов. Один выстрел на каждый. Проверь, насколько хорошо ты знаешь игру.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="btn-fire animate-glow mt-8 w-full rounded-2xl px-8 py-5 text-lg font-black sm:text-xl"
      >
        Начать викторину
      </button>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs uppercase tracking-widest text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Zap className="size-3.5 text-accent" /> 5 вопросов
        </span>
        <span className="flex items-center gap-1.5">
          <Target className="size-3.5 text-accent" /> без регистрации
        </span>
      </div>
    </section>
  );
}

function ResultScreen({
  score,
  total,
  onRestart,
}: {
  score: number;
  total: number;
  onRestart: () => void;
}) {
  const v = verdict(score);
  return (
    <section className="animate-pop surface-card rounded-3xl p-7 text-center sm:p-12">
      <Trophy className="mx-auto size-12 text-accent" />
      <h1 className="mt-5 font-display text-3xl font-black uppercase sm:text-4xl">{v.title}</h1>
      <p
        className="mt-6 text-6xl font-black leading-none bg-clip-text text-transparent sm:text-7xl"
        style={{ backgroundImage: "var(--gradient-fire)" }}
      >
        {score}/{total}
      </p>
      <p className="mt-3 text-sm uppercase tracking-[0.2em] text-muted-foreground">
        правильных ответов: {score}
      </p>
      <p className="mx-auto mt-4 max-w-sm text-base text-muted-foreground">{v.text}</p>
      <button
        type="button"
        onClick={onRestart}
        className="btn-fire mt-8 flex w-full items-center justify-center gap-2 rounded-2xl px-8 py-5 text-lg font-black"
      >
        <RotateCcw className="size-5" /> Пройти ещё раз
      </button>
    </section>
  );
}
