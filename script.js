// script.js
// Arquivo auxiliar para comportamento do login e navegação básica.

function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function mostrarMensagem(mensagem, tipo = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.textContent = mensagem;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.cursor = 'pointer';

    notification.addEventListener('click', () => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

const loginForm = document.getElementById('loginForm');
const statusMessage = document.getElementById('statusMessage');

if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        // O formulário já envia para login.php via POST;
        // esta função apenas pode ser usada para exibir feedback se necessário.
        statusMessage.textContent = 'Entrando...';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const modal = button.closest('.modal');
            if (modal && modal.id) {
                fecharModal(modal.id);
            }
        });
    });

    const statusMessageBox = document.getElementById('statusMessage');
    if (statusMessageBox && statusMessageBox.classList.contains('show')) {
        setTimeout(() => {
            statusMessageBox.classList.remove('show');
        }, 4500);
    }
});
