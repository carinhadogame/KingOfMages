/* =========================================================
   KING OF MAGES — script.js
   ========================================================= */
(function () {
    'use strict';

    /* =====================================================
       MODAL DE PERSONAGEM
       ===================================================== */
    const modal      = document.getElementById('char-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalClass = document.getElementById('modal-class');
    const modalSprite= document.getElementById('modal-gif');
    const modalLore  = document.getElementById('modal-lore');
    const closeBtn   = modal ? modal.querySelector('.close-btn') : null;

    // Guarda quem abriu o modal pra devolver o foco ao fechar.
    let ultimoFoco = null;

    function abrirModal(card) {
        ultimoFoco = card;

        modalTitle.innerHTML = card.dataset.name  || '';
        modalClass.textContent = card.dataset.class || '';
        modalLore.textContent  = card.dataset.lore  || '';

        const sprite = card.dataset.sprite;
        if (sprite) {
            modalSprite.src = sprite;
            modalSprite.alt = (card.dataset.name || '') + ' sprite';
            modalSprite.hidden = false;
        } else {
            modalSprite.hidden = true;
        }

        modal.classList.remove('hidden');
        // Trava a rolagem do fundo enquanto o modal está aberto.
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    }

    function fecharModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        if (ultimoFoco) ultimoFoco.focus();
    }

    document.querySelectorAll('.rpg-card').forEach(function (card) {
        card.addEventListener('click', function () { abrirModal(card); });

        // Com role="button" o teclado não dispara click sozinho:
        // Enter e Espaço precisam ser tratados na mão.
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                abrirModal(card);
            }
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', fecharModal);

    // Clique no fundo escuro fecha, clique dentro da caixa não.
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) fecharModal();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
            fecharModal();
        }
    });

    /* =====================================================
       GRIMÓRIO — recorte do vídeo por magia
       ===================================================== */
    const video     = document.getElementById('skills-video');
    const entrada   = document.getElementById('skill-entry');
    const skillName = document.getElementById('current-skill-name');
    const skillTag  = document.getElementById('current-skill-tag');
    const skillLore = document.getElementById('current-skill-lore');
    const icones    = document.querySelectorAll('.spell-icon');

    /* Aceita "28" (segundos) e "01:15" (mm:ss).
       O HTML original misturava os dois formatos: parseFloat("01:15")
       devolve 1, então todas as magias depois de 1:00 começavam
       no primeiro segundo do vídeo. */
    function paraSegundos(valor) {
        if (!valor) return 0;
        const partes = String(valor).trim().split(':').map(Number);
        if (partes.some(isNaN)) return 0;
        if (partes.length === 3) return partes[0] * 3600 + partes[1] * 60 + partes[2];
        if (partes.length === 2) return partes[0] * 60 + partes[1];
        return partes[0];
    }

    let fim = null;
    let iconeAtivo = null;

    function tocarMagia(icone) {
        if (!video) return;

        const inicio = paraSegundos(icone.dataset.start);
        fim = paraSegundos(icone.dataset.end);

        if (iconeAtivo) iconeAtivo.classList.remove('active');
        icone.classList.add('active');
        iconeAtivo = icone;

        // Flash rápido antes de escrever: a troca de texto fica legível
        // em vez de simplesmente piscar de uma magia pra outra.
        if (entrada) {
            entrada.classList.add('trocando');
            setTimeout(function () {
                if (skillName) skillName.textContent = icone.dataset.name || '';
                if (skillTag)  skillTag.innerHTML    = icone.dataset.tag  || '';
                if (skillLore) skillLore.textContent = icone.dataset.lore || '';
                entrada.classList.remove('trocando');
            }, 120);
        }

        video.currentTime = inicio;
        // play() devolve uma Promise; sem catch o console enche de erro
        // quando o usuário troca de magia antes do play anterior resolver.
        const p = video.play();
        if (p) p.catch(function () {});
    }

    icones.forEach(function (icone, i) {
        icone.addEventListener('click', function () { tocarMagia(icone); });

        // Setas percorrem o inventário sem precisar dar Tab 17 vezes.
        icone.addEventListener('keydown', function (e) {
            let destino = null;
            if (e.key === 'ArrowRight') destino = icones[i + 1];
            else if (e.key === 'ArrowLeft') destino = icones[i - 1];
            if (destino) {
                e.preventDefault();
                destino.focus();
                tocarMagia(destino);
            }
        });
    });

    // Para no fim do trecho em vez de emendar na próxima magia.
    if (video) {
        video.addEventListener('timeupdate', function () {
            if (fim !== null && video.currentTime >= fim) {
                video.pause();
            }
        });
    }
})();