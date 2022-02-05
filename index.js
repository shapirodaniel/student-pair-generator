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

// main: string, added: object
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
          .filter((val) => val)
          .join('\n');

        const pre = document.createElement('pre');
        pre.innerHTML = names;
        PAGE.appendChild(pre);
      });

      reader.readAsBinaryString(file);
    }
  });
};

renderPage(page);
