let contador = 1; // Começa com 2 já na tela

function adicionarCongruencia() {
  contador++;

  const container = document.getElementById('congruencias');

  const novaDiv = document.createElement('div');
  novaDiv.className = 'congruencia';
  novaDiv.id = `congruencia-${contador}`;
  novaDiv.innerHTML = `
    Congruência ${contador}: 
    <input type="number" placeholder="a" class="remainder">
    x ≡ 
    <input type="number" placeholder="b" class="remainder">
    (mod 
    <input type="number" placeholder="m" class="remainder">)
  `;

  container.appendChild(novaDiv);
}

function removerCongruencia() {
  if (contador > 1) {
    const container = document.getElementById('congruencias');
    const ultima = document.getElementById(`congruencia-${contador}`);
    container.removeChild(ultima);
    contador--;
  }
}
