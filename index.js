const ROOT = document.getElementById('root');

const fileInput = `
  <input
    type="file"
    id="student-list"
    name="student-list"
    accept="text/csv, text/plain"
  />
`;

const page = `
  <section id="page">
    <h1>REACTO Pair Generator</h1>
    <div>
      <label for="student-list">Upload a student list (CSV)</label>
      ${fileInput}
    </div>
  </section>
`;

const shuffle = (arr) => {
  let end = arr.length - 1;
  while (end > 0) {
    const temp = arr[end];
    const randIdx = Math.floor(Math.random() * end);
    const moveToEnd = arr[randIdx];
    arr[end] = moveToEnd;
    arr[randIdx] = temp;
    end--;
  }
};

const parseModel = (model) => {
  const interviewerEmoji = '📖';
  const intervieweeEmoji = '✏️';

  let result = 'Interviewer: 📖\nInterviewee: ✏️\n\n';

  model.forEach((m) => {
    result += interviewerEmoji + ' ' + m.interviewer + '\n';

    if (m.interviewee_one) {
      result +=
        intervieweeEmoji +
        ' ' +
        m.interviewee_one +
        '\n' +
        intervieweeEmoji +
        ' ' +
        m.interviewee_two;
    } else {
      result += intervieweeEmoji + ' ' + m.interviewee;
    }

    result += '\n\n';
  });

  return result;
};

// content: string
const renderPage = (content) => {
  ROOT.innerHTML = content;

  const PAGE = document.getElementById('page');
  const FILE_INPUT = document.getElementById('student-list');

  FILE_INPUT.addEventListener('change', function () {
    if (this.files && this.files[0]) {
      const file = this.files[0];
      const reader = new FileReader();

      reader.addEventListener('load', (e) => {
        const names = e.target.result
          .replace(/\s+/g, '\n')
          .split('\n')
          .filter((val) => val);

        const interviewers = [];
        const interviewees = [];

        for (let i = 0; i < names.length; i++) {
          const target = i % 2 === 0 ? interviewees : interviewers;
          target.push(names[i]);
        }

        shuffle(interviewers);
        shuffle(interviewees);

        const model = interviewers.map((p, i) => ({
          interviewer: p,
          interviewee: interviewees[i],
        }));

        if (interviewees.length > interviewers.length) {
          model[model.length - 1] = {
            interviewer: model[model.length - 1].interviewer,
            interviewee_one: model[model.length - 1].interviewee,
            interviewee_two: interviewees[interviewees.length - 1],
          };
        }

        const modelPre = document.createElement('pre');
        modelPre.innerText = parseModel(model);
        PAGE.appendChild(modelPre);

        const copyBtn = document.createElement('button');
        copyBtn.id = 'copyBtn';
        copyBtn.innerText = 'Copy Pairs';
        copyBtn.addEventListener('click', () => {
          const range = document.createRange();
          range.selectNode(modelPre);
          window.getSelection().addRange(range);
          document.execCommand('copy');
        });
        PAGE.appendChild(copyBtn);
      });

      reader.readAsBinaryString(file);
    }
  });
};

renderPage(page);
