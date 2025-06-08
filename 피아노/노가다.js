// 기존 코드 유지 + 마우스 클릭 및 녹음 기능 추가 + 검은 건반 소리 작게 재생 + 녹음 표시 추가 + 가로 버튼 배치 + 깜빡이는 동그라미 표시 + 재생 중 버튼 비활성화 + 저장 버튼 추가

const whiteKeyChars = ['a','s','d','f','g','h','j','k','l','z','x','c','v','b','n'];
const blackKeyChars = ['q','w','e','r','t','y','u','i','o','p','['];

const whiteKeys = document.querySelectorAll('.white-key');
const blackKeys = document.querySelectorAll('.black-key');

// 녹음 관련 변수
let isRecording = false;
let recordedNotes = [];
let startTime = null;

const recordIndicator = document.getElementById('record-indicator');
let blinkInterval = null;

// 키보드 입력 처리
document.addEventListener('keydown', function (e) {
  const key = e.key.toLowerCase();

  if (whiteKeyChars.includes(key)) {
    const index = whiteKeyChars.indexOf(key);
    const element = whiteKeys[index];
    playKey(element, key);
  } else if (blackKeyChars.includes(key)) {
    const index = blackKeyChars.indexOf(key);
    const element = blackKeys[index];
    playKey(element, key, true); // black key flag
  }
});

// 마우스 클릭 처리
whiteKeys.forEach((keyEl, index) => {
  keyEl.addEventListener('click', () => {
    const keyChar = whiteKeyChars[index];
    playKey(keyEl, keyChar);
  });
});

blackKeys.forEach((keyEl, index) => {
  keyEl.addEventListener('click', () => {
    const keyChar = blackKeyChars[index];
    playKey(keyEl, keyChar, true); // black key flag
  });
});

// 건반 눌림 효과 + 사운드 재생 + 녹음 기록
function playKey(element, keyChar, isBlack = false) {
  if (!element) return;

  const audio = new Audio(`sounds/${keyChar}.wav`);
  if (isBlack) audio.volume = 0.6;
  audio.play().catch(err => console.log("소리 재생 오류:", err));

  element.classList.add('active');
  setTimeout(() => {
    element.classList.remove('active');
  }, 150);

  if (isRecording) {
    const timeOffset = Date.now() - startTime;
    recordedNotes.push({ key: keyChar, time: timeOffset });
  }
}

function startRecording() {
  recordedNotes = [];
  startTime = Date.now();
  isRecording = true;
  if (recordIndicator) {
    blinkInterval = setInterval(() => {
      recordIndicator.classList.toggle('recording');
    }, 500);
    recordIndicator.classList.add('active');
  }
}

function stopRecording() {
  isRecording = false;
  if (recordIndicator) {
    clearInterval(blinkInterval);
    recordIndicator.classList.remove('recording');
    recordIndicator.classList.remove('active');
  }
}

function playRecording() {
  if (recordedNotes.length === 0) return;

  const playBtn = document.getElementById('play-btn');
  playBtn.disabled = true;
  playBtn.classList.add('disabled');

  const lastNoteTime = recordedNotes[recordedNotes.length - 1].time;

  recordedNotes.forEach(note => {
    setTimeout(() => {
      let keyEl = null;
      let isBlack = false;
      if (whiteKeyChars.includes(note.key)) {
        const i = whiteKeyChars.indexOf(note.key);
        keyEl = whiteKeys[i];
      } else if (blackKeyChars.includes(note.key)) {
        const i = blackKeyChars.indexOf(note.key);
        keyEl = blackKeys[i];
        isBlack = true;
      }
      playKey(keyEl, note.key, isBlack);
    }, note.time);
  });

  setTimeout(() => {
    playBtn.disabled = false;
    playBtn.classList.remove('disabled');
  }, lastNoteTime + 100);
}

// 저장 버튼: recordedNotes를 JSON 파일로 저장
function saveRecording() {
  if (recordedNotes.length === 0) return;
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(recordedNotes));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "recording.json");
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();
}

// 버튼 이벤트 바인딩
document.getElementById('record-btn').addEventListener('click', startRecording);
document.getElementById('stop-btn').addEventListener('click', stopRecording);
document.getElementById('play-btn').addEventListener('click', playRecording);
document.getElementById('save-btn').addEventListener('click', saveRecording);
document.getElementById('load-btn').addEventListener('click', () => {
  document.getElementById('load-file').click(); // 숨겨진 input 클릭
});

document.getElementById('load-file').addEventListener('change', loadRecordingFile);


// 버튼 스타일
const buttons = document.querySelectorAll('#record-btn, #stop-btn, #play-btn, #save-btn');
buttons.forEach(btn => btn.classList.add('btn'));


// JSON 파일을 불러와 recordedNotes에 세팅하고 메시지 표시
function loadRecordingFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const json = JSON.parse(e.target.result);
      if (Array.isArray(json) && json.every(note => 'key' in note && 'time' in note)) {
        recordedNotes = json;
        alert("녹음 파일이 성공적으로 불러와졌습니다!");
      } else {
        alert("올바르지 않은 형식의 파일입니다.");
      }
    } catch (err) {
      alert("파일을 읽는 중 오류가 발생했습니다.");
      console.error(err);
    }
  };
  reader.readAsText(file);
}

