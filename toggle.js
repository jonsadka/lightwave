let dark = false;

function toggleDarkMode() {
  dark = !dark;
  document.body.style.backgroundColor = dark ? '#3C4145' : 'white';
  const logosvg = document.querySelector('.logo svg');
  const logoname = document.querySelector('.logo div');
  const resumeButton = document.querySelector('#resume-toggle button');
  logosvg.style.fill = dark ? 'white' : '#3C4145';
  logoname.style.color = dark ? 'white' : '#3C4145';
  resumeButton.style.color = dark ? 'white' : '#3C4145';
}
