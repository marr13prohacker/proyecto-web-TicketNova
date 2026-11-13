/*
  ====================================================================
  TICKETNOVA - LOGIN, CARRUSELES, FORMULARIO DE COMPRA Y FECHA DINÁMICA
  ====================================================================
*/

document.addEventListener('DOMContentLoaded', () => {

    // ------------------------------------------------------------------
    // 1. Formulario de acceso (login.html)
    // ------------------------------------------------------------------
    const formularioLogin = document.getElementById('form-login');

    if (formularioLogin) {
        formularioLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const usuario = document.getElementById('usuario').value;
            alert(`¡Acceso concedido!\nBienvenido a TicketNova, ${usuario}`);
            formularioLogin.reset();
        });
    }

    // ------------------------------------------------------------------
    // 2. Avisos que cambian solos cada 4 segundos en login.html
    //    (misma idea del carrusel automático del proyecto "incrustado")
    // ------------------------------------------------------------------
    const avisoTitulo = document.getElementById('aviso-titulo');
    const avisoTexto = document.getElementById('aviso-texto');
    const puntos = document.querySelectorAll('.cbtis-dot');

    if (avisoTitulo && avisoTexto && puntos.length) {
        const avisos = [
            { t: '¡Preventa!', p: 'Compra tus boletos para Noche de Rock Nova antes que nadie y obtén 10% de descuento en zona General.' },
            { t: '¡Entradas digitales!', p: 'Recibe tu boleto con código QR en tu correo y entra al evento solo con tu celular.' },
            { t: '¡Precio estudiantil!', p: 'Presenta tu credencial vigente en nuestro módulo y consigue tarifas especiales en eventos seleccionados.' }
        ];
        let indiceAviso = 0;

        const mostrarAviso = (i) => {
            indiceAviso = i;
            avisoTitulo.textContent = avisos[i].t;
            avisoTexto.textContent = avisos[i].p;
            puntos.forEach((p, k) => p.classList.toggle('active', k === i));
        };

        puntos.forEach((p, k) => p.addEventListener('click', () => mostrarAviso(k)));
        setInterval(() => mostrarAviso((indiceAviso + 1) % avisos.length), 4000);
    }

    // ------------------------------------------------------------------
    // 3. Carrusel automático del hero (cada 4 segundos) con flechas y puntos
    // ------------------------------------------------------------------
    const carrusel = document.getElementById('hero-carousel');

    if (carrusel) {
        const slides = carrusel.querySelectorAll('.auto-slide');
        const contenedorPuntos = carrusel.querySelector('.auto-carousel-dots');
        let indiceAuto = 0;
        let temporizador;

        // Crea un punto por cada diapositiva
        slides.forEach((_, i) => {
            const punto = document.createElement('button');
            punto.type = 'button';
            punto.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}`);
            punto.addEventListener('click', () => { irA(i); reiniciar(); });
            contenedorPuntos.appendChild(punto);
        });
        const puntosHero = contenedorPuntos.querySelectorAll('button');

        function irA(nuevo) {
            slides[indiceAuto].classList.remove('active');
            puntosHero[indiceAuto].classList.remove('active');
            indiceAuto = (nuevo + slides.length) % slides.length;
            slides[indiceAuto].classList.add('active');
            puntosHero[indiceAuto].classList.add('active');
        }

        function reiniciar() {
            clearInterval(temporizador);
            temporizador = setInterval(() => irA(indiceAuto + 1), 4000);
        }

        carrusel.querySelector('.prev').addEventListener('click', () => { irA(indiceAuto - 1); reiniciar(); });
        carrusel.querySelector('.next').addEventListener('click', () => { irA(indiceAuto + 1); reiniciar(); });

        puntosHero[0].classList.add('active');
        reiniciar();
    }

    // ------------------------------------------------------------------
    // 4. Carrusel de eventos: botones y arrastre con el mouse
    // ------------------------------------------------------------------
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const track = document.getElementById('teachers-track');

    if (btnPrev && btnNext && track) {

        const getScrollAmount = () => {
            const card = track.querySelector('.teacher-card');
            if (!card) return 320;
            return card.offsetWidth + 24; // ancho de la tarjeta + separación (gap)
        };

        btnNext.addEventListener('click', () => track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' }));
        btnPrev.addEventListener('click', () => track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' }));

        // Arrastre suave con el mouse
        let isDown = false, startX, scrollLeft, moved = false;

        track.addEventListener('mousedown', (e) => {
            isDown = true;
            moved = false;
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
            track.classList.add('dragging');
        });

        window.addEventListener('mouseup', () => {
            if (!isDown) return;
            isDown = false;
            track.classList.remove('dragging');
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            const x = e.pageX - track.offsetLeft;
            if (Math.abs(x - startX) > 5) moved = true;
            if (moved) e.preventDefault();
            track.scrollLeft = scrollLeft - (x - startX) * 1.5;
        });
    }

    // ------------------------------------------------------------------
    // 5. Botones "Comprar": eligen el evento en el formulario y bajan a él
    // ------------------------------------------------------------------
    const selectEvento = document.getElementById('info_evento');
    const selectZona = document.getElementById('info_zona');
    const inputCantidad = document.getElementById('info_cantidad');
    const totalEl = document.getElementById('total-estimado');

    const formatoMXN = (n) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

    // Calcula el total: precio base del evento x multiplicador de zona x cantidad
    function calcularTotal() {
        if (!selectEvento || !selectZona || !inputCantidad || !totalEl) return 0;
        const opcion = selectEvento.options[selectEvento.selectedIndex];
        const base = Number(opcion && opcion.dataset.precio) || 0;
        const zona = Number(selectZona.value) || 0;
        const cantidad = Math.min(8, Math.max(1, parseInt(inputCantidad.value, 10) || 1));
        const total = base * zona * cantidad;
        totalEl.textContent = formatoMXN(total) + ' MXN';
        return total;
    }

    document.querySelectorAll('.btn-buy').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (!selectEvento) return;
            selectEvento.value = btn.dataset.evento;
            calcularTotal();
            document.getElementById('comprar').scrollIntoView({ behavior: 'smooth' });
        });
    });

    [selectEvento, selectZona, inputCantidad].forEach((el) => el && el.addEventListener('input', calcularTotal));

    // Fecha mínima del pago: hoy
    const campoFecha = document.getElementById('info_fecha');
    if (campoFecha) {
        const h = new Date();
        campoFecha.min = `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(h.getDate()).padStart(2, '0')}`;
    }

    // ------------------------------------------------------------------
    // 6. Envío del formulario de compra
    // ------------------------------------------------------------------
    const formularioCompra = document.getElementById('form-hero-informes');

    if (formularioCompra) {
        formularioCompra.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = document.getElementById('info_nombre').value;
            const evento = selectEvento.options[selectEvento.selectedIndex].text.split(' - ')[0];
            const cantidad = inputCantidad.value;
            const total = calcularTotal();
            alert(`¡Gracias, ${nombre}!\nApartamos ${cantidad} boleto(s) para "${evento}".\nTotal estimado: ${formatoMXN(total)} MXN\nTe enviaremos las instrucciones de pago a tu correo.`);
            formularioCompra.reset();
            calcularTotal();
        });
    }

    // ------------------------------------------------------------------
    // 7. Fecha dinámica en el pie de página (idea del proyecto "incrustado")
    // ------------------------------------------------------------------
    const elementoTiempo = document.getElementById('fecha-dinamica');

    if (elementoTiempo) {
        const hoy = new Date();
        const fechaISO = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
        elementoTiempo.setAttribute('datetime', fechaISO);
        elementoTiempo.textContent = hoy.toLocaleDateString('es-MX', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

});
