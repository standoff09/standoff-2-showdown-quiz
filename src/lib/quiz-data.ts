export type Question = {
  id: number;
  question: string;
  options: string[];
  correct: string;
};

export const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "В каком году вышла Standoff 2?",
    options: ["2015", "2017", "2019", "2021"],
    correct: "2017",
  },
  {
    id: 2,
    question:
      "Как называется режим, в котором одна команда устанавливает бомбу, а другая должна её обезвредить?",
    options: ["Team Deathmatch", "Arms Race", "Competitive", "Duel"],
    correct: "Competitive",
  },
  {
    id: 3,
    question: "Как называется внутриигровая валюта Standoff 2?",
    options: ["Coins", "Gold (голда)", "Gold Bars", "Credits"],
    correct: "Gold (голда)",
  },
  {
    id: 4,
    question: "Что происходит, если игрок получает достаточно опыта для повышения уровня?",
    options: [
      "Его аккаунт удаляется",
      "Повышается уровень аккаунта",
      "Он теряет оружие",
      "Карта меняется автоматически",
    ],
    correct: "Повышается уровень аккаунта",
  },
  {
    id: 5,
    question: "Какой тип оружия относится к снайперским винтовкам?",
    options: ["AWM", "P90", "AKR", "MP7"],
    correct: "AWM",
  },
];

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}

export function verdict(score: number): { title: string; text: string } {
  if (score === 5)
    return { title: "ЛЕГЕНДА КАТКИ", text: "Идеально. Ты знаешь Standoff 2 наизусть." };
  if (score === 4) return { title: "ЭЛИТНЫЙ СТРЕЛОК", text: "Почти безупречно — один промах." };
  if (score === 3) return { title: "УВЕРЕННЫЙ БОЕЦ", text: "Хороший результат, но есть куда расти." };
  if (score === 2) return { title: "НОВОБРАНЕЦ", text: "Пора заходить в катку почаще." };
  if (score === 1) return { title: "СИЛЬВЕР", text: "Одно попадание из пяти. Тренируйся!" };
  return { title: "ПРОМАХ ПО ВСЕМ", text: "Ноль попаданий. Реванш обязателен!" };
}
