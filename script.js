/* =========================================================
   CORI — interações
   ========================================================= */

const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------
   1. HEADER — fundo ao rolar
   Sem isso o menu se mistura com o conteúdo das seções.
   --------------------------------------------------------- */

const header = document.getElementById('header');

function atualizarHeader() {
  header.classList.toggle('header--scrolled', window.scrollY > 40);
}

atualizarHeader();
window.addEventListener('scroll', atualizarHeader, { passive: true });

/* ---------------------------------------------------------
   2. MENU MOBILE
   --------------------------------------------------------- */

const toggle = document.getElementById('menu-toggle');
const nav = document.getElementById('nav');

function fecharMenu() {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Abrir menu');
  nav.classList.remove('is-aberta');
  header.classList.remove('is-menu-aberto');
  document.body.classList.remove('sem-scroll');
}

toggle.addEventListener('click', () => {
  const aberto = toggle.getAttribute('aria-expanded') === 'true';

  if (aberto) {
    fecharMenu();
  } else {
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu');
    nav.classList.add('is-aberta');
    header.classList.add('is-menu-aberto');
    document.body.classList.add('sem-scroll');
  }
});

nav.addEventListener('click', (e) => {
  if (e.target.closest('a')) fecharMenu();
});

/* ---------------------------------------------------------
   3. SCROLLSPY — marca a seção que está sendo lida
   --------------------------------------------------------- */

const links = document.querySelectorAll('.header__link');
const secoes = [...links].map((l) => document.querySelector(l.getAttribute('href')));

const spy = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;

      links.forEach((link) => {
        link.classList.toggle('is-ativa', link.getAttribute('href') === `#${entrada.target.id}`);
      });
    });
  },
  { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
);

secoes.forEach((secao) => secao && spy.observe(secao));

// Nenhum item ativo quando o usuário volta ao topo (hero).
window.addEventListener(
  'scroll',
  () => {
    if (window.scrollY < window.innerHeight * 0.5) {
      links.forEach((link) => link.classList.remove('is-ativa'));
    }
  },
  { passive: true }
);

/* ---------------------------------------------------------
   4. REVELAR AO ROLAR
   --------------------------------------------------------- */

const reveals = document.querySelectorAll('.reveal');

if (semMovimento) {
  reveals.forEach((el) => el.classList.add('is-visivel'));
} else {
  const observadorReveal = new IntersectionObserver(
    (entradas, obs) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add('is-visivel');
        obs.unobserve(entrada.target);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
  );

  reveals.forEach((el) => observadorReveal.observe(el));
}

/* ---------------------------------------------------------
   5. FORMULÁRIO DE RESERVA
   Validação por campo, estado de carregamento e confirmação.
   --------------------------------------------------------- */

const form = document.getElementById('form-reserva');
const botao = document.getElementById('btn-reserva');
const painelSucesso = document.getElementById('reserva-sucesso');
const emailSucesso = document.getElementById('sucesso-email');
const btnNovaReserva = document.getElementById('btn-nova-reserva');

// Impede escolher uma data no passado.
// toISOString() usa UTC e adiantaria um dia à noite no Brasil — montamos a data local.
const campoData = document.getElementById('data');
const hoje = new Date();
campoData.min = [
  hoje.getFullYear(),
  String(hoje.getMonth() + 1).padStart(2, '0'),
  String(hoje.getDate()).padStart(2, '0'),
].join('-');

const regras = {
  nome: (v) => {
    if (!v.trim()) return 'Informe seu nome.';
    if (v.trim().length < 3) return 'O nome precisa ter ao menos 3 letras.';
    return '';
  },
  email: (v) => {
    if (!v.trim()) return 'Informe seu e-mail.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Digite um e-mail válido (ex.: nome@email.com).';
    return '';
  },
  data: (v) => {
    if (!v) return 'Escolha uma data.';
    if (v < campoData.min) return 'Escolha uma data a partir de hoje.';
    return '';
  },
  pessoas: (v) => (v ? '' : 'Selecione quantas pessoas.'),
};

function validarCampo(input) {
  const regra = regras[input.name];
  if (!regra) return true;

  const mensagem = regra(input.value);
  const campo = input.closest('.campo');
  const erro = campo.querySelector('.campo__erro');

  campo.classList.toggle('is-invalido', Boolean(mensagem));
  campo.classList.toggle('is-valido', !mensagem && input.value !== '');

  if (erro) erro.textContent = mensagem;

  input.setAttribute('aria-invalid', mensagem ? 'true' : 'false');
  if (erro && erro.id) input.setAttribute('aria-describedby', erro.id);

  return !mensagem;
}

// Valida ao sair do campo; depois de errar, corrige em tempo real.
form.querySelectorAll('.campo__input').forEach((input) => {
  if (!regras[input.name]) return;

  input.addEventListener('blur', () => validarCampo(input));

  input.addEventListener('input', () => {
    if (input.closest('.campo').classList.contains('is-invalido')) validarCampo(input);
  });

  if (input.tagName === 'SELECT') {
    input.addEventListener('change', () => validarCampo(input));
  }
});

form.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const inputs = [...form.querySelectorAll('.campo__input')].filter((i) => regras[i.name]);
  const invalidos = inputs.filter((input) => !validarCampo(input));

  if (invalidos.length) {
    invalidos[0].focus();
    return;
  }

  // Estado de carregamento — o usuário sabe que o clique foi registrado.
  botao.classList.add('btn--loading');
  botao.disabled = true;
  botao.querySelector('.btn__texto').textContent = 'Enviando';

  // Substitua por uma chamada real à API quando houver back-end.
  setTimeout(() => {
    emailSucesso.textContent = document.getElementById('email').value.trim();
    form.hidden = true;
    painelSucesso.hidden = false;
    painelSucesso.scrollIntoView({ behavior: semMovimento ? 'auto' : 'smooth', block: 'center' });
  }, 1400);
});

btnNovaReserva.addEventListener('click', () => {
  form.reset();

  form.querySelectorAll('.campo').forEach((campo) => {
    campo.classList.remove('is-invalido', 'is-valido');
    const erro = campo.querySelector('.campo__erro');
    if (erro) erro.textContent = '';
  });

  botao.classList.remove('btn--loading');
  botao.disabled = false;
  botao.querySelector('.btn__texto').textContent = 'Confirmar reserva';

  painelSucesso.hidden = true;
  form.hidden = false;
  document.getElementById('nome').focus();
});

/* ---------------------------------------------------------
   6. GALERIA — lightbox
   --------------------------------------------------------- */

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxLegenda = document.getElementById('lightbox-legenda');
const fotos = [...document.querySelectorAll('.foto')];

let indiceAtual = 0;
let gatilho = null;

function mostrarFoto(indice) {
  indiceAtual = (indice + fotos.length) % fotos.length;

  const img = fotos[indiceAtual].querySelector('img');
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxLegenda.textContent = fotos[indiceAtual].querySelector('.foto__legenda').textContent;
}

function abrirLightbox(indice) {
  gatilho = fotos[indice];
  mostrarFoto(indice);
  lightbox.hidden = false;
  document.body.classList.add('sem-scroll');
  document.getElementById('lightbox-fechar').focus();
}

function fecharLightbox() {
  lightbox.hidden = true;
  document.body.classList.remove('sem-scroll');
  if (gatilho) gatilho.focus();
}

fotos.forEach((foto, indice) => {
  foto.addEventListener('click', () => abrirLightbox(indice));
});

document.getElementById('lightbox-fechar').addEventListener('click', fecharLightbox);
document.getElementById('lightbox-ant').addEventListener('click', () => mostrarFoto(indiceAtual - 1));
document.getElementById('lightbox-prox').addEventListener('click', () => mostrarFoto(indiceAtual + 1));

// Clicar no fundo fecha.
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) fecharLightbox();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!lightbox.hidden) fecharLightbox();
    else if (toggle.getAttribute('aria-expanded') === 'true') fecharMenu();
    return;
  }

  if (lightbox.hidden) return;

  if (e.key === 'ArrowLeft') mostrarFoto(indiceAtual - 1);
  if (e.key === 'ArrowRight') mostrarFoto(indiceAtual + 1);

  // Mantém o foco dentro do lightbox enquanto ele estiver aberto.
  if (e.key === 'Tab') {
    const focaveis = lightbox.querySelectorAll('button');
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];

    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primeiro.focus();
    }
  }
});
