let contador = 1; // Começa com 1 já na tela
// ADICIONA SLOT DE CONGRUÊNCIA
function adicionarCongruencia() {
  contador++;

  const container = document.getElementById('congruencias');

  const novaDiv = document.createElement('div');
  novaDiv.className = 'congruencia';
  novaDiv.id = `congruencia-${contador}`;
  novaDiv.innerHTML = `
    Congruência ${contador}: 
    <input type="number" value="1" placeholder="a" class="remainder">
    x ≡ 
    <input type="number" placeholder="b" class="remainder">
    (mod 
    <input type="number" placeholder="m" class="remainder">)
  `;

  container.appendChild(novaDiv);
}
// REMOVE SLOT DE CONGRUÊNCIA
function removerCongruencia() {
  if (contador > 1) {
    const container = document.getElementById('congruencias');
    const ultima = document.getElementById(`congruencia-${contador}`);
    container.removeChild(ultima);
    contador--;
  }
}
// CALCULA MDC
function mdc(a, b) {
  if(b == 0)
    return a
  return mdc(b, a % b)
}
// CALCULA O INVERSO DE UM NÚMERO
function modInverse(a, m) {
  if (mdc(a, m) !== 1) {
    throw new Error(`Não existe inverso modular: MDC(${a}, ${m}) ≠ 1`);
  }
  let m0 = m, x0 = 0, x1 = 1;

  while (a > 1) {
      let q = Math.floor(a / m);
      let temp = m;

      m = a % m;
      a = temp;

      let t = x0;
      x0 = x1 - q * x0;
      x1 = t;
  }
  return x1 < 0 ? x1 + m0 : x1;
}
// VÊ SE OS NÚMEROS SÃO CO-PRIMOS
function sãoCoprimos(congruencias) {
  for (let i = 0; i < congruencias.length; i++) {
      for (let j = i + 1; j < congruencias.length; j++) {
          if (mdc(congruencias[i].m, congruencias[j].m) !== 1) {
              return false;
          }
      }
  }
  return true;
}
// TRANSFORMA O CÓDIGO NA FÓRMULA CANÔNICA
function transformarCanonica(a, b, m) {
  const inv = modInverse(a, m);
  return (inv * b) % m;
}
// RESOLVE O TCR E SALVA OS PASSOS
function resolverTCR(congruencias) {
  const passos = [];
  const M = congruencias.reduce((acc, { m }) => acc * m, 1);
  let x = 0;

  for (const { b, m } of congruencias) {
      const Mi = M / m;
      const inv = modInverse(Mi, m);
      const contrib = b * Mi * inv;
      x += contrib;

      passos.push({
          b,
          m,
          Mi,
          inv,
          contrib
      });
  }

  return {
      resultado: ((x % M) + M) % M,
      M,
      passos
  };
}
// CALCULA A CONGRUÊNCIA
function calculaCongruencia() {
  const inputs = document.querySelectorAll(".congruencia");
  let congruencias = [];

  for (let input of inputs) {
    let [aField, bField, mField] = input.querySelectorAll("input");
    let a = parseInt(aField.value);
    let b = parseInt(bField.value);
    let m = parseInt(mField.value);
    
    if (isNaN(a) || isNaN(b) || isNaN(m)) {
      document.getElementById("resultado").innerHTML = "";
      mostrarMensagem("<strong>Não foi possível calcular:</strong> Preencha todos os campos da congruência.", "erro");
      return;
    }
    
    if (a === 0) {
      document.getElementById("resultado").innerHTML = "";
      mostrarMensagem("<strong>Erro:</strong> Coeficiente 'a' não pode ser zero.", "erro");
      return;
    }

    if(m <= 0) {
      document.getElementById("resultado").innerHTML = "";
      mostrarMensagem("<strong>Não é possível calcular um módulo negativo!","erro");
      return;
    }

    if(b % mdc(a, m) !== 0){
      document.getElementById("resultado").innerHTML = "";
      const d = mdc(a,m)
      mostrarMensagem("<strong>Não foi possível calcular: </strong>MDC("+a+","+m+") = "+d+" ∤ "+b+".","erro");
      return;
    }

    if (a !== 1) {
      try {
        b = transformarCanonica(a, b, m);
      } catch (e) {
        document.getElementById("resultado").innerHTML = "";
        mostrarMensagem(`<strong>Não foi possível calcular:</strong> Não foi possível transformar a congruência ${a}x ≡ ${b} (mod ${m}) para a forma canônica. Motivo: ${e.message}`, "erro");
        return;
      }
    }
    congruencias.push({ b, m });
  }

  if (!sãoCoprimos(congruencias)) {
    document.getElementById("resultado").innerHTML = "";
    mostrarMensagem("<strong>Não foi possível calcular:</strong> Os módulos fornecidos não são coprimos entre si. O Teorema do Resto Chinês requer que todos os módulos sejam coprimos.", "erro");
    return;
  }

  const resultado = resolverTCR(congruencias);
  const modulos = congruencias.map(c => c.m);
  document.getElementById("resultado").innerHTML = "";
  mostrarResultado({...resultado, modulos});
}
// ESSE NEGÓCIO TÁ FEIO, MAS A FORMATAÇÃO TÁ SHOW, PAPAI
function mostrarResultado({ resultado, M, passos, modulos }) {
  const div = document.getElementById("resultado");

  let explicacao = `
      <div class="mensagem sucesso">
          <h2>Resultado Final</h2>
          <p><strong>x ≡ ${resultado} (mod ${M})</strong></p>
      </div>
      
      <div class="mensagem info">
          <h3>Passo a Passo Explicado:</h3>
          <strong>1. Verificação dos módulos:</strong> Os módulos inseridos foram: ${modulos.join(", ")}. Como todos são coprimos entre si, o Teorema do Resto Chinês pode ser aplicado.

          <strong>2. Produto total dos módulos:</strong> M = ${modulos.join(" × ")} = ${M}.

          <strong>3. Cálculo dos termos individuais:</strong>
  `;

  passos.forEach((passo, index) => {
      explicacao += `
          &nbsp;&nbsp;&nbsp;Congruência ${index + 1}:</strong> x ≡ ${passo.b} (mod ${passo.m})
          <ul>
              <li>Mi = M / m <br> ${M} / ${passo.m} = ${passo.Mi}</li>
              <li>Calculamos o inverso modular de ${passo.Mi} mod ${passo.m} usando o Algoritmo de Euclides Estendido:</li>
              <li>inverso(${passo.Mi} mod ${passo.m}) = ${passo.inv}</li>
              <li>Termo da soma: ${passo.b} × ${passo.Mi} × ${passo.inv} = ${passo.contrib}</li>
          </ul>
      `;
  });

  explicacao += `
          <strong>4. Soma dos termos individuais:</strong> ${passos.map(p => p.contrib).join(" + ")} = ${passos.reduce((acc, p) => acc + p.contrib, 0)}

          <strong>5. Aplicando módulo:</strong> ${passos.reduce((acc, p) => acc + p.contrib, 0)} mod ${M} = ${resultado}
          
          <strong>6. Resultado final:</strong> x ≡ ${resultado} (mod ${M})
      </div>
  `;

  div.innerHTML = explicacao;
}

// SÓ PRA SELECIONAR A MENSAGEM NORMAL.
function mostrarMensagem(mensagem, tipo = 'info') {
  const resultado = document.getElementById("resultado");
  const div = document.createElement("div");
  div.className = `mensagem ${tipo}`;
  div.innerHTML = mensagem;
  resultado.appendChild(div);
} 

