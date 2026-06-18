const WHATSAPP_NUMBER = '5585999100100'; // ⚠️ Troque pelo número real do Professor Neto antes de publicar
const DEFAULT_MESSAGE = 'Olá, Professor Neto! Vim pelo site e gostaria de saber mais sobre a avaliação inicial.';

const header = document.querySelector('[data-header]');
const nav = document.querySelector('[data-nav]');
document.querySelector('[data-nav-toggle]')?.addEventListener('click', () => nav.classList.toggle('open'));
window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 30));

// Fecha o menu mobile ao clicar em um link
nav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => nav.classList.remove('open'));
});

document.querySelectorAll('[data-whatsapp-simple]').forEach(link => {
  link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
  link.target = '_blank';
  link.rel = 'noopener';
});

// ── Reveal on scroll ──────────────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── Contadores animados ───────────────────────────────────
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

// ── Calculadora de IMC ────────────────────────────────────
document.querySelector('[data-imc-form]')?.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const result = form.parentElement.querySelector('[data-imc-result]');
  const peso = Number(form.peso.value.replace(',', '.'));
  const altura = Number(form.altura.value.replace(',', '.'));

  if (!peso || !altura || peso <= 0 || altura <= 0) {
    result.textContent = 'Preencha peso e altura corretamente para calcular.';
    result.classList.add('result-error');
    return;
  }
  // Sanidade: altura digitada em cm por engano (ex: 175 em vez de 1.75)
  const alturaM = altura > 3 ? altura / 100 : altura;

  const imc = peso / (alturaM * alturaM);
  let status = 'faixa normal';
  if (imc < 18.5) status = 'abaixo do peso';
  if (imc >= 25) status = 'sobrepeso';
  if (imc >= 30) status = 'obesidade';

  result.classList.remove('result-error');
  result.textContent = `Seu IMC estimado é ${imc.toFixed(1)} (${status}). Use isso apenas como referência inicial — fale com o Professor Neto para uma avaliação completa.`;
});

// ── Calculadora de hidratação ─────────────────────────────
document.querySelector('[data-water-form]')?.addEventListener('submit', event => {
  event.preventDefault();
  const peso = Number(event.currentTarget.peso.value.replace(',', '.'));
  const result = document.querySelector('[data-water-result]');
  if (!peso || peso <= 0) {
    result.textContent = 'Informe um peso válido para calcular.';
    return;
  }
  const litros = (peso * 35) / 1000;
  result.textContent = `Estimativa diária: aproximadamente ${litros.toFixed(1).replace('.', ',')}L de água.`;
});

// ── Formulário de avaliação ────────────────────────────────
const assessmentForm = document.querySelector('[data-assessment-form]');
if (assessmentForm) {
  const params = new URLSearchParams(location.search);
  const plano = params.get('plano');
  if (plano) {
    const map = {
      'consultoria-online': 'Consultoria online',
      'personal-presencial': 'Personal presencial',
      'plano-evolucao': 'Plano evolução'
    };
    if (map[plano]) assessmentForm.modalidade.value = map[plano];
  }

  function showFieldError(name, message) {
    const span = assessmentForm.querySelector(`[data-error-for="${name}"]`);
    const field = assessmentForm.querySelector(`[name="${name}"]`);
    if (span) span.textContent = message;
    field?.classList.toggle('input-error', !!message);
  }

  function clearErrors() {
    assessmentForm.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    assessmentForm.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  }

  function validateForm(data) {
    let valid = true;
    if (!data.nome || data.nome.trim().length < 2) {
      showFieldError('nome', 'Informe seu nome completo.');
      valid = false;
    }
    const idade = Number(data.idade);
    if (!idade || idade < 12 || idade > 100) {
      showFieldError('idade', 'Informe uma idade válida.');
      valid = false;
    }
    if (!data.objetivo) {
      showFieldError('objetivo', 'Selecione seu objetivo principal.');
      valid = false;
    }
    if (data.telefone && data.telefone.replace(/\D/g, '').length < 10) {
      showFieldError('telefone', 'Informe um WhatsApp válido com DDD.');
      valid = false;
    }
    return valid;
  }

  assessmentForm.addEventListener('submit', event => {
    event.preventDefault();
    clearErrors();
    const data = Object.fromEntries(new FormData(assessmentForm).entries());

    if (!validateForm(data)) {
      assessmentForm.querySelector('.input-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const submitBtn = assessmentForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = 'Abrindo WhatsApp...';

    const message = `Olá, Professor Neto! Vim pelo site e gostaria de solicitar uma avaliação.

Nome: ${data.nome}
Idade: ${data.idade}
Cidade: ${data.cidade || 'Não informado'}
WhatsApp: ${data.telefone || 'Não informado'}

Objetivo: ${data.objetivo}
Altura: ${data.altura || 'Não informado'}
Peso: ${data.peso || 'Não informado'}
Treina atualmente: ${data.treina}
Dias disponíveis: ${data.dias}
Modalidade desejada: ${data.modalidade}

Observações: ${data.obs || 'Nenhuma observação.'}`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-text').textContent = 'Enviar avaliação no WhatsApp';
    }, 1500);
  });
}
