const inputStage = document.getElementById("inputStage");
const gameStage = document.getElementById("gameStage");
const generateBtn = document.getElementById("generateBtn");
const restartBtn = document.getElementById("restartBtn");
const storyText = document.getElementById("storyText");
const storyBox = document.getElementById("storyBox");
const choiceArea = document.getElementById("choiceArea");
const fearValue = document.getElementById("fearValue");
const sanityValue = document.getElementById("sanityValue");
const turnValue = document.getElementById("turnValue");
const fearFill = document.getElementById("fearFill");
const sanityFill = document.getElementById("sanityFill");

const MAX_TURNS = 5;
let state;
let typingTimer;

const lexicon = {
  place: ["바다", "학교", "집", "병원", "숲", "방", "지하철", "엘리베이터", "교실", "복도", "도시", "섬", "무덤", "극장"],
  person: ["엄마", "아빠", "친구", "아이", "선생님", "연인", "나", "동생", "할머니", "의사", "경찰"],
  object: ["거울", "문", "인형", "시계", "전화", "칼", "열쇠", "사진", "책", "창문", "신발", "마스크"],
  nature: ["바다", "비", "눈", "불", "달", "안개", "강", "파도", "바람", "그림자", "피", "흙"],
  emotion: ["불안", "외로움", "분노", "죄책감", "기억", "침묵", "후회", "공포", "사랑", "절망"]
};

const profiles = {
  place: {
    role: "공간",
    verbs: ["닫혀 간다", "방향을 바꾼다", "당신의 발자국을 되감는다", "출구를 숨긴다"],
    omen: ["벽면이 젖은 숨을 내쉰다", "멀리서 같은 발소리가 되돌아온다", "천장이 낮아지며 이름을 누른다"]
  },
  person: {
    role: "목격자",
    verbs: ["당신을 모른 척한다", "입 모양만으로 경고한다", "다른 목소리로 당신을 부른다", "뒤돌아보지 말라고 속삭인다"],
    omen: ["그 얼굴이 잠깐 당신 얼굴로 바뀐다", "손목에 차가운 손자국이 남는다", "이름이 아닌 단어로 당신을 부른다"]
  },
  object: {
    role: "단서",
    verbs: ["혼자 움직인다", "안쪽에서 두드린다", "보이지 않는 손에 열렸다 닫힌다", "당신의 기억을 비춘다"],
    omen: ["표면에 아직 일어나지 않은 장면이 맺힌다", "만질수록 더 차가워진다", "금이 간 틈에서 낮은 숨소리가 난다"]
  },
  nature: {
    role: "위협",
    verbs: ["살아 있는 것처럼 다가온다", "당신의 호흡을 흉내 낸다", "바닥 아래에서 맥박친다", "모든 출구를 적신다"],
    omen: ["그것이 물러난 자리마다 이름 없는 발자국이 남는다", "공기가 젖은 폐처럼 수축한다", "어둠이 파도처럼 천천히 밀려온다"]
  },
  emotion: {
    role: "원인",
    verbs: ["형체를 얻는다", "당신 대신 대답한다", "방 안의 온도를 낮춘다", "오래된 장면을 반복 재생한다"],
    omen: ["머릿속 문장이 같은 단어로 끝난다", "심장이 남의 박자로 뛴다", "익숙한 기억이 낯선 사람의 것으로 바뀐다"]
  }
};

const sceneTemplates = [
  "당신은 {anchor}에서 깨어난다. 이 악몽의 중심에는 {threatGa} 있고, 그것은 {verb}. {clueEun} 유일하게 마른 채 남아 있으며, {witnessNeun} 입술만 움직여 '다섯 번 안에 나가'라고 말한다.",
  "{anchor}의 불빛이 꺼졌다 켜질 때마다 {threatGa} 한 걸음씩 가까워진다. 바닥에는 {clueGa} 놓여 있고, 그 옆의 {witnessGa} 당신이 아직 꿈속이라고 적는다.",
  "당신은 {anchor}에 갇혀 있다. {threatEun} 단순한 배경이 아니라 문과 복도 사이에서 숨을 쉰다. {clueEun} 그것을 잠시 멈출 수 있는 유일한 단서처럼 보인다."
];

const eventSteps = [
  {
    title: "첫 번째 균열",
    text: "{anchor}의 구조가 조금씩 어긋난다. {threatEun} 당신이 선택한 방향을 먼저 알고 있었던 것처럼 길목을 막고, {clue}에는 방금 전의 당신 모습이 비친다.",
    options: [
      { label: "{clueEul} 붙잡고 표시를 따라간다", style: "careful", fear: [14, 24], sanity: [10, 18], secret: 0.08 },
      { label: "{threat} 쪽으로 직접 걸어간다", style: "risky", fear: [24, 34], sanity: [7, 15], secret: 0.2 },
      { label: "{witness}의 경고를 듣고 숨는다", style: "safe", fear: [10, 19], sanity: [13, 22], secret: 0.04 }
    ]
  },
  {
    title: "젖은 기억",
    text: "당신이 지나온 길이 사라지고, {witnessGa} 있던 자리에는 당신의 필체로 쓴 문장이 남는다. '그 이름을 부르면 {threatEun} 더 빨리 온다.'",
    options: [
      { label: "입을 다물고 {clue}의 반사만 본다", style: "careful", fear: [12, 22], sanity: [12, 20], secret: 0.1 },
      { label: "{threat}의 이름을 크게 부른다", style: "risky", fear: [28, 40], sanity: [12, 24], secret: 0.35 },
      { label: "벽에 새겨진 다른 출구를 찾는다", style: "safe", fear: [16, 26], sanity: [9, 17], secret: 0.06 }
    ]
  },
  {
    title: "거짓 선택",
    text: "{anchor} 안의 안내 표지들이 모두 같은 방향을 가리킨다. 하지만 {clueEun} 반대편에서 희미하게 떨리고, {witness}의 목소리는 점점 당신 목소리와 같아진다.",
    options: [
      { label: "표지판이 가리키는 길로 뛴다", style: "risky", fear: [23, 35], sanity: [13, 24], secret: 0.12 },
      { label: "{clueGa} 떨리는 반대편으로 간다", style: "careful", fear: [16, 27], sanity: [10, 19], secret: 0.18 },
      { label: "멈춰 서서 {witnessGa} 숨 쉬는 박자를 센다", style: "safe", fear: [12, 22], sanity: [15, 26], secret: 0.08 }
    ]
  },
  {
    title: "악몽의 심장",
    text: "{threatGa} 마침내 형태를 갖춘다. 그것은 당신을 공격하기보다 당신의 기억을 하나씩 삼키며, {anchor} 전체를 거대한 폐처럼 부풀린다.",
    options: [
      { label: "{threat} 안으로 뛰어들어 중심을 찢는다", style: "risky", fear: [30, 45], sanity: [10, 22], secret: 0.3 },
      { label: "{clue}로 자신의 이름을 긁어 남긴다", style: "careful", fear: [18, 30], sanity: [12, 21], secret: 0.22 },
      { label: "{witness}에게 마지막 문을 묻는다", style: "safe", fear: [15, 26], sanity: [16, 28], secret: 0.1 }
    ]
  },
  {
    title: "깨어나기 직전",
    text: "출구처럼 보이는 틈이 열린다. 하지만 그 너머에도 {anchorGa} 있고, 그 안쪽에서 {threatGa} 당신이 입력한 단어들을 하나씩 되읽고 있다.",
    options: [
      { label: "틈을 통과하며 {clueEul} 버린다", style: "escape", fear: [18, 31], sanity: [10, 21], secret: 0.04 },
      { label: "{clueEul} 들고 틈을 잠근다", style: "secret", fear: [24, 38], sanity: [12, 26], secret: 0.45 },
      { label: "{witness}와 자리를 바꾼다", style: "mad", fear: [20, 34], sanity: [20, 34], secret: 0.25 }
    ]
  }
];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hasBatchim(word) {
  const char = word.trim().charCodeAt(word.trim().length - 1);
  if (char < 0xac00 || char > 0xd7a3) return false;
  return (char - 0xac00) % 28 !== 0;
}

function josa(word, withBatchim, withoutBatchim) {
  return `${word}${hasBatchim(word) ? withBatchim : withoutBatchim}`;
}

function classify(word) {
  const clean = word.trim() || "그림자";
  const order = ["nature", "place", "person", "object", "emotion"];
  for (const type of order) {
    const words = lexicon[type];
    if (words.some((entry) => clean.includes(entry) || entry.includes(clean))) {
      return { word: clean, type, ...profiles[type] };
    }
  }

  if (/(곳|실|관|역|길|동|층|방|교|원)$/.test(clean)) return { word: clean, type: "place", ...profiles.place };
  if (/(님|씨|이|자|생|친구|엄마|아빠)$/.test(clean)) return { word: clean, type: "person", ...profiles.person };
  if (/(문|칼|책|폰|병|상자|열쇠|사진|거울)$/.test(clean)) return { word: clean, type: "object", ...profiles.object };
  return { word: clean, type: "emotion", ...profiles.emotion };
}

function buildWorld(words) {
  const concepts = words.map(classify);
  const threat = concepts.find((item) => item.type === "nature") ||
    concepts.find((item) => item.type === "emotion") ||
    concepts[1] ||
    concepts[0];
  const anchor = concepts.find((item) => item.type === "place" && item.word !== threat.word) ||
    concepts.find((item) => item.word !== threat.word) ||
    concepts[0];
  const clue = concepts.find((item) => item.type === "object") ||
    concepts.find((item) => item.word !== anchor.word && item.word !== threat.word) ||
    concepts[2] ||
    concepts[0];
  const witness = concepts.find((item) => item.type === "person") ||
    concepts.find((item) => item.word !== anchor.word && item.word !== threat.word && item.word !== clue.word) ||
    { word: "검은 형체", ...profiles.person };

  return {
    concepts,
    anchor,
    threat,
    clue,
    witness,
    motif: `${anchor.word}-${threat.word}-${clue.word}`
  };
}

function fill(template) {
  const world = state.world;
  return template
    .replaceAll("{anchorGa}", josa(world.anchor.word, "이", "가"))
    .replaceAll("{anchorEun}", josa(world.anchor.word, "은", "는"))
    .replaceAll("{anchorEul}", josa(world.anchor.word, "을", "를"))
    .replaceAll("{threatGa}", josa(world.threat.word, "이", "가"))
    .replaceAll("{threatEun}", josa(world.threat.word, "은", "는"))
    .replaceAll("{threatEul}", josa(world.threat.word, "을", "를"))
    .replaceAll("{clueGa}", josa(world.clue.word, "이", "가"))
    .replaceAll("{clueEun}", josa(world.clue.word, "은", "는"))
    .replaceAll("{clueEul}", josa(world.clue.word, "을", "를"))
    .replaceAll("{witnessGa}", josa(world.witness.word, "이", "가"))
    .replaceAll("{witnessNeun}", josa(world.witness.word, "은", "는"))
    .replaceAll("{witnessEul}", josa(world.witness.word, "을", "를"))
    .replaceAll("{anchor}", world.anchor.word)
    .replaceAll("{threat}", world.threat.word)
    .replaceAll("{clue}", world.clue.word)
    .replaceAll("{witness}", world.witness.word)
    .replaceAll("{verb}", pick(world.threat.verbs))
    .replaceAll("{omen}", pick(world.threat.omen));
}

function makePrologue() {
  const prologue = fill(pick(sceneTemplates));
  const omen = `${josa(state.world.threat.word, "은", "는")} 악몽 안에서 ${pick(state.world.threat.verbs)}. ${pick(state.world.threat.omen)}.`;
  return `${prologue} ${omen}`;
}

function typeText(text, done) {
  clearInterval(typingTimer);
  storyText.textContent = "";
  choiceArea.innerHTML = "";
  let index = 0;
  typingTimer = setInterval(() => {
    storyText.textContent += text[index] || "";
    index += 1;
    if (index > text.length) {
      clearInterval(typingTimer);
      if (done) done();
    }
  }, 18);
}

function corruptLabel(realLabel, index) {
  if (state.sanity > 68) return realLabel;
  if (state.sanity > 42) {
    const fragments = ["문을 연다", "도망친다", "숨을 쉰다", "돌아본다", state.world.threat.word];
    return Math.random() < 0.42 ? pick(fragments) : realLabel;
  }
  if (state.sanity > 20) {
    return index === 1 ? realLabel : pick(["Run", "Run", "Open Door", "Hide", state.world.clue.word]);
  }
  return pick(["Run", "Run", "Run", "너는 이미 골랐다", state.world.threat.word]);
}

function renderChoices() {
  choiceArea.innerHTML = "";
  const step = eventSteps[state.turn - 1];
  step.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = `choice-button ${state.sanity <= 55 ? "corrupt" : ""}`;
    button.type = "button";
    button.textContent = corruptLabel(fill(option.label), index);
    button.addEventListener("click", () => choose(option));
    choiceArea.appendChild(button);
  });
}

function updateStatus() {
  fearValue.textContent = state.fear;
  sanityValue.textContent = state.sanity;
  turnValue.textContent = `${Math.min(state.turn, MAX_TURNS)} / ${MAX_TURNS}`;
  fearFill.style.width = `${state.fear}%`;
  sanityFill.style.width = `${state.sanity}%`;
}

function pulseFear() {
  document.body.classList.remove("shake");
  void document.body.offsetWidth;
  document.body.classList.add("shake");
}

function pulseSanity() {
  storyBox.classList.remove("distort");
  void storyBox.offsetWidth;
  storyBox.classList.add("distort");
}

function choose(option) {
  const fearGain = rand(option.fear[0], option.fear[1]) + Math.max(0, state.turn - 2) * 3;
  const sanityLoss = rand(option.sanity[0], option.sanity[1]);
  state.fear = clamp(state.fear + fearGain, 0, 100);
  state.sanity = clamp(state.sanity - sanityLoss, 0, 100);
  if (Math.random() < option.secret) state.secret = true;
  if (option.style === "risky") state.risky += 1;
  if (option.style === "safe") state.safe += 1;
  if (option.style === "secret") state.secret = true;

  updateStatus();
  if (fearGain >= 22) pulseFear();
  if (sanityLoss >= 15) pulseSanity();

  if (state.fear >= 100) {
    endGame("GAME OVER", "You became part of the nightmare. 마지막으로 본 것은 탈출구가 아니라, 당신의 세 단어가 천천히 당신의 이름으로 바뀌는 장면이었다.");
    return;
  }

  state.turn += 1;
  if (state.turn > MAX_TURNS) {
    resolveEnding(option);
    return;
  }

  const step = eventSteps[state.turn - 1];
  const consequence = makeConsequence(option, fearGain, sanityLoss);
  typeText(`${step.title}\n\n${consequence} ${fill(step.text)}`, renderChoices);
  updateStatus();
}

function makeConsequence(option, fearGain, sanityLoss) {
  const world = state.world;
  const map = {
    risky: `${fill(option.label)}. 그 순간 ${josa(world.threat.word, "이", "가")} 반응한다. 공포가 ${fearGain}만큼 치솟고, 정신력은 ${sanityLoss}만큼 깎인다.`,
    careful: `${fill(option.label)}. 선택은 늦지만 분명했다. ${josa(world.clue.word, "이", "가")} 잠깐 길을 보여 주지만, 대가로 정신력을 ${sanityLoss}만큼 잃는다.`,
    safe: `${fill(option.label)}. 몸은 숨었지만 악몽은 기다리는 법을 안다. 공포는 ${fearGain}만큼 쌓이고, 생각은 ${sanityLoss}만큼 흐려진다.`,
    escape: `${fill(option.label)}. 출구가 가까워지자 ${world.anchor.word} 전체가 당신을 붙잡는다.`,
    secret: `${fill(option.label)}. 악몽은 처음으로 당신을 플레이어라고 부른다.`,
    mad: `${fill(option.label)}. 누구의 꿈인지 구분하는 선이 찢어진다.`
  };
  return map[option.style] || map.careful;
}

function resolveEnding(lastOption) {
  if (state.secret && state.sanity > 18) {
    endGame("Hidden Secret Ending", `${state.world.clue.word}을 통해 당신은 악몽의 바깥을 본다. ${state.world.threat.word}은 괴물이 아니라, 당신이 입력한 단어를 해석하던 검은 인터페이스였다. 화면은 꺼지지만 마지막 줄은 남는다. "다음 단어를 입력하세요."`);
  } else if (state.sanity <= 22 || lastOption.style === "mad") {
    endGame("Madness Ending", `당신은 눈을 뜬다. 하지만 방의 벽은 아직 ${state.world.anchor.word}의 구조를 하고 있고, 누군가 ${state.world.witness.word}의 목소리로 당신의 생각을 대신 읽는다. 탈출은 성공했지만 현실이 어느 쪽인지는 알 수 없다.`);
  } else if (state.fear >= 78 || state.risky >= 3) {
    endGame("Lost Ending", `출구를 통과했지만 ${state.world.threat.word}의 일부가 따라 나왔다. 아침의 빛은 낯설고, ${state.world.clue.word}에는 아직 꿈속의 복도가 비친다. 당신은 깨어났지만 무언가를 그곳에 두고 왔다.`);
  } else {
    endGame("Escape Ending", `당신은 마지막 순간 ${state.world.clue.word}에 새긴 자신의 이름을 붙잡고 깨어난다. ${state.world.anchor.word}의 냄새는 사라지고, ${state.world.threat.word}의 숨소리도 멎는다. 악몽은 닫혔지만 세 단어는 아직 기억난다.`);
  }
}

function endGame(title, text) {
  choiceArea.innerHTML = "";
  storyBox.classList.add("ending");
  typeText(`${title}\n\n${text}`, () => {
    const button = document.createElement("button");
    button.className = "primary-button";
    button.type = "button";
    button.textContent = "Dream Again";
    button.addEventListener("click", resetGame);
    choiceArea.appendChild(button);
  });
}

function startGame() {
  const words = [
    document.getElementById("word1").value.trim(),
    document.getElementById("word2").value.trim(),
    document.getElementById("word3").value.trim()
  ].map((word, index) => word || ["바다", "학교", "거울"][index]);

  state = {
    words,
    world: buildWorld(words),
    fear: 0,
    sanity: 100,
    turn: 1,
    secret: false,
    risky: 0,
    safe: 0
  };

  inputStage.hidden = true;
  gameStage.hidden = false;
  restartBtn.hidden = false;
  storyBox.classList.remove("ending", "distort");
  updateStatus();
  typeText(makePrologue(), renderChoices);
}

function resetGame() {
  clearInterval(typingTimer);
  inputStage.hidden = false;
  gameStage.hidden = true;
  restartBtn.hidden = true;
  storyText.textContent = "";
  choiceArea.innerHTML = "";
  state = null;
  fearValue.textContent = "0";
  sanityValue.textContent = "100";
  turnValue.textContent = "0 / 5";
  fearFill.style.width = "0%";
  sanityFill.style.width = "100%";
  storyBox.classList.remove("ending", "distort");
}

generateBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", resetGame);

document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") startGame();
  });
});
