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

const parseModel = (model, starter) => {
  const personEmoji = '👤';
  const interviewerEmoji = '📖';
  const intervieweeEmoji = '✏️';

  const interviewStarter = `Interviewer: ${interviewerEmoji}\nInterviewee:${intervieweeEmoji}\n\n`;
  const pairStarter = '';
  let result = starter === 'REACTO' ? interviewStarter : pairStarter;

  let pairIndex = 2;

  model.forEach((m) => {
    result += `Room ${pairIndex}\n${
      starter === 'REACTO' ? interviewerEmoji : personEmoji
    } ${m.interviewer}\n`;

    if (m.interviewee_one) {
      result += `${starter === 'REACTO' ? intervieweeEmoji : personEmoji} ${
        m.interviewee_one
      }\n${starter === 'REACTO' ? intervieweeEmoji : personEmoji} ${
        m.interviewee_two
      }`;
    } else {
      result += `${starter === 'REACTO' ? intervieweeEmoji : personEmoji} ${
        m.interviewee
      }`;
    }

    result += '\n\n';
    pairIndex++;
  });

  return result;
};

const renderPage = () => {
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

        const shufflePairs = () => {
          shuffle(interviewers);
          shuffle(interviewees);
        };

        shufflePairs();

        const getModel = () => {
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

          return model;
        };

        const EXCLUDED_PAIRS = document.getElementById('excluded-pairs');
        const exclusionList = EXCLUDED_PAIRS.value
          .split('\n')
          .map((pair) => pair.split(/\,\s+|\,\s?/));

        let model = getModel();

        let runs = 0;
        // rerun pair algorithm if excluded pair is generated
        while (
          model.some((m) => {
            if (m.interviewee_one) {
              return exclusionList.some(
                (entry) =>
                  (entry.includes(m.interviewer) &&
                    entry.includes(m.interviewee_one)) ||
                  (entry.includes(m.interviewer) &&
                    entry.includes(m.interviewee_two)) ||
                  (entry.includes(m.interviewee_one) &&
                    entry.includes(m.interviewee_two))
              );
            } else {
              return exclusionList.some(
                (entry) =>
                  entry.includes(m.interviewer) && entry.includes(m.interviewee)
              );
            }
          })
        ) {
          if (runs === 100) {
            throw new Error(
              'pair algorithm has run too many times, aborting...'
            );
          }
          console.log(
            'problematic pair detected, rerunning pairing algorithm...'
          );
          shufflePairs();
          model = getModel();
          runs++;
        }

        // determine lab/workshop or REACTO style emojis
        const RADIO_GROUP = document.getElementsByName('type-of-generator');
        const selectedRadioGroup = Array.from(RADIO_GROUP).filter(
          (input) => input.checked
        )[0].value;

        // generate model output for copying
        const modelPre = document.createElement('pre');
        modelPre.innerText = parseModel(model, selectedRadioGroup);
        PAGE.appendChild(modelPre);

        // copy pairs button
        const copyBtn = document.createElement('button');
        copyBtn.innerText = 'Copy Pairs';
        copyBtn.addEventListener('click', async () => {
          await navigator.clipboard.writeText(modelPre.innerText);
        });
        PAGE.appendChild(copyBtn);
        copyBtn.scrollIntoView();
      });

      reader.readAsBinaryString(file);
    }
  });
};

renderPage();
