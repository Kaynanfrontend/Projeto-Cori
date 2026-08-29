const form = document.querySelector('.reserva__form');

form.addEventListener('submit', function(event) {
  event.preventDefault();

  form.innerHTML = `
    <div style="text-align: center; padding: 4rem 0;">
      <p style="font-size: 2.4rem; color: #c9a84c; font-family: 'Playfair Display', serif; margin-bottom: 1.6rem;">
        Reserva confirmada!
      </p>
      <p style="color: #888; font-size: 1.6rem;">
        Entraremos em contato em breve para confirmar sua reserva.
      </p>
    </div>
  `;
});