/* =========================================================
   MATÍAS CORTÉS — PORTFOLIO
   FORMULAS.JS — KaTeX Edition

   Sistema matemático del fondo del portfolio.

   CARACTERÍSTICAS
   ---------------------------------------------------------

   - LaTeX real mediante KaTeX
   - movimiento continuo con requestAnimationFrame
   - rebote contra límites
   - exclusión del cerebro
   - tamaños reales después del render
   - adaptación Dark / Light
   - responsive
   - reduced motion

   Las fórmulas son decorativas.
   No corresponden a resultados específicos de proyectos.
   ========================================================= */

(() => {
  "use strict";


  /* =======================================================
     01. EVITAR DOBLE INICIALIZACIÓN
     ======================================================= */

  if (
    window.__mcKatexFormulasInitialized
  ) {
    return;
  }


  window.__mcKatexFormulasInitialized =
    true;


  /* =======================================================
     02. MEDIA QUERIES
     ======================================================= */

  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );


  const mobileQuery =
    window.matchMedia(
      "(max-width: 640px)"
    );


  const tabletQuery =
    window.matchMedia(
      "(max-width: 1024px)"
    );


  /* =======================================================
     03. CONFIGURACIÓN
     ======================================================= */

  const CONFIG = {

    heroCount: {
      desktop:
        22,

      tablet:
        16,

      mobile:
        8
    },


    sectionCount: {
      desktop:
        12,

      tablet:
        8,

      mobile:
        5
    },


    footerCount: {
      desktop:
        6,

      tablet:
        4,

      mobile:
        2
    },


    speed: {
      min:
        8,

      max:
        18
    },


    opacityPulse: {
      min:
        0.015,

      max:
        0.045
    },


    /*
     * KaTeX
     */

    katex: {

      displayMode:
        false,

      throwOnError:
        false,

      strict:
        "ignore",

      trust:
        false,

      output:
        "htmlAndMathml"
    }
  };


  /* =======================================================
     04. BIBLIOTECA LATEX
     ======================================================= */

  /*
   * String.raw evita que JavaScript interprete "\".
   *
   * \displaystyle permite que:
   *
   * - fracciones
   * - sumatorias
   * - índices
   * - operadores
   *
   * se vean como notación matemática de publicación.
   */
  /* =======================================================
     04. FORMULA LIBRARY V2
     ======================================================= */

  /*
   * Ahora cada fórmula tiene metadatos.
   *
   * latex
   * --------
   * Expresión renderizada por KaTeX.
   *
   * category
   * --------
   * Área temática utilizada por el selector contextual.
   *
   * source
   * --------
   * Referencia conceptual interna.
   * No se muestra visualmente en el portfolio.
   *
   * weight
   * --------
   * Probabilidad relativa de aparecer.
   */

  const formula = (
    latex,
    category,
    source,
    weight = 1
  ) => ({
    latex,
    category,
    source,
    weight
  });


  const FORMULAS = [

    /* =====================================================
       01. PROBABILIDAD
       Casella & Berger / Wasserman
       ===================================================== */

    formula(
      String.raw`
        \displaystyle
        P(A\mid B)
        =
        \frac{P(B\mid A)P(A)}{P(B)}
      `,
      "probability",
      "Casella & Berger",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        P(A\cap B)
        =
        P(A\mid B)P(B)
      `,
      "probability",
      "Casella & Berger",
      2
    ),

    formula(
      String.raw`
        \displaystyle
        P(A\cup B)
        =
        P(A)+P(B)-P(A\cap B)
      `,
      "probability",
      "Wasserman",
      2
    ),

    formula(
      String.raw`
        \displaystyle
        P(A^c)
        =
        1-P(A)
      `,
      "probability",
      "Wasserman",
      1
    ),

    formula(
      String.raw`
        \displaystyle
        \mathbb{E}[X]
        =
        \sum_x x\,p(x)
      `,
      "probability",
      "Casella & Berger",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        \operatorname{Var}(X)
        =
        \mathbb{E}[X^2]
        -
        \mathbb{E}[X]^2
      `,
      "probability",
      "Casella & Berger",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        \operatorname{Cov}(X,Y)
        =
        \mathbb{E}
        \left[
          (X-\mu_X)(Y-\mu_Y)
        \right]
      `,
      "probability",
      "Casella & Berger",
      2
    ),

    formula(
      String.raw`
        \displaystyle
        \rho_{XY}
        =
        \frac{
          \operatorname{Cov}(X,Y)
        }{
          \sigma_X\sigma_Y
        }
      `,
      "probability",
      "Wasserman",
      2
    ),

    formula(
      String.raw`
        \displaystyle
        X
        \sim
        \mathcal{N}(\mu,\sigma^2)
      `,
      "probability",
      "Casella & Berger",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        f_X(x)
        =
        \frac{1}{
          \sigma\sqrt{2\pi}
        }
        \exp
        \left[
          -\frac{(x-\mu)^2}{2\sigma^2}
        \right]
      `,
      "probability",
      "Casella & Berger",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        P(X=k)
        =
        \frac{
          e^{-\lambda}\lambda^k
        }{
          k!
        }
      `,
      "probability",
      "Casella & Berger",
      2
    ),

    formula(
      String.raw`
        \displaystyle
        X
        \sim
        \operatorname{Binomial}(n,p)
      `,
      "probability",
      "Wasserman",
      2
    ),

    formula(
      String.raw`
        \displaystyle
        P(X=k)
        =
        {n\choose k}
        p^k(1-p)^{n-k}
      `,
      "probability",
      "Wasserman",
      2
    ),


    /* =====================================================
       02. TEORÍA ESTADÍSTICA
       Casella & Berger / Wasserman
       ===================================================== */

    formula(
      String.raw`
        \displaystyle
        \operatorname{Bias}
        (\hat{\theta})
        =
        \mathbb{E}
        [\hat{\theta}]
        -
        \theta
      `,
      "theory",
      "Casella & Berger",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        \operatorname{MSE}
        (\hat{\theta})
        =
        \operatorname{Var}
        (\hat{\theta})
        +
        \operatorname{Bias}
        (\hat{\theta})^2
      `,
      "theory",
      "Casella & Berger",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        U(\theta)
        =
        \frac{
          \partial
          \ell(\theta)
        }{
          \partial\theta
        }
      `,
      "theory",
      "Casella & Berger",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        \mathcal{I}(\theta)
        =
        \mathbb{E}_{\theta}
        \left[
          U(\theta)^2
        \right]
      `,
      "theory",
      "Casella & Berger",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        \mathcal{I}_n(\theta)
        =
        n\mathcal{I}_1(\theta)
      `,
      "theory",
      "Casella & Berger",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        \operatorname{Var}
        (\hat{\theta})
        \geq
        \frac{
          1
        }{
          \mathcal{I}_n(\theta)
        }
      `,
      "theory",
      "Casella & Berger",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        \sqrt{n}
        (\hat{\theta}-\theta)
        \xrightarrow{d}
        \mathcal{N}
        \left(
          0,
          \mathcal{I}(\theta)^{-1}
        \right)
      `,
      "theory",
      "Casella & Berger",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        \bar{X}_n
        \xrightarrow{p}
        \mu
      `,
      "theory",
      "Wasserman",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        \frac{
          \sqrt{n}
          (\bar{X}_n-\mu)
        }{
          \sigma
        }
        \xrightarrow{d}
        \mathcal{N}(0,1)
      `,
      "theory",
      "Wasserman",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        \sqrt{n}
        \left[
          g(\hat{\theta})
          -
          g(\theta)
        \right]
        \xrightarrow{d}
        \mathcal{N}
        \left(
          0,
          [g'(\theta)]^2\sigma^2
        \right)
      `,
      "theory",
      "Wasserman",
      3
    ),


    /* =====================================================
       03. INFERENCIA
       Casella & Berger / Wasserman
       ===================================================== */

    formula(
      String.raw`
        \displaystyle
        L(\theta\mid\mathbf{x})
        =
        \prod_{i=1}^{n}
        f(x_i\mid\theta)
      `,
      "inference",
      "Casella & Berger",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        \ell(\theta)
        =
        \sum_{i=1}^{n}
        \log f(x_i\mid\theta)
      `,
      "inference",
      "Casella & Berger",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        \hat{\theta}_{MLE}
        =
        \operatorname*{arg\,max}_{\theta}
        L(\theta)
      `,
      "inference",
      "Casella & Berger",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        IC
        =
        \hat{\theta}
        \pm
        z_{\alpha/2}
        SE(\hat{\theta})
      `,
      "inference",
      "Wasserman",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        t
        =
        \frac{
          \bar{x}-\mu_0
        }{
          s/\sqrt{n}
        }
      `,
      "inference",
      "Wasserman",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        \Lambda(\mathbf{x})
        =
        \frac{
          \sup_{\theta\in\Theta_0}
          L(\theta)
        }{
          \sup_{\theta\in\Theta}
          L(\theta)
        }
      `,
      "inference",
      "Casella & Berger",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        -2\log\Lambda
        \xrightarrow{d}
        \chi^2_r
      `,
      "inference",
      "Casella & Berger",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        p\text{-value}
        =
        P_{H_0}
        (T\geq T_{obs})
      `,
      "inference",
      "Wasserman",
      3
    ),


    /* =====================================================
       04. BAYES
       Gelman et al. / Bishop
       ===================================================== */

    formula(
      String.raw`
        \displaystyle
        p(\theta\mid y)
        =
        \frac{
          p(y\mid\theta)p(\theta)
        }{
          p(y)
        }
      `,
      "bayes",
      "Gelman et al.",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        p(\theta\mid y)
        \propto
        p(y\mid\theta)
        p(\theta)
      `,
      "bayes",
      "Gelman et al.",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        p(\tilde y\mid y)
        =
        \int
        p(\tilde y\mid\theta)
        p(\theta\mid y)
        d\theta
      `,
      "bayes",
      "Gelman et al.",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        \mathbb{E}
        [\theta\mid y]
        =
        \int
        \theta
        p(\theta\mid y)
        d\theta
      `,
      "bayes",
      "Gelman et al.",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        BF_{10}
        =
        \frac{
          p(y\mid M_1)
        }{
          p(y\mid M_0)
        }
      `,
      "bayes",
      "Gelman et al.",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        p(y)
        =
        \int
        p(y\mid\theta)
        p(\theta)
        d\theta
      `,
      "bayes",
      "Bishop",
      3
    ),


    /* =====================================================
       05. MODELOS LINEALES
       Statistical Learning
       ===================================================== */

    formula(
      String.raw`
        \displaystyle
        \mathbf{y}
        =
        X\boldsymbol{\beta}
        +
        \boldsymbol{\varepsilon}
      `,
      "linear",
      "ESL",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        \hat{\boldsymbol{\beta}}
        =
        (X^\top X)^{-1}
        X^\top\mathbf{y}
      `,
      "linear",
      "ESL",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        \hat{\mathbf{y}}
        =
        X\hat{\boldsymbol{\beta}}
      `,
      "linear",
      "ISL",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        R^2
        =
        1-
        \frac{SSE}{SST}
      `,
      "linear",
      "ISL",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        SSE
        =
        \sum_{i=1}^{n}
        (y_i-\hat y_i)^2
      `,
      "linear",
      "ISL",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        H
        =
        X(X^\top X)^{-1}X^\top
      `,
      "linear",
      "ESL",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        \hat{\mathbf{y}}
        =
        H\mathbf{y}
      `,
      "linear",
      "ESL",
      3
    ),


    /* =====================================================
       06. GLM
       McCullagh & Nelder
       ===================================================== */

    formula(
      String.raw`
        \displaystyle
        g(\mu_i)
        =
        \eta_i
        =
        \mathbf{x}_i^\top
        \boldsymbol{\beta}
      `,
      "glm",
      "McCullagh & Nelder",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        \operatorname{logit}(p)
        =
        \log
        \frac{p}{1-p}
      `,
      "glm",
      "McCullagh & Nelder",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        p
        =
        \frac{
          e^\eta
        }{
          1+e^\eta
        }
      `,
      "glm",
      "McCullagh & Nelder",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        \log(\mu_i)
        =
        \mathbf{x}_i^\top
        \boldsymbol{\beta}
      `,
      "glm",
      "McCullagh & Nelder",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        f(y;\theta,\phi)
        =
        \exp
        \left\{
          \frac{
            y\theta-b(\theta)
          }{
            a(\phi)
          }
          +
          c(y,\phi)
        \right\}
      `,
      "glm",
      "McCullagh & Nelder",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        \operatorname{Var}(Y)
        =
        \phi V(\mu)
      `,
      "glm",
      "McCullagh & Nelder",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        D
        =
        2
        \left[
          \ell_{sat}
          -
          \ell_{model}
        \right]
      `,
      "glm",
      "McCullagh & Nelder",
      4
    ),


    /* =====================================================
       07. MACHINE LEARNING
       ESL / ISL / Bishop
       ===================================================== */

    formula(
      String.raw`
        \displaystyle
        \hat y
        =
        f_{\theta}(\mathbf{x})
      `,
      "ml",
      "ESL",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        MSE
        =
        \frac1n
        \sum_{i=1}^{n}
        (y_i-\hat y_i)^2
      `,
      "ml",
      "ISL",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        RMSE
        =
        \sqrt{
          \frac1n
          \sum_{i=1}^{n}
          (y_i-\hat y_i)^2
        }
      `,
      "ml",
      "ISL",
      2
    ),

    formula(
      String.raw`
        \displaystyle
        \theta_{t+1}
        =
        \theta_t
        -
        \eta
        \nabla J(\theta_t)
      `,
      "ml",
      "Bishop",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        \hat{\beta}^{ridge}
        =
        \operatorname*{arg\,min}_{\beta}
        \left[
          RSS
          +
          \lambda
          \sum_{j=1}^{p}
          \beta_j^2
        \right]
      `,
      "ml",
      "ESL",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        \hat{\beta}^{lasso}
        =
        \operatorname*{arg\,min}_{\beta}
        \left[
          RSS
          +
          \lambda
          \sum_{j=1}^{p}
          |\beta_j|
        \right]
      `,
      "ml",
      "ESL",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        \operatorname{Err}(x_0)
        =
        \sigma^2
        +
        Bias^2
        +
        Variance
      `,
      "ml",
      "ESL",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        \hat{R}_{CV}
        =
        \frac1K
        \sum_{k=1}^{K}
        R_k
      `,
      "ml",
      "ISL",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        \hat y
        =
        \frac1K
        \sum_{k\in N_K(x)}
        y_k
      `,
      "ml",
      "ISL",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        p(C_k\mid\mathbf{x})
        =
        \frac{
          e^{a_k}
        }{
          \sum_j e^{a_j}
        }
      `,
      "ml",
      "Bishop",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        \min_{\mathbf{w},b}
        \frac12
        \|\mathbf{w}\|^2
      `,
      "ml",
      "ESL",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        y_i
        (\mathbf{w}^\top\mathbf{x}_i+b)
        \geq
        1
      `,
      "ml",
      "ESL",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        K(\mathbf{x},\mathbf{x}')
        =
        \exp
        \left(
          -\gamma
          \|\mathbf{x}-\mathbf{x}'\|^2
        \right)
      `,
      "ml",
      "Bishop",
      4
    ),


    /* =====================================================
       08. CLUSTERING
       ESL / Bishop
       ===================================================== */

    formula(
      String.raw`
        \displaystyle
        \min_{\{\mu_k\}}
        \sum_{i=1}^{n}
        \|
          \mathbf{x}_i
          -
          \mu_{c_i}
        \|^2
      `,
      "clustering",
      "ESL",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        \mu_k
        =
        \frac1{|C_k|}
        \sum_{\mathbf{x}_i\in C_k}
        \mathbf{x}_i
      `,
      "clustering",
      "ESL",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        p(\mathbf{x})
        =
        \sum_{k=1}^{K}
        \pi_k
        \mathcal{N}
        (
          \mathbf{x}
          \mid
          \mu_k,\Sigma_k
        )
      `,
      "clustering",
      "Bishop",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        r_{ik}
        =
        \frac{
          \pi_k
          \mathcal{N}
          (
            \mathbf{x}_i
            \mid
            \mu_k,\Sigma_k
          )
        }{
          \sum_j
          \pi_j
          \mathcal{N}
          (
            \mathbf{x}_i
            \mid
            \mu_j,\Sigma_j
          )
        }
      `,
      "clustering",
      "Bishop",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        s(i)
        =
        \frac{
          b(i)-a(i)
        }{
          \max\{a(i),b(i)\}
        }
      `,
      "clustering",
      "ESL",
      3
    ),


    /* =====================================================
       09. MULTIVARIADO
       Johnson & Wichern
       ===================================================== */

    formula(
      String.raw`
        \displaystyle
        \mathbf{X}
        \sim
        \mathcal{N}_p
        (
          \boldsymbol{\mu},
          \Sigma
        )
      `,
      "multivariate",
      "Johnson & Wichern",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        f(\mathbf{x})
        =
        \frac{
          \exp
          \left[
            -\frac12
            (\mathbf{x}-\mu)^\top
            \Sigma^{-1}
            (\mathbf{x}-\mu)
          \right]
        }{
          (2\pi)^{p/2}
          |\Sigma|^{1/2}
        }
      `,
      "multivariate",
      "Johnson & Wichern",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        \Sigma\mathbf{v}_j
        =
        \lambda_j\mathbf{v}_j
      `,
      "multivariate",
      "Johnson & Wichern",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        PC_j
        =
        X\mathbf{v}_j
      `,
      "multivariate",
      "Johnson & Wichern",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        PVE_j
        =
        \frac{
          \lambda_j
        }{
          \sum_{k=1}^{p}
          \lambda_k
        }
      `,
      "multivariate",
      "Johnson & Wichern",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        D_M^2
        =
        (\mathbf{x}-\mu)^\top
        \Sigma^{-1}
        (\mathbf{x}-\mu)
      `,
      "multivariate",
      "Johnson & Wichern",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        T^2
        =
        n
        (\bar{\mathbf{x}}-\mu_0)^\top
        S^{-1}
        (\bar{\mathbf{x}}-\mu_0)
      `,
      "multivariate",
      "Johnson & Wichern",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        \mathbf{X}
        =
        \Lambda\mathbf{F}
        +
        \boldsymbol{\varepsilon}
      `,
      "multivariate",
      "Johnson & Wichern",
      3
    ),


    /* =====================================================
       10. SERIES DE TIEMPO
       Hyndman & Athanasopoulos
       ===================================================== */

    formula(
      String.raw`
        \displaystyle
        X_t
        =
        \phi X_{t-1}
        +
        \varepsilon_t
      `,
      "timeseries",
      "Hyndman & Athanasopoulos",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        X_t
        =
        \sum_{i=1}^{p}
        \phi_iX_{t-i}
        +
        \varepsilon_t
      `,
      "timeseries",
      "Hyndman & Athanasopoulos",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        X_t
        =
        \varepsilon_t
        +
        \sum_{j=1}^{q}
        \theta_j
        \varepsilon_{t-j}
      `,
      "timeseries",
      "Hyndman & Athanasopoulos",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        \phi(B)
        (1-B)^d
        X_t
        =
        \theta(B)
        \varepsilon_t
      `,
      "timeseries",
      "Hyndman & Athanasopoulos",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        \rho(k)
        =
        \frac{
          \gamma(k)
        }{
          \gamma(0)
        }
      `,
      "timeseries",
      "Hyndman & Athanasopoulos",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        \hat{y}_{t+1|t}
        =
        \alpha y_t
        +
        (1-\alpha)
        \hat{y}_{t|t-1}
      `,
      "timeseries",
      "Hyndman & Athanasopoulos",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        e_t
        =
        y_t-\hat y_t
      `,
      "timeseries",
      "Hyndman & Athanasopoulos",
      2
    ),

    formula(
      String.raw`
        \displaystyle
        MASE
        =
        \frac{
          \operatorname{mean}|e_t|
        }{
          \operatorname{mean}
          |y_t-y_{t-1}|
        }
      `,
      "timeseries",
      "Hyndman & Athanasopoulos",
      3
    ),


    /* =====================================================
       11. MUESTREO
       Lohr
       ===================================================== */

    formula(
      String.raw`
        \displaystyle
        \bar{x}
        =
        \frac1n
        \sum_{i=1}^{n}
        x_i
      `,
      "sampling",
      "Lohr",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        SE(\bar{x})
        =
        \frac{s}{\sqrt{n}}
      `,
      "sampling",
      "Lohr",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        \pi_i
        =
        P(i\in s)
      `,
      "sampling",
      "Lohr",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        \hat Y_{HT}
        =
        \sum_{i\in s}
        \frac{y_i}{\pi_i}
      `,
      "sampling",
      "Lohr",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        f
        =
        \frac nN
      `,
      "sampling",
      "Lohr",
      2
    ),

    formula(
      String.raw`
        \displaystyle
        Var(\bar y)
        =
        \left(
          1-\frac nN
        \right)
        \frac{S^2}{n}
      `,
      "sampling",
      "Lohr",
      4
    ),


    /* =====================================================
       12. SIMULACIÓN / MONTE CARLO / MCMC
       Robert & Casella
       ===================================================== */

    formula(
      String.raw`
        \displaystyle
        U
        \sim
        Uniform(0,1)
      `,
      "simulation",
      "Robert & Casella",
      2
    ),

    formula(
      String.raw`
        \displaystyle
        X
        =
        F^{-1}(U)
      `,
      "simulation",
      "Robert & Casella",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        \hat{\mu}_{MC}
        =
        \frac1M
        \sum_{m=1}^{M}
        h(X_m)
      `,
      "simulation",
      "Robert & Casella",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        SE(\hat{\mu}_{MC})
        \approx
        \frac{s_h}{\sqrt{M}}
      `,
      "simulation",
      "Robert & Casella",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        w(x)
        =
        \frac{
          \pi(x)
        }{
          q(x)
        }
      `,
      "simulation",
      "Robert & Casella",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        \hat{\mu}_{IS}
        =
        \frac{
          \sum_{m=1}^{M}
          w_mh(X_m)
        }{
          \sum_{m=1}^{M}
          w_m
        }
      `,
      "simulation",
      "Robert & Casella",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        \alpha(x,y)
        =
        \min
        \left\{
          1,
          \frac{
            \pi(y)q(x\mid y)
          }{
            \pi(x)q(y\mid x)
          }
        \right\}
      `,
      "simulation",
      "Robert & Casella",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        X_j^{(t+1)}
        \sim
        p
        \left(
          X_j
          \mid
          X_{-j}^{(t)}
        \right)
      `,
      "simulation",
      "Robert & Casella",
      4
    ),


    /* =====================================================
       13. NO PARAMÉTRICA
       Wasserman
       ===================================================== */

    formula(
      String.raw`
        \displaystyle
        \hat F_n(x)
        =
        \frac1n
        \sum_{i=1}^{n}
        \mathbf{1}(X_i\leq x)
      `,
      "nonparametric",
      "Wasserman",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        \hat f_h(x)
        =
        \frac1{nh}
        \sum_{i=1}^{n}
        K
        \left(
          \frac{x-X_i}{h}
        \right)
      `,
      "nonparametric",
      "Wasserman",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        K_h(u)
        =
        \frac1h
        K
        \left(
          \frac uh
        \right)
      `,
      "nonparametric",
      "Wasserman",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        D_n
        =
        \sup_x
        |
          F_n(x)-F_0(x)
        |
      `,
      "nonparametric",
      "Wasserman",
      3
    ),


    /* =====================================================
       14. ESTADÍSTICA ESPACIAL
       ===================================================== */

    formula(
      String.raw`
        \displaystyle
        C(h)
        =
        Cov
        [
          Z(s),
          Z(s+h)
        ]
      `,
      "spatial",
      "Spatial Statistics",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        \gamma(h)
        =
        \frac12
        Var
        [
          Z(s+h)-Z(s)
        ]
      `,
      "spatial",
      "Spatial Statistics",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        Z(s)
        \sim
        GP
        \left(
          \mu(s),
          C(s,s')
        \right)
      `,
      "spatial",
      "Spatial Statistics",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        \hat Z(s_0)
        =
        \sum_{i=1}^{n}
        \lambda_i Z(s_i)
      `,
      "spatial",
      "Spatial Statistics",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        \sum_{i=1}^{n}
        \lambda_i
        =
        1
      `,
      "spatial",
      "Spatial Statistics",
      2
    ),


    /* =====================================================
       15. PROCESOS PUNTUALES / LGCP
       Baddeley, Rubak & Turner
       ===================================================== */

    formula(
      String.raw`
        \displaystyle
        \lambda(s)
        =
        \exp
        \{
          \eta(s)
        \}
      `,
      "pointprocess",
      "Baddeley, Rubak & Turner",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        \log\lambda(s)
        =
        \beta_0
        +
        \boldsymbol{\beta}^{\top}
        \mathbf{x}(s)
        +
        Z(s)
      `,
      "pointprocess",
      "LGCP",
      6
    ),

    formula(
      String.raw`
        \displaystyle
        L(\lambda)
        =
        \exp
        \left\{
          -\int_W
          \lambda(s)\,ds
        \right\}
        \prod_{i=1}^{n}
        \lambda(s_i)
      `,
      "pointprocess",
      "Baddeley, Rubak & Turner",
      6
    ),

    formula(
      String.raw`
        \displaystyle
        \ell(\lambda)
        =
        \sum_{i=1}^{n}
        \log\lambda(s_i)
        -
        \int_W
        \lambda(s)\,ds
      `,
      "pointprocess",
      "Baddeley, Rubak & Turner",
      6
    ),

    formula(
      String.raw`
        \displaystyle
        \mathbb{E}
        [N(A)]
        =
        \int_A
        \lambda(s)\,ds
      `,
      "pointprocess",
      "Baddeley, Rubak & Turner",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        K(r)
        =
        \frac1\lambda
        \mathbb{E}
        [
          N_0(r)
        ]
      `,
      "pointprocess",
      "Baddeley, Rubak & Turner",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        g(r)
        =
        \frac{
          K'(r)
        }{
          2\pi r
        }
      `,
      "pointprocess",
      "Baddeley, Rubak & Turner",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        N(A)
        \sim
        Poisson
        \left(
          \int_A
          \lambda(s)\,ds
        \right)
      `,
      "pointprocess",
      "Baddeley, Rubak & Turner",
      5
    ),


    /* =====================================================
       16. VALIDACIÓN / CLASIFICACIÓN
       ISL
       ===================================================== */

    formula(
      String.raw`
        \displaystyle
        Precision
        =
        \frac{TP}{TP+FP}
      `,
      "validation",
      "ISL",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        Recall
        =
        \frac{TP}{TP+FN}
      `,
      "validation",
      "ISL",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        Specificity
        =
        \frac{TN}{TN+FP}
      `,
      "validation",
      "ISL",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        F_1
        =
        2
        \frac{
          Precision\cdot Recall
        }{
          Precision+Recall
        }
      `,
      "validation",
      "ISL",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        TPR
        =
        \frac{TP}{TP+FN}
      `,
      "validation",
      "ISL",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        FPR
        =
        \frac{FP}{FP+TN}
      `,
      "validation",
      "ISL",
      3
    ),


    /* =====================================================
       17. TEORÍA DE INFORMACIÓN
       Cover & Thomas
       ===================================================== */

    formula(
      String.raw`
        \displaystyle
        H(X)
        =
        -
        \sum_x
        p(x)
        \log p(x)
      `,
      "information",
      "Cover & Thomas",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        H(X,Y)
        =
        -
        \sum_{x,y}
        p(x,y)
        \log p(x,y)
      `,
      "information",
      "Cover & Thomas",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        I(X;Y)
        =
        H(X)
        -
        H(X\mid Y)
      `,
      "information",
      "Cover & Thomas",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        D_{KL}(P\|Q)
        =
        \sum_x
        P(x)
        \log
        \frac{P(x)}{Q(x)}
      `,
      "information",
      "Cover & Thomas",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        H(P,Q)
        =
        -
        \sum_x
        P(x)\log Q(x)
      `,
      "information",
      "Cover & Thomas",
      4
    ),


    /* =====================================================
       18. OPTIMIZACIÓN
       Boyd & Vandenberghe
       ===================================================== */

    formula(
      String.raw`
        \displaystyle
        \mathbf{x}^{*}
        =
        \operatorname*{arg\,min}_{\mathbf{x}}
        f(\mathbf{x})
      `,
      "optimization",
      "Boyd & Vandenberghe",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        \nabla f(\mathbf{x}^{*})
        =
        \mathbf{0}
      `,
      "optimization",
      "Boyd & Vandenberghe",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        \mathbf{x}_{k+1}
        =
        \mathbf{x}_k
        -
        \eta
        \nabla f(\mathbf{x}_k)
      `,
      "optimization",
      "Boyd & Vandenberghe",
      5
    ),

    formula(
      String.raw`
        \displaystyle
        \max_{\mathbf{x}}
        \quad
        \mathbf{c}^{\top}
        \mathbf{x}
      `,
      "optimization",
      "Boyd & Vandenberghe",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        A\mathbf{x}
        \leq
        \mathbf{b},
        \qquad
        \mathbf{x}\geq0
      `,
      "optimization",
      "Boyd & Vandenberghe",
      4
    ),


    /* =====================================================
       19. EVALUACIÓN DE PROYECTOS
       ===================================================== */

    formula(
      String.raw`
        \displaystyle
        VAN
        =
        \sum_{t=1}^{T}
        \frac{
          CF_t
        }{
          (1+r)^t
        }
        -
        I_0
      `,
      "project",
      "Project Evaluation",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        0
        =
        \sum_{t=1}^{T}
        \frac{
          CF_t
        }{
          (1+TIR)^t
        }
        -
        I_0
      `,
      "project",
      "Project Evaluation",
      4
    ),

    formula(
      String.raw`
        \displaystyle
        VP
        =
        \frac{
          VF
        }{
          (1+r)^t
        }
      `,
      "project",
      "Project Evaluation",
      3
    ),

    formula(
      String.raw`
        \displaystyle
        \frac BC
        =
        \frac{
          VP(Beneficios)
        }{
          VP(Costos)
        }
      `,
      "project",
      "Project Evaluation",
      3
    )
  ];


  /* =======================================================
     04.1 PAGE PROFILES
     ======================================================= */

  /*
   * Factores multiplicativos.
   *
   * Ejemplo:
   *
   * pointprocess: 6
   *
   * significa que en esa página las fórmulas de procesos
   * puntuales tienen mucha más probabilidad de aparecer.
   */

  const FORMULA_PROFILES = {

    home: {
      theory: 3,
      probability: 3,
      inference: 4,
      bayes: 2,
      linear: 3,
      glm: 2,
      ml: 4,
      clustering: 2,
      multivariate: 3,
      timeseries: 2,
      sampling: 1.5,
      simulation: 2,
      nonparametric: 2,
      spatial: 4,
      pointprocess: 4,
      validation: 2,
      information: 3,
      optimization: 2,
      project: 1.5
    },


    about: {
      theory: 5,
      probability: 3,
      inference: 5,
      bayes: 3,
      linear: 4,
      glm: 3,
      ml: 5,
      clustering: 3,
      multivariate: 5,
      timeseries: 3,
      sampling: 2,
      simulation: 3,
      nonparametric: 3,
      spatial: 3,
      pointprocess: 3,
      validation: 3,
      information: 4,
      optimization: 3,
      project: 2
    },


    projects: {
      theory: 2,
      probability: 2,
      inference: 4,
      bayes: 3,
      linear: 3,
      glm: 4,
      ml: 4,
      clustering: 3,
      multivariate: 3,
      timeseries: 2,
      sampling: 2,
      simulation: 3,
      nonparametric: 2,
      spatial: 4,
      pointprocess: 4,
      validation: 4,
      information: 2,
      optimization: 2,
      project: 2
    },


    incendios: {
      theory: 2,
      probability: 4,
      inference: 4,
      bayes: 5,
      linear: 2,
      glm: 4,
      ml: 1.5,
      clustering: 1,
      multivariate: 2,
      timeseries: 2,
      sampling: 1,
      simulation: 5,
      nonparametric: 2,
      spatial: 7,
      pointprocess: 9,
      validation: 3,
      information: 1,
      optimization: 1,
      project: 0.5
    },


    nutricion: {
      theory: 3,
      probability: 3,
      inference: 7,
      bayes: 2,
      linear: 5,
      glm: 7,
      ml: 3,
      clustering: 1.5,
      multivariate: 3,
      timeseries: 1,
      sampling: 4,
      simulation: 2,
      nonparametric: 5,
      spatial: 0.5,
      pointprocess: 0.25,
      validation: 8,
      information: 2,
      optimization: 1,
      project: 0.5
    },


    pets: {
      theory: 1.5,
      probability: 2,
      inference: 2,
      bayes: 1,
      linear: 2,
      glm: 3,
      ml: 7,
      clustering: 7,
      multivariate: 5,
      timeseries: 1,
      sampling: 1,
      simulation: 2,
      nonparametric: 2,
      spatial: 2,
      pointprocess: 1,
      validation: 5,
      information: 5,
      optimization: 2,
      project: 0.5
    }
  };


  /* =======================================================
     04.2 DETECTAR CONTEXTO
     ======================================================= */

  const getFormulaProfile =
    () => {

      const path =
        window.location.pathname
          .toLowerCase();


      if (
        path.includes(
          "incendios"
        )
      ) {
        return FORMULA_PROFILES.incendios;
      }


      if (
        path.includes(
          "nutricion"
        )
      ) {
        return FORMULA_PROFILES.nutricion;
      }


      if (
        path.includes(
          "pets"
        )
      ) {
        return FORMULA_PROFILES.pets;
      }


      if (
        path.includes(
          "sobre-mi"
        )
      ) {
        return FORMULA_PROFILES.about;
      }


      if (
        path.includes(
          "proyectos"
        )
      ) {
        return FORMULA_PROFILES.projects;
      }


      return FORMULA_PROFILES.home;
    };


  /* =======================================================
     04.3 SELECCIÓN PONDERADA SIN REPETICIÓN
     ======================================================= */

  const selectFormulas = (
    count
  ) => {

    const profile =
      getFormulaProfile();


    const available =
      [...FORMULAS];


    const selected =
      [];


    while (
      selected.length <
        count &&
      available.length
    ) {

      /*
       * Peso final =
       *
       * peso individual
       *
       * importancia de la categoría
       * para la página actual
       */

      const weights =
        available.map(
          (item) => {

            const categoryWeight =
              profile[
                item.category
              ] ??
              1;


            return Math.max(
              0.01,
              item.weight *
                categoryWeight
            );
          }
        );


      const totalWeight =
        weights.reduce(
          (
            accumulator,
            value
          ) =>
            accumulator +
            value,
          0
        );


      let cursor =
        Math.random() *
        totalWeight;


      let chosenIndex =
        0;


      for (
        let i = 0;
        i < available.length;
        i += 1
      ) {

        cursor -=
          weights[i];


        if (
          cursor <=
          0
        ) {

          chosenIndex =
            i;

          break;
        }
      }


      const [
        chosen
      ] =
        available.splice(
          chosenIndex,
          1
        );


      selected.push(
        chosen.latex
      );
    }


    return selected;
  };


  /* =======================================================
     05. ESTADO GLOBAL
     ======================================================= */

  const state = {

    items:
      [],

    rafId:
      null,

    lastTime:
      0,

    resizeTimer:
      null,

    heroMask:
      [],

    fontsRebuilt:
      false
  };


  /* =======================================================
     06. HELPERS
     ======================================================= */

  const random = (
    min,
    max
  ) =>
    min +
    Math.random() *
    (
      max - min
    );


  const clamp = (
    value,
    min,
    max
  ) =>
    Math.min(
      max,
      Math.max(
        min,
        value
      )
    );


  const shuffle = (
    array
  ) => {

    const clone =
      [...array];


    for (
      let i =
        clone.length - 1;

      i > 0;

      i -= 1
    ) {

      const j =
        Math.floor(
          Math.random() *
          (
            i + 1
          )
        );


      [
        clone[i],
        clone[j]
      ] =
      [
        clone[j],
        clone[i]
      ];
    }


    return clone;
  };


  /* =======================================================
     07. PALETA
     ======================================================= */

  const getColorClass = (
    index
  ) => {

    const palette = [

      "floating-formula--purple",

      "floating-formula--blue",

      "floating-formula--purple",

      "floating-formula--blue",

      "floating-formula--cream"
    ];


    return palette[
      index %
      palette.length
    ];
  };


  const getStrengthClass =
    () => {

      const roll =
        Math.random();


      if (
        roll <
        0.20
      ) {
        return "floating-formula--soft";
      }


      if (
        roll >
        0.80
      ) {
        return "floating-formula--strong";
      }


      return "";
    };


  /* =======================================================
     08. CANTIDADES
     ======================================================= */

  const getCount = (
    type
  ) => {

    if (
      type ===
      "hero"
    ) {

      if (
        mobileQuery.matches
      ) {
        return CONFIG.heroCount.mobile;
      }


      if (
        tabletQuery.matches
      ) {
        return CONFIG.heroCount.tablet;
      }


      return CONFIG.heroCount.desktop;
    }


    if (
      type ===
      "footer"
    ) {

      if (
        mobileQuery.matches
      ) {
        return CONFIG.footerCount.mobile;
      }


      if (
        tabletQuery.matches
      ) {
        return CONFIG.footerCount.tablet;
      }


      return CONFIG.footerCount.desktop;
    }


    if (
      mobileQuery.matches
    ) {
      return CONFIG.sectionCount.mobile;
    }


    if (
      tabletQuery.matches
    ) {
      return CONFIG.sectionCount.tablet;
    }


    return CONFIG.sectionCount.desktop;
  };


  /* =======================================================
     09. RENDER KATEX
     ======================================================= */

  const renderFormula = (
    latex,
    element
  ) => {

    /*
     * Guardamos el LaTeX original para debugging.
     */

    element.dataset.latex =
      latex.trim();


    try {

      window.katex.render(
        latex.trim(),
        element,
        CONFIG.katex
      );


      element.classList.add(
        "is-katex-rendered"
      );


    } catch (error) {

      /*
       * Fallback.
       *
       * Si una expresión concreta falla,
       * no rompemos todas las animaciones.
       */

      console.warn(
        "[Portfolio] KaTeX no pudo renderizar:",
        latex,
        error
      );


      element.textContent =
        latex
          .replace(
            /\\displaystyle/g,
            ""
          )
          .trim();
    }
  };


  /* =======================================================
     10. MÁSCARA DEL CEREBRO
     ======================================================= */

  const buildHeroMask = (
    layer
  ) => {

    const width =
      layer.clientWidth;


    const height =
      layer.clientHeight;


    const circles = [

      /* Superior */

      {
        x: 0.61,
        y: 0.39,
        r: 0.075
      },

      {
        x: 0.68,
        y: 0.31,
        r: 0.090
      },

      {
        x: 0.76,
        y: 0.27,
        r: 0.098
      },

      {
        x: 0.84,
        y: 0.28,
        r: 0.098
      },

      {
        x: 0.92,
        y: 0.35,
        r: 0.082
      },


      /* Media */

      {
        x: 0.57,
        y: 0.49,
        r: 0.095
      },

      {
        x: 0.66,
        y: 0.44,
        r: 0.115
      },

      {
        x: 0.75,
        y: 0.43,
        r: 0.128
      },

      {
        x: 0.84,
        y: 0.44,
        r: 0.122
      },

      {
        x: 0.93,
        y: 0.47,
        r: 0.100
      },


      /* Inferior */

      {
        x: 0.59,
        y: 0.61,
        r: 0.088
      },

      {
        x: 0.68,
        y: 0.59,
        r: 0.108
      },

      {
        x: 0.77,
        y: 0.60,
        r: 0.116
      },

      {
        x: 0.86,
        y: 0.59,
        r: 0.103
      },


      /* Base */

      {
        x: 0.67,
        y: 0.71,
        r: 0.080
      },

      {
        x: 0.76,
        y: 0.72,
        r: 0.083
      }
    ];


    const scale =
      Math.min(
        width,
        height
      );


    return circles.map(
      (circle) => ({

        x:
          circle.x *
          width,

        y:
          circle.y *
          height,

        r:
          circle.r *
          scale
      })
    );
  };


  /* =======================================================
     11. COLISIÓN CEREBRO
     ======================================================= */

  const collidesWithMask = (
    x,
    y,
    width,
    height,
    mask
  ) => {

    const centerX =
      x +
      width / 2;


    const centerY =
      y +
      height / 2;


    /*
     * Usamos la diagonal de la fórmula después de que
     * KaTeX haya calculado su tamaño real.
     *
     * Esto protege incluso:
     *
     * - fracciones
     * - sumatorias
     * - fórmulas largas
     */

    const safeRadius =
      Math.hypot(
        width / 2,
        height / 2
      ) +
      14;


    let strongestHit = {

      hit:
        false,

      nx:
        0,

      ny:
        0,

      push:
        0
    };


    for (
      const circle
      of mask
    ) {

      const dx =
        centerX -
        circle.x;


      const dy =
        centerY -
        circle.y;


      const distance =
        Math.sqrt(
          dx * dx +
          dy * dy
        );


      const limit =
        circle.r +
        safeRadius;


      if (
        distance <
        limit
      ) {

        const safeDistance =
          distance === 0
            ? 0.0001
            : distance;


        const push =
          limit -
          distance;


        if (
          !strongestHit.hit ||
          push >
            strongestHit.push
        ) {

          strongestHit = {

            hit:
              true,

            nx:
              dx /
              safeDistance,

            ny:
              dy /
              safeDistance,

            push
          };
        }
      }
    }


    return strongestHit;
  };


  /* =======================================================
     12. CAPA HOME
     ======================================================= */

  const ensureHeroLayer =
    () => {

      const hero =
        document.querySelector(
          ".hero"
        );


      if (!hero) {
        return null;
      }


      let layer =
        hero.querySelector(
          "#hero-formulas"
        );


      if (!layer) {

        layer =
          document.createElement(
            "div"
          );


        layer.id =
          "hero-formulas";


        layer.className =
          "hero__formulas";


        layer.setAttribute(
          "aria-hidden",
          "true"
        );


        hero.prepend(
          layer
        );
      }


      let guard =
        hero.querySelector(
          "#hero-brain-guard"
        );


      if (!guard) {

        guard =
          document.createElement(
            "div"
          );


        guard.id =
          "hero-brain-guard";


        guard.setAttribute(
          "aria-hidden",
          "true"
        );


        hero.appendChild(
          guard
        );
      }


      return layer;
    };


  /* =======================================================
     13. CAPAS INTERNAS
     ======================================================= */

  const ensureSurfaceLayer = (
    target,
    extraClass = ""
  ) => {

    target.classList.add(
      "formula-surface"
    );


    let layer =
      target.querySelector(
        ":scope > .floating-formulas"
      );


    if (layer) {
      layer.remove();
    }


    layer =
      document.createElement(
        "div"
      );


    layer.className =
      `
        floating-formulas
        ${extraClass}
      `.trim();


    layer.setAttribute(
      "aria-hidden",
      "true"
    );


    target.prepend(
      layer
    );


    /*
     * Protegemos el layout sin modificar
     * elementos absolute existentes.
     */

    Array
      .from(
        target.children
      )
      .forEach(
        (child) => {

          if (
            child ===
            layer
          ) {
            return;
          }


          child.classList.remove(
            "formula-content-static",
            "formula-content-positioned"
          );


          const position =
            window
              .getComputedStyle(
                child
              )
              .position;


          if (
            position ===
            "static"
          ) {

            child.classList.add(
              "formula-content-static"
            );

          } else {

            child.classList.add(
              "formula-content-positioned"
            );
          }
        }
      );


    return layer;
  };


  /* =======================================================
     14. POSICIÓN INICIAL
     ======================================================= */

  const getInitialPosition = ({
    layer,
    width,
    height,
    isHero
  }) => {

    const padding =
      12;


    const maxX =
      Math.max(
        padding,
        layer.clientWidth -
          width -
          padding
      );


    const maxY =
      Math.max(
        padding,
        layer.clientHeight -
          height -
          padding
      );


    for (
      let attempt = 0;

      attempt < 150;

      attempt += 1
    ) {

      const x =
        random(
          padding,
          maxX
        );


      const y =
        random(
          padding,
          maxY
        );


      if (!isHero) {

        return {
          x,
          y
        };
      }


      const collision =
        collidesWithMask(
          x,
          y,
          width,
          height,
          state.heroMask
        );


      if (
        !collision.hit
      ) {

        return {
          x,
          y
        };
      }
    }


    /*
     * Fallback seguro al extremo izquierdo.
     */

    return {

      x:
        padding,

      y:
        padding
    };
  };


  /* =======================================================
     15. CREAR FÓRMULA
     ======================================================= */

  const createItem = ({
    layer,
    latex,
    index,
    isHero = false
  }) => {

    const element =
      document.createElement(
        "span"
      );


    element.className =
      "floating-formula";


    element.classList.add(
      getColorClass(
        index
      )
    );


    const strength =
      getStrengthClass();


    if (strength) {

      element.classList.add(
        strength
      );
    }


    if (isHero) {

      element.classList.add(
        "floating-formula--hero"
      );
    }


    /* -----------------------------------------------------
       Tamaño
       ----------------------------------------------------- */

    const fontSize =
      isHero

        ? mobileQuery.matches

          ? random(
              0.78,
              0.96
            )

          : random(
              0.90,
              1.22
            )

        : mobileQuery.matches

          ? random(
              0.70,
              0.86
            )

          : random(
              0.78,
              1.05
            );


    element.style.fontSize =
      `${fontSize.toFixed(2)}rem`;


    /* -----------------------------------------------------
       Ángulo
       ----------------------------------------------------- */

    const angle =
      random(
        -3,
        3
      );


    element.style.setProperty(
      "--formula-angle",
      `${angle.toFixed(2)}deg`
    );


    /* -----------------------------------------------------
       Insertar primero
       ----------------------------------------------------- */

    layer.appendChild(
      element
    );


    /* -----------------------------------------------------
       RENDER KATEX
       ----------------------------------------------------- */

    renderFormula(
      latex,
      element
    );


    /*
     * KaTeX renderiza síncronamente.
     *
     * Por eso ahora podemos medir la fórmula completa
     * ya compuesta tipográficamente.
     */

    const rect =
      element.getBoundingClientRect();


    const width =
      Math.max(
        rect.width,
        element.offsetWidth,
        40
      );


    const height =
      Math.max(
        rect.height,
        element.offsetHeight,
        20
      );


    /* -----------------------------------------------------
       Posición inicial segura
       ----------------------------------------------------- */

    const initialPosition =
      getInitialPosition({

        layer,

        width,

        height,

        isHero
      });


    /* -----------------------------------------------------
       Física
       ----------------------------------------------------- */

    const speed =
      random(
        CONFIG.speed.min,
        CONFIG.speed.max
      );


    const direction =
      random(
        0,
        Math.PI * 2
      );


    const opacityBase =
      isHero

        ? random(
            0.18,
            0.31
          )

        : random(
            0.14,
            0.25
          );


    const pulse =
      random(
        CONFIG.opacityPulse.min,
        CONFIG.opacityPulse.max
      );


    return {

      el:
        element,

      layer,

      isHero,

      width,

      height,

      x:
        initialPosition.x,

      y:
        initialPosition.y,

      vx:
        Math.cos(
          direction
        ) *
        speed,

      vy:
        Math.sin(
          direction
        ) *
        speed,

      angle,

      opacityBase,

      pulse,

      phase:
        random(
          0,
          Math.PI * 2
        )
    };
  };


  /* =======================================================
     16. LIMPIAR ITEMS
     ======================================================= */

  const clearItems =
    () => {

      state.items
        .forEach(
          (item) => {

            item.el.remove();
          }
        );


      state.items =
        [];
    };


  /* =======================================================
     17. HOME
     ======================================================= */

  const buildHero =
    () => {

      const heroLayer =
        ensureHeroLayer();


      if (!heroLayer) {
        return;
      }


      heroLayer.replaceChildren();


      state.heroMask =
        buildHeroMask(
          heroLayer
        );


      const formulas = selectFormulas(getCount("hero"));


      formulas.forEach(
        (
          latex,
          index
        ) => {

          state.items.push(
            createItem({

              layer:
                heroLayer,

              latex,

              index,

              isHero:
                true
            })
          );
        }
      );
    };


  /* =======================================================
     18. SECCIONES
     ======================================================= */

  const buildSections =
    () => {

      const sections =
        document.querySelectorAll(
          "main section"
        );


      sections.forEach(
        (section) => {

          if (
            section.classList.contains(
              "hero"
            )
          ) {
            return;
          }


          if (
            section.hasAttribute(
              "data-no-formulas"
            )
          ) {
            return;
          }


          const layer =
            ensureSurfaceLayer(
              section
            );


          const formulas = selectFormulas(getCount("section"));


          formulas.forEach(
            (
              latex,
              index
            ) => {

              state.items.push(
                createItem({

                  layer,

                  latex,

                  index,

                  isHero:
                    false
                })
              );
            }
          );
        }
      );
    };


  /* =======================================================
     19. FOOTER
     ======================================================= */

  const buildFooter =
    () => {

      const footers =
        document.querySelectorAll(
          "footer"
        );


      footers.forEach(
        (footer) => {

          const layer =
            ensureSurfaceLayer(
              footer,
              "floating-formulas--footer"
            );


          const formulas = selectFormulas(getCount("footer"));


          formulas.forEach(
            (
              latex,
              index
            ) => {

              state.items.push(
                createItem({

                  layer,

                  latex,

                  index,

                  isHero:
                    false
                })
              );
            }
          );
        }
      );
    };


  /* =======================================================
     20. CONSTRUIR TODO
     ======================================================= */

  const buildAll =
    () => {

      clearItems();

      buildHero();

      buildSections();

      buildFooter();


      console.info(
        `[Portfolio] KaTeX activo — ${
          state.items.length
        } fórmulas renderizadas`
      );
    };


  /* =======================================================
     21. ACTUALIZACIÓN FÍSICA
     ======================================================= */

  const updateItem = (
    item,
    dt,
    time
  ) => {

    const padding =
      8;


    const minX =
      padding;


    const minY =
      padding;


    const maxX =
      Math.max(
        minX,
        item.layer.clientWidth -
          item.width -
          padding
      );


    const maxY =
      Math.max(
        minY,
        item.layer.clientHeight -
          item.height -
          padding
      );


    let nextX =
      item.x +
      item.vx *
      dt;


    let nextY =
      item.y +
      item.vy *
      dt;


    /* -----------------------------------------------------
       Rebote bordes
       ----------------------------------------------------- */

    if (
      nextX <=
      minX
    ) {

      nextX =
        minX;


      item.vx =
        Math.abs(
          item.vx
        );
    }


    if (
      nextX >=
      maxX
    ) {

      nextX =
        maxX;


      item.vx =
        -Math.abs(
          item.vx
        );
    }


    if (
      nextY <=
      minY
    ) {

      nextY =
        minY;


      item.vy =
        Math.abs(
          item.vy
        );
    }


    if (
      nextY >=
      maxY
    ) {

      nextY =
        maxY;


      item.vy =
        -Math.abs(
          item.vy
        );
    }


    /* -----------------------------------------------------
       Rebote cerebro
       ----------------------------------------------------- */

    if (
      item.isHero &&
      state.heroMask.length
    ) {

      for (
        let pass = 0;

        pass < 6;

        pass += 1
      ) {

        const collision =
          collidesWithMask(
            nextX,
            nextY,
            item.width,
            item.height,
            state.heroMask
          );


        if (
          !collision.hit
        ) {
          break;
        }


        const dot =
          item.vx *
            collision.nx +
          item.vy *
            collision.ny;


        item.vx =
          item.vx -
          2 *
            dot *
            collision.nx;


        item.vy =
          item.vy -
          2 *
            dot *
            collision.ny;


        nextX +=
          collision.nx *
          (
            collision.push +
            8
          );


        nextY +=
          collision.ny *
          (
            collision.push +
            8
          );
      }
    }


    item.x =
      clamp(
        nextX,
        minX,
        maxX
      );


    item.y =
      clamp(
        nextY,
        minY,
        maxY
      );


    /* -----------------------------------------------------
       DARK / LIGHT
       ----------------------------------------------------- */

    const isLightTheme =
      document
        .documentElement
        .dataset
        .theme ===
      "light";


    const themeBoost =
      isLightTheme
        ? 0.10
        : 0;


    const opacity =
      item.opacityBase +
      themeBoost +
      Math.sin(
        time *
          0.001 +
        item.phase
      ) *
      item.pulse;


    item.el.style.opacity =
      String(
        clamp(

          opacity,

          isLightTheme
            ? 0.18
            : 0.08,

          isLightTheme
            ? 0.56
            : 0.48
        )
      );


    /* -----------------------------------------------------
       Posición
       ----------------------------------------------------- */

    item.el.style.transform =
      `
        translate3d(
          ${item.x.toFixed(2)}px,
          ${item.y.toFixed(2)}px,
          0
        )

        rotate(
          ${item.angle.toFixed(2)}deg
        )
      `;
  };


  /* =======================================================
     22. LOOP CONTINUO
     ======================================================= */

  const animate = (
    time
  ) => {

    if (
      reducedMotion.matches
    ) {
      return;
    }


    if (
      !state.lastTime
    ) {

      state.lastTime =
        time;
    }


    const dt =
      Math.min(
        (
          time -
          state.lastTime
        ) /
        1000,

        0.03
      );


    state.lastTime =
      time;


    state.items.forEach(
      (item) => {

        updateItem(
          item,
          dt,
          time
        );
      }
    );


    state.rafId =
      window.requestAnimationFrame(
        animate
      );
  };


  /* =======================================================
     23. START / STOP
     ======================================================= */

  const startAnimation =
    () => {

      window.cancelAnimationFrame(
        state.rafId
      );


      state.lastTime =
        0;


      if (
        !reducedMotion.matches
      ) {

        state.rafId =
          window.requestAnimationFrame(
            animate
          );
      }
    };


  const stopAnimation =
    () => {

      window.cancelAnimationFrame(
        state.rafId
      );


      state.rafId =
        null;


      state.lastTime =
        0;
    };


  /* =======================================================
     24. REBUILD
     ======================================================= */

  const rebuild =
    () => {

      stopAnimation();

      buildAll();

      startAnimation();
    };


  let resizeTimer =
    null;


  const handleResize =
    () => {

      window.clearTimeout(
        resizeTimer
      );


      resizeTimer =
        window.setTimeout(
          rebuild,
          240
        );
    };


  /* =======================================================
     25. INIT
     ======================================================= */

  const init =
    () => {

      buildAll();

      startAnimation();


      window.addEventListener(
        "resize",
        handleResize,
        {
          passive: true
        }
      );


      if (
        typeof reducedMotion
          .addEventListener ===
        "function"
      ) {

        reducedMotion.addEventListener(
          "change",
          rebuild
        );

      } else {

        reducedMotion.addListener(
          rebuild
        );
      }


      /*
       * Cuando terminan de cargar las fuentes de KaTeX,
       * reconstruimos una sola vez.
       *
       * Así width/height y colisiones quedan calculadas
       * usando la fuente matemática definitiva.
       */

      if (
        document.fonts &&
        document.fonts.ready
      ) {

        document.fonts.ready
          .then(
            () => {

              if (
                state.fontsRebuilt
              ) {
                return;
              }


              state.fontsRebuilt =
                true;


              rebuild();
            }
          )
          .catch(
            () => {
              /* Sin acción */
            }
          );
      }
    };


  /* =======================================================
     26. ESPERAR KATEX
     ======================================================= */

  const waitForKaTeX = (
    attempt = 0
  ) => {

    if (
      window.katex &&
      typeof window.katex.render ===
        "function"
    ) {

      init();

      return;
    }


    /*
     * 120 intentos x 50 ms = 6 segundos.
     */

    if (
      attempt >
      120
    ) {

      console.error(
        "[Portfolio] KaTeX no pudo cargarse."
      );

      return;
    }


    window.setTimeout(
      () => {

        waitForKaTeX(
          attempt + 1
        );

      },
      50
    );
  };


  /* =======================================================
     27. START
     ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      () => {

        waitForKaTeX();

      },
      {
        once: true
      }
    );

  } else {

    waitForKaTeX();
  }


  /* =======================================================
     28. CLEANUP
     ======================================================= */

  window.addEventListener(
    "pagehide",
    () => {

      stopAnimation();


      window.clearTimeout(
        resizeTimer
      );

    },
    {
      once: true
    }
  );

})();