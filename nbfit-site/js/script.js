const WHATSAPP_NUMBER = '5599999999999'; // Troque pelo número real do Professor Neto. Ex: 5585999999999
const DEFAULT_MESSAGE = 'Olá, Professor Neto! Vim pelo site e gostaria de saber mais sobre a avaliação inicial.';
const header = document.querySelector('[data-header]');
const nav = document.querySelector('[data-nav]');
document.querySelector('[data-nav-toggle]')?.addEventListener('click', () => nav.classList.toggle('open'));
window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 30));

document.querySelectorAll('[data-whatsapp-simple]').forEach(link => {
  link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
  link.target = '_blank';
  link.rel = 'noopener';
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const end = Number(el.dataset.count);
    let current = 0;
    const step = Math.max(1, Math.ceil(end / 45));
    const timer = setInterval(() => {
      current += step;
      if (current >= end) { current = end; clearInterval(timer); }
      el.textContent = current;
    }, 24);
    countObserver.unobserve(el);
  });
});
document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

document.querySelector('[data-imc-form]')?.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const peso = Number(form.peso.value.replace(',', '.'));
  const altura = Number(form.altura.value.replace(',', '.'));
  const result = document.querySelector('[data-imc-result]');
  if (!peso || !altura) return;
  const imc = peso / (altura * altura);
  let status = 'faixa normal';
  if (imc < 18.5) status = 'abaixo do peso';
  if (imc >= 25) status = 'sobrepeso';
  if (imc >= 30) status = 'obesidade';
  result.textContent = `Seu IMC estimado é ${imc.toFixed(1)} (${status}). Use isso apenas como referência inicial.`;
});

document.querySelector('[data-water-form]')?.addEventListener('submit', event => {
  event.preventDefault();
  const peso = Number(event.currentTarget.peso.value.replace(',', '.'));
  const result = document.querySelector('[data-water-result]');
  if (!peso) return;
  const litros = (peso * 35) / 1000;
  result.textContent = `Estimativa diária: aproximadamente ${litros.toFixed(1).replace('.', ',')}L de água.`;
});

const assessmentForm = document.querySelector('[data-assessment-form]');
if (assessmentForm) {
  const params = new URLSearchParams(location.search);
  const plano = params.get('plano');
  if (plano) {
    const map = { 'consultoria-online': 'Consultoria online', 'personal-presencial': 'Personal presencial', 'plano-evolucao': 'Plano evolução' };
    assessmentForm.modalidade.value = map[plano] || assessmentForm.modalidade.value;
  }
  assessmentForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(assessmentForm).entries());
    const message = `Olá, Professor Neto! Vim pelo site e gostaria de solicitar uma avaliação.\n\nNome: ${data.nome}\nIdade: ${data.idade}\nCidade: ${data.cidade || 'Não informado'}\nWhatsApp: ${data.telefone || 'Não informado'}\n\nObjetivo: ${data.objetivo}\nAltura: ${data.altura || 'Não informado'}\nPeso: ${data.peso || 'Não informado'}\nTreina atualmente: ${data.treina}\nDias disponíveis: ${data.dias}\nModalidade desejada: ${data.modalidade}\n\nObservações: ${data.obs || 'Nenhuma observação.'}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  });
}
