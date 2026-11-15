# Céu Estrelado — Sistema de Design (Tema Escuro)

> **Um tema escuro que não é "painel escuro": é um céu noturno.**
> Fundo em gradiente profundo, luz difusa no canto superior, superfícies translúcidas que deixam o céu permear e estrelas pequenas em azul que respiram.
>
> Documento portátil. Não descreve um aplicativo específico: descreve **um conjunto de decisões** que você pode aplicar em qualquer projeto — web, mobile, desktop, slide, dashboard.

| | |
|---|---|
| **Nome** | Céu Estrelado (Starry Night) |
| **Uso previsto** | Apps de produtividade, ferramentas de dados, dashboards, telas de foco |
| **Temperamento** | Calmo, profundo, noturno, técnico sem ser frio |
| **Densidade** | Média — respira, mas não é aéreo |
| **Movimento** | Um único movimento perpétuo (as estrelas). Todo o resto é discreto |
| **Versão** | 1.0 |

---

## 0. O princípio

Três ideias sustentam tudo. Se você perder as três, perde o tema.

### 0.1 Profundidade por luz, não por sombra

Interfaces escuras costumam fingir volume com sombras — e sombra preta sobre fundo quase preto é invisível e suja. Aqui o volume vem de **luz**:

1. Um **gradiente vertical** escuro no topo, ligeiramente mais claro embaixo (a sensação de horizonte).
2. Um **brilho radial** no canto superior direito, como luar ou cidade ao longe.
3. **Superfícies translúcidas** (88%) em vez de opacas: o céu atravessa os cartões em 12%.

O resultado é que nada parece "colado" — tudo parece estar *dentro* da mesma atmosfera. Sombra projetada é praticamente zero. No escuro, o que separa planos é a diferença de luminosidade e a borda, não o desfoque.

### 0.2 O destaque é azul, com disciplina

Um único azul carrega a identidade: `#2C77C6`. Ele aparece em três papéis e em nenhum outro:

- **Ação** — botão primário, item selecionado.
- **Foco** — anel/borda de campo ativo.
- **Sinal** — chip numerado, detalhe de marca.

Tudo o mais é azul-acinzentado neutro. A regra é simples: **se não é clicável, selecionado ou focado, não é azul saturado.** Isso mantém o destaque com força mesmo em telas cheias.

### 0.3 As estrelas são um organismo, não um padrão

Elas não são textura. São **67 pontos independentes**, cada um com período, fase, tamanho e cor próprios, pulsando devagar. Nunca sincronizam, nunca repetem. É o único elemento em movimento contínuo da interface — e é o que transforma um fundo escuro em um *lugar*.

> Se você tirar as estrelas, o tema continua bonito e legível. Se você tirar o gradiente e o brilho, ele morre. Saber qual peça é essencial e qual é encanto evita exageros.

---

## 1. Paleta

### 1.1 Fundo e atmosfera

| Token | HEX | Papel | Como usar |
|---|---|---|---|
| `bg_top` | `#091522` | Topo do gradiente | Início do `linear-gradient` vertical |
| `bg_bottom` | `#11263E` | Base do gradiente | Fim do gradiente (≈12% mais claro) |
| `glow` | `#2D7DD2` | Luz difusa | Radial, alfa **32/255** (12,5%) |
| `void` | `#071220` | Preto do sistema | Modais, áreas fora do app, barras de sistema |

**O gradiente:** vertical puro, 180°, sem paradas intermediárias. A diferença entre topo e base é pequena de propósito — é horizonte, não aurora.

**O brilho:** centro em **84% da largura / 1% da altura** (canto superior direito, quase saindo da tela), raio ≈ 90% da maior dimensão, cor `#2D7DD2` a 12,5% caindo para 0% no fim. Ele nunca deve ser percebido como um círculo: se você consegue apontar onde ele termina, está forte demais.

### 1.2 Superfícies

| Token | HEX | Alfa | Papel |
|---|---|---|---|
| `surface` | `#112236` | **0.88** | Cartões, painéis, cabeçalho |
| `surface_alt` | `#162B44` | 1.0 | Superfície secundária: popups, modais, hovers de lista |
| `border` | `#1B3A5C` | 1.0 | Borda padrão de 1px |
| `border_strong` | `#2A567F` | 1.0 | Borda em hover, divisores enfáticos |
| `field_bg` | `#0A1828` | 1.0 | Fundo de campo de texto (**opaco**, ver 1.5) |
| `field_focus` | `#0C1E33` | 1.0 | Fundo de campo com foco |

**Regra das superfícies:** contêiner é translúcido, conteúdo digitável é opaco. Cartões a 88% deixam as estrelas aparecerem; campos a 100% garantem que o texto do usuário nunca dispute atenção com o fundo.

### 1.3 Texto

| Token | HEX | Contraste em `surface` | Uso |
|---|---|---|---|
| `text` | `#E8F0FE` | **14.0 : 1** | Títulos, valores, texto principal |
| `text_secondary` | `#94B4D4` | **7.5 : 1** | Rótulos, descrições, subtítulo |
| `text_muted` | `#6F8CAB` | **4.6 : 1** | Metadados, créditos, notas (mínimo AA) |
| `placeholder` | `#7694B4` | 5.7 : 1 em `field_bg` | Texto de exemplo em campos |

**Nunca use `#FFFFFF` puro como cor de texto.** Branco puro sobre azul profundo produz halo (o olho "vibra" na borda das letras). `#E8F0FE` é branco com um fio de azul — resolve o halo e ainda dá 14:1.

**Nunca use cinza neutro** (`#888`, `#AAA`). Todo cinza deste tema é azul: `#6F8CAB`, `#94B4D4`. É isso que faz o conjunto parecer uma atmosfera e não um tema escuro genérico.

### 1.4 Destaque

| Token | HEX | Papel | Observação |
|---|---|---|---|
| `accent` | `#2C77C6` | Azul de marca | Ações, foco, seleção |
| `accent_hover` | `#3A89DA` | Hover do destaque | **Somente borda/anel**, nunca preenchimento com texto branco |
| `accent_pressed` | `#22609C` | Pressionado | Texto branco: 6.5:1 |
| `on_accent` | `#FFFFFF` | Texto sobre o destaque | 4.6:1 em `#2C77C6` |
| `accent_soft` | `#16324F` | Fundo de badge/chip suave | — |
| `accent_soft_text` | `#9CC7FF` | Texto sobre `accent_soft` | 7.5:1 |

> ⚠️ **Ponto de atenção real:** branco sobre `accent_hover` (`#3A89DA`) dá apenas **3.6:1** — abaixo de AA para texto pequeno. Use o hover claro só como *borda* ou *glow*. Se precisar preencher, escureça para `#2F7FD4` (4.1:1) ou menos, e prefira `#2C77C6` (4.6:1) como piso.

### 1.5 Estados semânticos

Cada estado é um par fundo/texto, ambos escuros o suficiente para pertencer ao céu:

| Estado | Fundo | Texto | Contraste |
|---|---|---|---|
| Sucesso | `#12331F` | `#7EE2A8` | 8.8 : 1 |
| Erro | `#3A1618` | `#FF9E9E` | 8.1 : 1 |
| Aviso | `#3A2E12` | `#FFD479` | 9.5 : 1 |
| Informação | `#14273D` | `#B7CFEA` | 9.5 : 1 |

Nunca use verde/vermelho *puros* (`#00FF00`, `#FF0000`). Os fundos são dessaturados e escuros; os textos são claros e lavados — é o que evita o efeito "LED de painel".

### 1.6 Escala de azuis (para estender o tema)

Da escuridão à luz, passando pelo destaque. Use como rampa quando precisar de um tom novo:

```
#071220  void       — preto do sistema
#091522  bg_top     — topo do gradiente
#0A1828  field      — campos
#112236  surface    — cartões
#11263E  bg_bottom  — base do gradiente
#162B44  surface_alt— popups
#1B3A5C  border     — bordas
#2A567F  border_str — borda forte
#2C77C6  accent     — destaque
#3A89DA  hover      — realce
#5B8FC9  star dim   — estrela fraca
#9CC7FF  accent_lt  — estrela forte / texto suave
#E8F0FE  text       — texto
```

Regra de extensão: **tom novo = mesmo matiz (≈210°), saturação ≤ 65%, luminosidade coerente com a posição na rampa.** Se o tom precisa de mais de 70% de saturação para "funcionar", provavelmente não pertence a este tema.

---

## 2. Tipografia

### 2.1 Família

**Primária:** `Segoe UI` (Windows, o tema nasceu ali).
**Alternativas por plataforma, na ordem:** `Inter` → `SF Pro Text` → `system-ui` → `Roboto`.

```
font-family: "Segoe UI", "Inter", -apple-system, "SF Pro Text", "Roboto", system-ui, sans-serif;
```

Todas são humanistas/neo-grotescas com aberturas generosas. **Não misture** uma serifada "para dar personalidade": o tema já tem personalidade no fundo; a tipografia é o lugar do silêncio.

### 2.2 Escala (em px, não em pt)

| Token | Tamanho | Peso | Tracking | Uso |
|---|---|---|---|---|
| Micro | 9 px | 600–700 | **+1.1 px** (só em caixa alta) | Créditos, metadados, badges, chips |
| Legenda | 10 px | 400 | 0 | Tooltips, notas de rodapé |
| Corpo | 11 px | 400 | 0 | Rótulos, valores de campo, itens de segmento, corpo de diálogo |
| Ação | 12 px | 500–600 | 0 | Texto de botão |
| Título | 16 px | 600 | −0.2 px | Título de marca / cabeçalho de tela |

**Máximo de quatro tamanhos por tela.** Aqui a tela usa 9, 11, 12 e 16 — a hierarquia é feita por **peso e cor**, não por tamanho. É o motivo de o layout parecer calmo.

### 2.3 Regras

- **Sempre px**, nunca pt. Em telas de DPI variável, pt e px divergem e a escala se desalinha entre widgets.
- **Metadados em caixa alta só ganham tracking** (+1.1 px). Caixa alta sem tracking em 9 px vira borrão.
- **Nada abaixo de 9 px** e nada em peso 300 — sobre fundo escuro, traços finos desaparecem.
- **Line-height 1.35** para corpo; 1.2 para títulos.
- **Números tabulares** (`font-variant-numeric: tabular-nums`) em qualquer lugar que exiba contagens, valores ou progresso.
- **Reticências e cortes:** textos longos são elididos com "…", nunca quebrados em duas linhas dentro de controles de 32 px.

---

## 3. Espaço, forma e elevação

### 3.1 Escala de espaço

Base **2 px**, múltiplos pares:

```
2 · 4 · 6 · 8 · 12 · 14 · 16 · 20 · 22 · 26 · 32
```

| Uso | Valor |
|---|---|
| Respiro interno de botão | 8 px horizontal + centralização |
| Padding de campo | 11 px horizontal |
| Gap entre rótulo e campo | 6 px |
| Gap entre campos | 12 px |
| Padding de cartão | 14 px |
| Margem externa da tela | 20 px |
| Gap entre seções | 16–18 px |

### 3.2 Raios

| Elemento | Raio |
|---|---|
| Badge / pílula pequena | 6 px |
| Campo de texto | 10 px |
| Botão | 10 px |
| Cartão / painel | 12 px |
| Ponto de status / chip circular | 50% (círculo) |

Consistência importa mais que o valor: **um raio por família de elemento**. Um campo de 8 px ao lado de um botão de 10 px parece erro de pixel.

### 3.3 Alturas de controle

| Controle | Altura |
|---|---|
| Faixa superior / meta | 26 px |
| Cabeçalho de marca | 54 px |
| Campo de texto | 32 px |
| Botão | 36 px |
| Barra de status | 36 px |
| Alternador de tema | 26 px (pílula 58×26, botão deslizante de 22 px) |

**Alvos de toque:** em mobile, todo controle interativo sobe para ≥ 44 px de área efetiva (padding invisível conta).

### 3.4 Elevação

No escuro **não há sombra padrão**. A separação vem de: borda de 1 px → superfície mais clara → glow.

Duas exceções deliberadas:

1. **Botão primário:** glow externo na cor de destaque — `#2C77C6` a **37% de alfa**, blur 26 px, deslocamento 0. É luz emitida, não sombra projetada.
2. **Cartão sobre conteúdo denso** (quando necessário): sombra azul-escura `rgba(15,40,70,0.12)`, blur 28, offset Y 4.

---

## 4. Componentes

Regras genéricas, independentes de framework.

### 4.1 Cartão

Fundo `surface` a 88%, borda `#1B3A5C` 1 px, raio 12. Sem sombra. O preenchimento translúcido é o que deixa o céu respirar dentro do cartão — **se você tornar o cartão opaco, o tema perde metade do efeito.**

### 4.2 Campo de texto

- Fundo opaco `#0A1828`, borda `#1B3A5C`, raio 10, altura 32, texto 11 px.
- **Hover:** borda `#2A567F`.
- **Foco:** borda `#2C77C6` (1 px) **e** fundo `#0C1E33`. A mudança dupla (borda + fundo) é o que torna o foco óbvio sem anel grosso.
- **Placeholder:** `#7694B4`.
- Seleção de texto: fundo `#2C77C6`, texto branco.

### 4.3 Botão primário

- Gradiente vertical `#2C77C6` → `#23629F`, raio 10, altura 36, texto 12 px DemiBold branco.
- **Brilho interno (sheen):** branco a 18% no topo, caindo para 0% a 60% da altura. Um único gradiente de luz que dá a sensação de superfície curva.
- **Hover:** `#3585D8` → `#2A6FBA`.
- **Pressionado:** `#23629F` → `#1D5590` (mais escuro que o normal — no escuro, "afundar" é escurecer).
- **Desabilitado:** gradiente `#2A567F` → `#1B3A5C`, texto branco a 47%.
- **Glow:** ver 3.4.
- **Foco:** anel branco 1.5 px a 2 px para dentro da borda.

### 4.4 Botão secundário

Fundo `surface` (ou `surface_alt` em hover), borda 1 px `#1B3A5C` → `#2C77C6` no hover, texto `text_secondary` → `text` no hover. Sem gradiente, sem glow. É o contraponto silencioso do primário.

### 4.5 Chip numerado

Círculo de 20 px, fundo `#2C77C6`, número branco 9 px peso 700, raio 50%. Serve para numerar etapas. Em temas claros, o chip troca para preenchimento celeste com número azul-marinho — **o par se inverte, a função não.**

### 4.6 Controle segmentado

Trilho `field_bg` com borda `field_border`, raio **9**; pílula do item selecionado em **gradiente** `#2C77C6 → #23629F` (nunca cor chapada), raio **7**, com transição de 180–220 ms. Item ativo: texto `on_accent` 600; inativos: `text_secondary` 400. Hover de item não selecionado: preenchimento `#2C77C6` a **10%** de alfa, raio 7. Foco: anel de 1,4 px, raio 7. Altura 32.

### 4.7 Barra de status

Altura 36, fundo `surface` a 88%, borda 1 px. À esquerda um **ponto de 6 px** na cor do estado; texto 10 px `text_secondary`, elidido. Durante processamento, um **spinner de arco** de 280° na cor de destaque, girando linearmente. Ao voltar ao normal, o ponto retorna ao azul-acinzentado e o texto a "Pronto".

### 4.8 Divisor

Linha de 1 px que **desaparece nas pontas**: gradiente horizontal transparente → `#1B3A5C` em 18% → `#1B3A5C` em 82% → transparente. Um divisor de borda dura corta o layout; este apenas sugere.

### 4.9 Alternador de tema (pílula lua/sol)

Pílula 58×26, trilho `surface_alt` a **86%** de alfa com borda `#1B3A5C`, botão deslizante circular de **22 px** em gradiente `#3A89DA → #2C77C6`. Glifos desenhados (lua 5,4 px à esquerda; sol 5,0 px à direita): o do lado ativo é `on_accent`, o inativo é `text_muted`. Clicar na metade esquerda = escuro; direita = claro. Transição do botão: 180 ms, easing suave. Foco: anel de 1,5 px acompanhando o contorno (raio = metade da altura).

---

## 5. O céu estrelado  ⭐

A parte que dá nome ao tema. Esta seção é a mais detalhada de propósito: é o que quase sempre sai errado.

### 5.1 Composição em quatro camadas

Sempre nesta ordem, de baixo para cima:

```
1. Gradiente vertical      #091522 → #11263E
2. Brilho radial           #2D7DD2 @ 12.5%, canto superior direito
3. Poeira estelar          62 estrelas pequenas, cintilação contínua;
                           ~10% delas são estrelas de quatro pontas
4. Estrelas com halo       5 estrelas maiores, brilho suave ao redor
```

Nada mais. Sem nebulosa, sem vinheta extra, sem ruído. A riqueza vem do movimento das estrelas, não de mais camadas.

### 5.2 Parâmetros exatos (ponto de partida)

**Poeira estelar — 62 estrelas**

| Parâmetro | Valor |
|---|---|
| Raio | 0,8 – 1,7 px (as de quatro pontas: 4,8 – 6,8 px) |
| Alfa base | firmes 70 – 150; discretas 125 – 215; apagáveis 160 – 245; quatro pontas 200 – 255 |
| Ritmo de brilho | 3,4 – 7,8 s |
| Ritmo de presença | 7,5 – 18 s |
| Fase | aleatória em [0,1) |
| Distribuição X | 1,5% – 98,5% da largura |
| Distribuição Y | 1% – 99% da altura |
| Halo | não (as de quatro pontas têm um halo curto de 2,6×) |
| Giro das de quatro pontas | 0,06 – 0,12 rad/s, sentido sorteado |

**Estrelas com halo — 5 estrelas**

| Parâmetro | Valor |
|---|---|
| Raio | 1,5 – 2,0 px |
| Alfa base | 190 – 245 |
| Ritmo de brilho | 5,5 – 10 s |
| Ritmo de presença | 12 – 22 s |
| Distribuição X | 10% – 90% |
| Distribuição Y | 7% – 92% |
| Cor | `#9CC7FF` (fixa) |
| Halo | raio **4,2 ×** o raio da estrela, alfa 26% do alfa dela |

**Paleta da poeira** (sorteada por estrela, cinco tons):

```
#6FA8F0   #8FC2FF   #5B8FC9   #A9CCFF   #4E7FB8
```

As de quatro pontas usam uma paleta um pouco mais clara:

```
#A9CCFF   #C7DEFF   #8FC2FF   #D8E9FF
```

Todos são azuis **dessaturados e claros** — nenhum branco puro. É o detalhe que faz parecer céu e não purpurina.

**Densidade:** 67 estrelas em uma área de ~500×610 px ≈ **1 estrela a cada 4.500 px²**. Para outras resoluções:

```
n_poeira = clamp( round(area_px / 4500), 24, 140 )
n_halo   = max( 3, round(n_poeira / 12) )
n_pontas = max( 2, round((n_poeira − n_halo) * 0.10) )
```

O teto existe porque em telas grandes a contagem linear explode e o céu vira ruído. Acima de ~140 estrelas, **reduza a densidade** em vez de aumentar a contagem.

### 5.3 A matemática da cintilação

O coração do céu é **ruído suave**, não uma senoide. Cada estrela lê dois canais 1D independentes: um de **brilho** (rápido) e um de **presença** (lento). O ruído usa interpolação *smootherstep* e duas oitavas, então nunca repete um ciclo e nunca "fervilha":

```
brilho   = smoothstep(fbm(t / p + fase, semente))
lento    = fbm(t / presença + faseLenta, semente + 37)
portão   = smoothstep(clamp((lento − 0.28) / 0.48))
presença = repouso + (1 − repouso) · portão
pulso    = piso + (1 − piso) · brilho
nível    = min(1, pulso · presença · ganho)   // ganho 1,40 – 1,75

alfa  = alfa_base · nível
raio  = raio_base · (0.70 + 0.55 · nível)
giro  = t · velocidade + ânguloInicial       // só nas de quatro pontas
```

Cinco decisões embutidas ali, e todas importam:

1. **Três personalidades.** 18% das estrelas são firmes (repouso 0,38–0,63; piso 0,22–0,38; alfa 70–150), 38% são discretas (repouso 0,03–0,15; piso 0,08–0,22; alfa 125–215) e 44% são apagáveis (repouso 0, piso 0,01–0,08; alfa 160–245). As estrelas de quatro pontas são sempre apagáveis, com alfa 200–255.
2. **Sem piso global.** O piso agora é por estrela e por momento: não existe "brilho mínimo universal". É o que permite o aparecimento e o desaparecimento de verdade, sem que o céu se esvazie de uma vez.
3. **Ruído em vez de seno.** O *fbm* de duas oitavas (períodos `p` e `2,31 · p`) produz variações irregulares, sem "quique" e sem loop reconhecível. Fase e semente são sorteadas por estrela; o conjunto nunca pulsa em bloco.
4. **Ritmos separados.** Poeira: brilho 3,4–7,8 s e presença 7,5–18 s. Quatro pontas: brilho 3,8–7,8 s e presença 9–18 s. Halo: brilho 5,5–10 s e presença 12–22 s. Abaixo de ~1,5 s vira pisca-pisca; acima disso o olho lê respiração, não LED.
5. **O raio acompanha o nível** (0,70× a 1,25×) e o ganho por personalidade (1,40 a 1,75) devolve o brilho médio que as pausas tiram. A soma do céu fica estável (~±15%) mesmo com estrelas individuais apagando.

**Taxa de quadros: 25 fps (40 ms).** Não é preguiça — é escolha. A 25 fps o movimento é suave o bastante, e o custo cai pela metade em relação a 60 fps. Para cintilação, 25 fps é indistinguível de 30.

**Fase, período e semente aleatórios sempre.** Se todas compartilharem fase, o céu pulsa em bloco — o defeito mais comum em implementações amadoras. Com fases sorteadas, a soma visual é estável, mesmo com estrelas apagando e retornando.

### 5.4 Semente determinística

Gere as estrelas com **uma semente fixa** (aqui, `20261104`). Motivo: a cada abertura do app o céu deve ser *o mesmo* céu. Se as posições sorteadas mudarem a cada execução, o fundo deixa de ser um lugar e passa a ser ruído aleatório — e o usuário percebe, mesmo sem saber nomear.

Se quiser variedade, varie por *sessão* (ex.: semente = dia do ano), nunca a cada frame ou a cada repaint.

### 5.5 Como desenhar

Por frame, uma única passada:

```
para cada estrela:
    calcule nível, alfa, raio
    se alfa ≤ 3: pule                    // invisível, economiza a elipse
    se é de quatro pontas (✦):
        desenhe 8 vértices alternando raio e 0,14× raio, rotacionado
        + halo curto de 2,6× (alfa 16% do alfa da estrela)
    senão:
        desenhe círculo em (x·W, y·H) com o raio e a cor (com alfa)
    se tem halo:
        desenhe gradiente radial de raio 4,2×
        centro: cor a 26% do alfa  →  borda: mesma cor a alfa 0
```

Anti-aliasing ligado nos círculos. **Sem filtro de desfoque** no halo: o gradiente radial já é suave e o blur por estrela custa caro. Se a plataforma permitir, desenhe as estrelas em um canvas/camada própria e só repinte esse canvas.

### 5.6 Pausar quando não aparece

Regras de economia, todas relevantes:

- **Tema claro → sem estrelas.** O campo todo é desligado (`stars: false`), não apenas escondido.
- **Janela oculta/minimizada → timer parado.** Não gaste CPU desenhando o que ninguém vê.
- **`prefers-reduced-motion` → o resto do site congela; as estrelas continuam.** Neste projeto, o céu é o único movimento perpétuo do tema e foi mantido animado mesmo com a preferência ativa (decisão explícita do autor). Como a amplitude é baixa e não há deslocamento de elementos, o efeito não disputa atenção com o conteúdo.

### 5.7 Por que funciona (as leis)

1. **Dessincronização total.** Fase e período aleatórios garantem que o conjunto nunca pulse junto. O olho lê "céu", não "animação".
2. **Escala minúscula.** A poeira tem 1–2 px. As de quatro pontas são a exceção deliberada: 4,8–6,8 px, poucas (~10% da poeira), e por isso funcionam como acentos em vez de virar purpurina.
3. **Cor dessaturada.** Azuis pálidos, nunca branco puro. Branco puro no escuro vira "pixel morto" (dead pixel) e cria halos de compressão.
4. **Halo só nas grandes.** Cinco estrelas com halo são suficientes para sugerir profundidade. Se todas tiverem halo, o fundo embola.
5. **Densidade esparsa.** 1 estrela por ~4.500 px². Densidade é o parâmetro mais fácil de exagerar — na dúvida, **menos**.
6. **Aparecimento e desaparecimento.** Só parte das estrelas apaga; as firmes mantêm o céu povoado enquanto as apagáveis somem e voltam. O piso global de 0,35 foi substituído por pisos individuais, o que dá o efeito orgânico sem esvaziar o fundo.
7. **Movimento lento.** 3,4–18 s por ciclo (brilho e presença). O usuário percebe "vivo" sem perceber "animado".
8. **Profundidade por camadas.** Gradiente + glow + poeira + halos dão quatro planos de leitura em um fundo vazio.

### 5.8 Anti-padrões

| Não faça | Por quê |
|---|---|
| Estrelas brancas puras | Halo, aspecto de pixel queimado, briga com o texto |
| Mais de ~1 estrela por 3.000 px² | Vira ruído/chuvisco; o texto perde legibilidade |
| Mesmo período para todas | O céu pulsa em bloco — parece bug |
| Cintilação em < 1,5 s | Epilepsia visual; cansativo em 10 segundos |
| Estrelas atrás de texto denso | Reduza a densidade nas zonas de conteúdo, ou use superfícies mais opacas ali |
| Blur real por estrela | Custo alto e resultado igual ao gradiente radial |
| Aleatoriedade a cada frame | As estrelas "fervilham"; use semente fixa |
| Estrelas em tema claro | Perde o sentido e suja o branco — desligue |
| Todas as estrelas apagando juntas | O céu se esvazia e volta em bloco — use pisos individuais e fases dessincronizadas |
| Muitas estrelas de quatro pontas | Viram purpurina e competem com o conteúdo; mantenha ~10% da poeira |

### 5.9 Adaptando a densidade ao contexto

| Contexto | Ajuste |
|---|---|
| **Dashboard denso** | Reduza para ~1/7.000 px²; aumente levemente a opacidade das superfícies (0,92) para proteger gráficos |
| **Tela de login / splash** | Pode subir a ~1/3.500 px² e adicionar 2–3 estrelas com halo extra: é a tela onde o fundo é protagonista |
| **Mobile** | Menos estrelas (tela pequena concentra), raios um pouco maiores (1,0–2,0 px) e halos menores |
| **Apresentação / slide** | Estático: renderize um frame e congele. Movimento em projetor distrai |
| **Modo impressão** | Nenhuma estrela; fundo branco ou cinza claro — o tema não sobrevive ao papel |

---

## 6. Movimento

O tema tem **um** movimento perpétuo (estrelas) e movimentos curtos de resposta. Essa hierarquia é o que impede a interface de parecer agitada.

| Evento | Duração | Easing |
|---|---|---|
| Cintilação das estrelas | brilho 3,4 – 7,8 s; presença 7,5 – 18 s (sem loop) | ruído suave + smoothstep |
| Troca de tema | 240–260 ms | ease-in-out (cross-fade) |
| Pílula do segmentado | 180–220 ms | ease-out |
| Botão deslizante do toggle | 180 ms | ease-out |
| Hover / foco | 120–150 ms | linear |
| Spinner | ~1 s por volta | linear |

**Cross-fade na troca de tema:** capture a tela atual (snapshot), sobreponha e dissolva para o novo tema em ~250 ms. Trocar cores instantaneamente produz um "flash" desagradável; o fade transforma a troca em um amanhecer/anoitecer — coerente com o conceito.

**Nada anima em loop além das estrelas.** Sem pulsação de botão, sem gradiente animado, sem ícones girando fora do spinner de carregamento.

---

## 7. Acessibilidade

- **Contraste:** texto principal ≥ 7:1; secundário ≥ 4,5:1; nenhum texto essencial abaixo de 4,5:1. Botões preenchidos com branco sobre `#2C77C6` estão em 4,6:1 — no limite, então **não escureça nem clareie esse preenchimento sem recalcular**.
- **Foco sempre visível:** borda/anel de 1,5 px na cor de destaque (ou branco, sobre o botão primário). Nunca `outline: none` sem substituto.
- **Nunca cor como único sinal:** estados têm ponto + texto (status), não só verde/vermelho.
- **Movimento reduzido:** o restante do site respeita `prefers-reduced-motion`; as estrelas permanecem animando por decisão editorial — são o único movimento do tema, de amplitude baixa e sem deslocamento de elementos.
- **Legibilidade sobre o fundo:** as estrelas nunca devem cruzar texto sem que a superfície por trás esteja opaca o suficiente. Se acontecer, aumente o alfa da superfície antes de remover estrelas.
- **Alvos de toque:** ≥ 44 px em mobile.
- **Zoom:** a escala em px precisa sobreviver a 150–200% de zoom do sistema sem sobreposição (teste os campos de 32 px).

---

## 8. Portando para outras stacks

### 8.1 Variáveis (CSS / qualquer lugar)

```css
:root {
  /* fundo */
  --sky-top: #091522;
  --sky-bottom: #11263e;
  --sky-glow: 45, 125, 210;      /* #2D7DD2 em rgb, para usar com alfa */

  /* superfícies */
  --surface: rgba(17, 34, 54, 0.88);
  --surface-alt: #162b44;
  --border: #1b3a5c;
  --border-strong: #2a567f;
  --field: #0a1828;
  --field-focus: #0c1e33;

  /* texto */
  --text: #e8f0fe;
  --text-secondary: #94b4d4;
  --text-muted: #6f8cab;
  --placeholder: #7694b4;

  /* destaque */
  --accent: #2c77c6;
  --accent-hover: #3a89da;
  --accent-pressed: #22609c;
  --on-accent: #ffffff;
  --accent-soft: #16324f;
  --accent-soft-text: #9cc7ff;

  /* raios e alturas */
  --r-card: 12px; --r-field: 10px; --r-badge: 6px;
  --h-field: 32px; --h-button: 36px;
}
```

### 8.2 Fundo em CSS puro (sem canvas)

```css
body {
  min-height: 100vh;
  background:
    radial-gradient(90vmax 90vmax at 84% 0%,
      rgba(var(--sky-glow), 0.125) 0%, rgba(var(--sky-glow), 0) 100%),
    linear-gradient(180deg, var(--sky-top) 0%, var(--sky-bottom) 100%);
  background-attachment: fixed;
}
```

As estrelas, porém, **exigem animação por elemento** — em CSS puro isso significa dezenas de `box-shadow` animados ou `@property`, o que é frágil. Para o efeito completo, use `<canvas>`.

### 8.3 Estrelas em canvas (JavaScript, portátil)

```js
const stars = [];
const PALETTE = ["#6FA8F0", "#8FC2FF", "#5B8FC9", "#A9CCFF", "#4E7FB8"];
const SPARKLE_PALETTE = ["#A9CCFF", "#C7DEFF", "#8FC2FF", "#D8E9FF"];
let seedState = 20261104;                 // semente determinística
const rnd = () => (seedState = (seedState * 1664525 + 1013904223) >>> 0) / 4294967296;

// ruído 1D com smootherstep; duas oitavas = variação orgânica, sem loop
function hash01(n) {
  n = (n ^ 61) ^ (n >>> 16);
  n = Math.imul(n, 9); n ^= n >>> 4;
  n = Math.imul(n, 0x27d4eb2d); n ^= n >>> 15;
  return (n >>> 0) / 4294967296;
}
function noise1(x, seed) {
  const i = Math.floor(x), f = x - i;
  const u = f * f * f * (f * (f * 6 - 15) + 10);
  const off = Math.imul(seed, 668265263);
  const a = hash01(Math.imul(i, 374761393) + off);
  const b = hash01(Math.imul(i + 1, 374761393) + off);
  return a + (b - a) * u;
}
const fbm = (x, seed) => 0.64 * noise1(x, seed) + 0.36 * noise1(x * 2.31 + 7.7, seed + 19);
const ss = (v) => v * v * (3 - 2 * v);
const clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;

function seed(n, haloCount) {
  const dust = n - haloCount;
  const points = Math.max(2, Math.round(dust * 0.10));
  for (let i = 0; i < dust; i++) {
    if (i < points) {
      // quatro pontas: giram devagar, brilham mais e apagam
      stars.push({
        x: 0.02 + rnd() * 0.96, y: 0.015 + rnd() * 0.97,
        r: 4.8 + rnd() * 2.0, a: 200 + rnd() * 55,
        p: 3.8 + rnd() * 4.0, ph: rnd() * 100,
        slow: 9 + rnd() * 9, slowPh: rnd() * 100,
        rest: 0, floor: 0.02 + rnd() * 0.06, gain: 1.55 + rnd() * 0.2,
        spin: (0.06 + rnd() * 0.06) * (rnd() < 0.5 ? -1 : 1),
        rot0: rnd() * Math.PI * 2, seed: (rnd() * 999999) | 0,
        c: SPARKLE_PALETTE[(rnd() * SPARKLE_PALETTE.length) | 0],
        sparkle: true, halo: false,
      });
      continue;
    }
    const tone = rnd();
    let rest, floor, gain, a;
    if (tone < 0.18)      { rest = 0.38 + rnd() * 0.25; floor = 0.22 + rnd() * 0.16; a = 70 + rnd() * 80;  gain = 1.4;  } // firme
    else if (tone < 0.56) { rest = 0.03 + rnd() * 0.12; floor = 0.08 + rnd() * 0.14; a = 125 + rnd() * 90; gain = 1.45; } // discreta
    else                  { rest = 0;                  floor = 0.01 + rnd() * 0.07; a = 160 + rnd() * 85; gain = 1.55; } // apagável
    stars.push({
      x: 0.015 + rnd() * 0.97, y: 0.01 + rnd() * 0.98,
      r: 0.8 + rnd() * 0.9, a,
      p: 3.4 + rnd() * 4.4, ph: rnd() * 100,
      slow: 7.5 + rnd() * 10.5, slowPh: rnd() * 100,
      rest, floor, gain, seed: (rnd() * 999999) | 0,
      c: PALETTE[(rnd() * PALETTE.length) | 0], sparkle: false, halo: false,
    });
  }
  for (let i = 0; i < haloCount; i++) {
    const tone = rnd();
    stars.push({
      x: 0.10 + rnd() * 0.80, y: 0.07 + rnd() * 0.85,
      r: 1.5 + rnd() * 0.5, a: 190 + rnd() * 55,
      p: 5.5 + rnd() * 4.5, ph: rnd() * 100,
      slow: 12 + rnd() * 10, slowPh: rnd() * 100,
      rest: tone < 0.25 ? 0 : 0.14 + rnd() * 0.24,
      floor: 0.14 + rnd() * 0.12, gain: 1.4, seed: (rnd() * 999999) | 0,
      c: "#9CC7FF", sparkle: false, halo: true,
    });
  }
}

function draw(ctx, w, h, t) {          // t em segundos
  for (const s of stars) {
    const fast = ss(fbm(t / s.p + s.ph, s.seed));
    const slow = fbm(t / s.slow + s.slowPh, s.seed + 37);
    const gate = ss(clamp01((slow - 0.28) / 0.48));
    const level = Math.min(1,
      (s.floor + (1 - s.floor) * fast) * (s.rest + (1 - s.rest) * gate) * s.gain);

    const alpha = s.a * level;
    if (alpha <= 3) continue;

    const x = s.x * w, y = s.y * h;

    if (s.sparkle) {
      // ✦ de oito vértices, cintura de 14%, giro lento + halo curto
      const radius = s.r * (0.55 + 0.50 * level);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t * s.spin + s.rot0);
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 2.6);
      glow.addColorStop(0, `rgba(156,199,255,${alpha / 255 * 0.16})`);
      glow.addColorStop(1, "rgba(156,199,255,0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(0, 0, radius * 2.6, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = alpha / 255;
      ctx.fillStyle = s.c;
      ctx.beginPath();
      for (let k = 0; k < 8; k++) {
        const ang = -Math.PI / 2 + k * Math.PI / 4;
        const len = k % 2 === 0 ? radius : radius * 0.14;
        if (k === 0) ctx.moveTo(Math.cos(ang) * len, Math.sin(ang) * len);
        else ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
      }
      ctx.closePath(); ctx.fill();
      ctx.restore();
      continue;
    }

    const radius = s.r * (0.70 + 0.55 * level);
    ctx.globalAlpha = alpha / 255;
    ctx.fillStyle = s.c;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();

    if (s.halo) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius * 4.2);
      g.addColorStop(0, `rgba(156,199,255,${alpha / 255 * 0.26})`);
      g.addColorStop(1, "rgba(156,199,255,0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, radius * 4.2, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

// loop a ~25 fps, pausado quando a aba está oculta
```

### 8.4 Flutter

- Fundo: `DecoratedBox` com `LinearGradient` + `RadialGradient` empilhados (`Container` com `BoxDecoration` e um `CustomPaint` por cima).
- Estrelas: um único `CustomPaint` com `CustomPainter` e `AnimationController(repeat)`; `shouldRepaint` controlado por `repaint: controller`.
- Pausa: `TickerMode`/`VisibilityDetector`; `MediaQuery.disableAnimationsOf(context)` para reduced motion.
- Superfícies: `Color.withValues(alpha: 0.88)` — não use `withOpacity` (depreciado em versões novas).

### 8.5 SwiftUI

- Fundo: `LinearGradient` + `RadialGradient` em `ZStack`.
- Estrelas: `TimelineView(.animation(minimumInterval: 0.04))` desenhando `Circle`s em `Canvas` — uma única passada por frame.
- Reduced motion: `@Environment(\.accessibilityReduceMotion)`.
- Superfícies: `Color(hex).opacity(0.88)` com `.background(..., in: RoundedRectangle(cornerRadius: 12))`.

---

## 9. Checklist de implementação

Antes de considerar o tema pronto em um projeto novo:

- [ ] Gradiente vertical com ~12% de diferença entre topo e base.
- [ ] Brilho radial no canto superior direito a ~12% de alfa, imperceptível como círculo.
- [ ] Cartões a 88% de opacidade (o céu aparece atrás deles).
- [ ] Campos de texto **opacos**.
- [ ] Texto principal ≈ `#E8F0FE` (nunca branco puro).
- [ ] Todos os cinzas puxados para azul.
- [ ] Um único azul de destaque, usado só em ação/foco/seleção.
- [ ] Escala tipográfica ≤ 4 tamanhos; hierarquia por peso e cor.
- [ ] Raios consistentes por família (6/10/12).
- [ ] Estrelas com fases e sementes de brilho/presença **aleatórias por estrela**.
- [ ] Três personalidades (firmes, discretas, apagáveis), piso de brilho por estrela e alfa maior nas que apagam.
- [ ] ~10% da poeira em estrelas de quatro pontas, com giro lento e halo curto.
- [ ] Cintilação por ruído suave (sem loop) e raio variando com o brilho.
- [ ] Semente fixa para posições.
- [ ] Densidade ≈ 1 estrela / 4.500 px² (com teto).
- [ ] Halo apenas em ~5 estrelas.
- [ ] Timer a ~25 fps, pausado quando oculto.
- [ ] `prefers-reduced-motion` → restante do site estático; estrelas mantêm o movimento do tema.
- [ ] Foco visível em todos os controles interativos.
- [ ] Contraste verificado: ≥ 4,5:1 para texto pequeno.
- [ ] Nenhum outro elemento animando em loop.

---

## 10. Apêndice — receitas rápidas

### 10.1 "Quero o céu mais dramático"

Densidade 1/3.500 px²; halo em ~8 estrelas; brilho radial a 16%; gradiente com topo `#071220`. **Não** aumente a velocidade da cintilação — drama vem de profundidade, não de agitação.

### 10.2 "Quero o céu mais discreto"

Densidade 1/7.000 px²; halo apenas 3; brilho a 8%; superfícies a 0,92. Continua reconhecível, quase imperceptível em uso prolongado.

### 10.3 "Preciso do mesmo tema sem estrelas" (impressão, projetor, performance)

Mantenha gradiente + brilho + superfícies translúcidas. O tema continua coerente; perde só o encanto. Nunca substitua as estrelas por textura/ruído estático: o ruído compete com o texto de um jeito que pontos suaves e esparsos não competem.

### 10.4 "Quero o par claro"

Inverta a estratégia de luminância, não apenas os valores: fundos claros (`#E7F2FD → #FBFDFF`), texto em azul-marinho profundo (`#0B2540`), destaque em azul-celeste (`#0EA5E9`) **com texto azul-marinho sobre ele** (`#062338`, 5,7:1), chips celestes com dígitos escuros, sombra suave em vez de glow, estrelas desligadas. O que se preserva entre os dois temas é a **geometria**, o **ritmo** e a **lógica** — nunca as cores.

---

*Documento de design — Céu Estrelado v1.0. Os valores de contraste foram calculados pela fórmula WCAG 2.1 (luminância relativa). Ajuste-os se mudar qualquer cor da rampa: contraste é consequência, não enfeite.*
