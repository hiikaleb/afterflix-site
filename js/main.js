/* Afterflix — comportamento refinado */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* header: sólido ao rolar (ou sempre na página de contato) */
  const header = $("#header");
  const isContactPage = Boolean($("#contato-page"));
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("solid", isContactPage || scrollY > 80);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* barra de navegação flutuante com pílula deslizante (glider) + scroll spy */
  const burger = $(".burger");
  const nav = $("#nav");
  const glider = $(".nav-pill-glider", nav || document);
  const navLinks = nav ? $$("a", nav) : [];

  const moveGlider = target => {
    if (!nav || !glider || !target || getComputedStyle(glider).display === "none") return;
    nav.classList.add("has-glider");
    glider.style.width = `${target.offsetWidth}px`;
    glider.style.transform = `translateX(${target.offsetLeft}px)`;
    glider.style.opacity = "1";
  };

  const syncGliderToActive = () => {
    const active = $(".nav-pill a.is-active") || navLinks[0];
    if (active) moveGlider(active);
  };

  if (nav && navLinks.length) {
    navLinks.forEach(link => {
      link.addEventListener("mouseenter", () => moveGlider(link));
      link.addEventListener("focus", () => moveGlider(link));
    });
    nav.addEventListener("mouseleave", syncGliderToActive);
    addEventListener("resize", syncGliderToActive);
    document.fonts?.ready.then(syncGliderToActive);
    requestAnimationFrame(syncGliderToActive);
  }

  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", e => {
      const link = e.target.closest("a");
      if (!link) return;
      nav.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      if (link.getAttribute("href")?.startsWith("#")) {
        navLinks.forEach(a => a.classList.remove("is-active"));
        link.classList.add("is-active");
        moveGlider(link);
      }
    });
  }

  if (!isContactPage && navLinks.length) {
    const spyLinks = navLinks.filter(a => a.getAttribute("href")?.startsWith("#") && !a.dataset.noSpy);
    const spySections = spyLinks
      .map(a => ({ link: a, el: $(a.getAttribute("href")) }))
      .filter(item => item.el);

    const updateSpy = () => {
      const marker = scrollY + 180;
      let current = spySections[0];
      for (const item of spySections) {
        if (item.el.offsetTop <= marker) current = item;
      }
      if (current && !current.link.classList.contains("is-active")) {
        navLinks.forEach(a => a.classList.remove("is-active"));
        current.link.classList.add("is-active");
        if (!nav.matches(":hover")) moveGlider(current.link);
      }
    };
    addEventListener("scroll", updateSpy, { passive: true });
  }

  /* lupinha expansível inline na barra superior */
  const searchWrap = $("#search-wrap");
  const searchTrigger = $("#search-trigger");
  const searchInput = $("#search-inline-input");
  const searchClear = $("#search-clear");
  const searchDropdown = $("#search-dropdown");
  const searchResults = $("#search-results");
  const searchChips = $("#search-chips");

  if (searchWrap && searchTrigger && searchInput && searchDropdown && searchResults) {
    const lessonItems = $$(".card a").map(link => {
      const img = $("img", link);
      const label = link.getAttribute("aria-label") || img?.alt || "Aula";
      const thumb = img?.getAttribute("src") || "";
      const cat = link.closest(".cat")?.querySelector(".cat-title")?.textContent
        || (link.closest(".hero-row") ? "Mais desejados" : "Destaque");
      return { label, cat, thumb, el: link };
    });

    const syncChips = q => {
      if (!searchChips) return;
      const norm = q.trim().toLowerCase();
      $$("button", searchChips).forEach(chip => {
        chip.classList.toggle("is-picked", norm !== "" && chip.dataset.query?.toLowerCase() === norm);
      });
    };

    const renderSearchResults = q => {
      const term = q.trim().toLowerCase();
      syncChips(q);
      const matches = (term
        ? lessonItems.filter(item => item.label.toLowerCase().includes(term) || item.cat.toLowerCase().includes(term))
        : lessonItems
      ).slice(0, 7);

      searchResults.innerHTML = "";
      if (!matches.length) {
        const li = document.createElement("li");
        li.className = "af-empty";
        li.textContent = "Nenhuma aula encontrada.";
        searchResults.appendChild(li);
        return;
      }

      matches.forEach(item => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";

        const main = document.createElement("div");
        main.className = "af-res-main";
        if (item.thumb) {
          const img = document.createElement("img");
          img.className = "af-res-thumb";
          img.src = item.thumb;
          img.alt = "";
          img.loading = "lazy";
          main.appendChild(img);
        }
        const nameSpan = document.createElement("span");
        nameSpan.textContent = item.label;
        main.appendChild(nameSpan);

        const catSmall = document.createElement("small");
        catSmall.textContent = item.cat;

        btn.append(main, catSmall);
        btn.addEventListener("click", () => {
          closeSearch();
          item.el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center", inline: "center" });
          item.el.focus({ preventScroll: true });
        });
        li.appendChild(btn);
        searchResults.appendChild(li);
      });
    };

    const openSearch = () => {
      searchWrap.classList.add("is-open");
      searchTrigger.setAttribute("aria-expanded", "true");
      if (searchClear) searchClear.tabIndex = 0;
      renderSearchResults(searchInput.value);
      searchDropdown.hidden = false;
      setTimeout(() => searchInput.focus(), 110);
    };

    const closeSearch = () => {
      searchWrap.classList.remove("is-open");
      searchTrigger.setAttribute("aria-expanded", "false");
      if (searchClear) searchClear.tabIndex = -1;
      searchDropdown.hidden = true;
      searchInput.blur();
    };

    searchTrigger.addEventListener("click", () => {
      if (searchWrap.classList.contains("is-open")) {
        searchInput.focus();
        searchDropdown.hidden = false;
      } else {
        openSearch();
      }
    });

    searchChips?.addEventListener("click", e => {
      const chip = e.target.closest("button[data-query]");
      if (!chip) return;
      searchInput.value = chip.dataset.query;
      renderSearchResults(searchInput.value);
      searchInput.focus();
    });

    searchInput.addEventListener("input", () => {
      renderSearchResults(searchInput.value);
      searchDropdown.hidden = false;
    });

    searchInput.addEventListener("focus", () => {
      if (searchWrap.classList.contains("is-open")) {
        renderSearchResults(searchInput.value);
        searchDropdown.hidden = false;
      }
    });

    searchInput.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        const firstBtn = $("button", searchResults);
        if (firstBtn) {
          e.preventDefault();
          firstBtn.click();
        }
      }
    });

    searchClear?.addEventListener("click", () => {
      if (searchInput.value) {
        searchInput.value = "";
        renderSearchResults("");
        searchInput.focus();
      } else {
        closeSearch();
      }
    });

    document.addEventListener("click", e => {
      if (!searchWrap.contains(e.target) && searchWrap.classList.contains("is-open")) {
        closeSearch();
      }
    });

    addEventListener("keydown", e => {
      if (e.key === "Escape" && searchWrap.classList.contains("is-open")) {
        closeSearch();
      }
    });
  }

  /* vídeo do hero: só aparece quando começa a tocar */
  const heroVideo = $(".hero-bg video");
  if (heroVideo) {
    heroVideo.addEventListener("playing", () => heroVideo.classList.add("on"), { once: true });
  }

  /* carrossel do hero: Do Prompt ao Frame <-> Edições Hypadas */
  const heroSlides = $$(".hero-slide");
  const heroTabs = $$(".hero-tab");
  const heroStage = $(".hero-stage");
  if (heroSlides.length && heroTabs.length) {
    let activeSlide = 0;
    let timer = null;

    const restartTabBar = tab => {
      const bar = $(".tab-bar", tab);
      if (!bar) return;
      bar.style.animation = "none";
      void bar.offsetWidth;
      bar.style.animation = "";
    };

    const setHeroSlide = index => {
      activeSlide = Number(index);
      heroSlides.forEach(slide => {
        const match = Number(slide.dataset.slide) === activeSlide;
        slide.classList.toggle("is-active", match);
        slide.setAttribute("aria-hidden", String(!match));
      });
      heroTabs.forEach(tab => {
        const match = Number(tab.dataset.target) === activeSlide;
        tab.classList.toggle("is-active", match);
        tab.setAttribute("aria-selected", String(match));
        if (match) restartTabBar(tab);
      });
      if (heroVideo) {
        if (activeSlide === 1 && !reduceMotion) {
          heroVideo.play().catch(() => {});
        } else {
          heroVideo.pause();
        }
      }
    };

    const startAutoPlay = () => {
      if (reduceMotion) return;
      clearInterval(timer);
      timer = setInterval(() => {
        setHeroSlide(activeSlide === 0 ? 1 : 0);
      }, 7000);
    };

    heroTabs.forEach((tab, idx) => {
      tab.addEventListener("click", () => {
        setHeroSlide(tab.dataset.target);
        startAutoPlay();
      });
      tab.addEventListener("keydown", e => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          const nextTab = heroTabs[(idx + 1) % heroTabs.length];
          nextTab.focus();
          nextTab.click();
        }
      });
    });

    if (heroStage) {
      heroStage.addEventListener("mouseenter", () => clearInterval(timer));
      heroStage.addEventListener("mouseleave", startAutoPlay);
    }

    setHeroSlide(0);
    startAutoPlay();
  }

  /* modais (plugins, login, preview de aula) */
  const openModal = modal => {
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  };
  const closeModal = modal => {
    if (!modal) return;
    modal.hidden = true;
    if ($$(".af-modal").every(m => m.hidden)) {
      document.body.style.overflow = "";
    }
  };

  $$(".af-modal").forEach(modal => {
    modal.addEventListener("click", e => {
      if (e.target === modal || e.target.closest("[data-close-modal]")) {
        closeModal(modal);
      }
    });
  });

  addEventListener("keydown", e => {
    if (e.key === "Escape") {
      $$(".af-modal").forEach(m => { if (!m.hidden) closeModal(m); });
    }
  });

  /* preview de aula ao clicar nos cards */
  const lessonModal = $("#lesson-modal");
  const lessonTitle = $("#lesson-modal-title");
  const lessonCat = $("#lesson-modal-cat");
  const lessonImg = $("#lesson-modal-img");
  const lessonDesc = $("#lesson-modal-desc");

  /* carrosséis horizontais: setas + arrastar com o mouse + clique abre preview */
  $$(".row").forEach(row => {
    const track = $(".track", row);
    if (!track) return;
    const step = () => track.clientWidth * 0.8;
    $(".prev", row)?.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    $(".next", row)?.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));

    let down = false, startX = 0, startL = 0, moved = 0;
    track.addEventListener("pointerdown", e => {
      if (e.pointerType !== "mouse") return;
      down = true; moved = 0; startX = e.clientX; startL = track.scrollLeft;
    });
    addEventListener("pointermove", e => {
      if (!down) return;
      moved = e.clientX - startX;
      if (Math.abs(moved) > 5) track.classList.add("drag");
      track.scrollLeft = startL - moved;
    });
    addEventListener("pointerup", () => { down = false; setTimeout(() => track.classList.remove("drag"), 0); });
    track.addEventListener("click", e => {
      const cardLink = e.target.closest(".card a");
      if (!cardLink) return;
      e.preventDefault();
      if (Math.abs(moved) > 5) return;
      if (!lessonModal) return;
      const img = $("img", cardLink);
      const title = cardLink.getAttribute("aria-label") || img?.alt || "Aula Afterflix";
      const cat = cardLink.closest(".cat")?.querySelector(".cat-title")?.textContent
        || (cardLink.closest(".hero-row") ? "Mais desejados" : "Destaque Afterflix");
      if (lessonTitle) lessonTitle.textContent = title;
      if (lessonCat) lessonCat.textContent = cat;
      if (lessonImg && img) {
        lessonImg.src = img.getAttribute("src") || "";
        lessonImg.alt = title;
      }
      if (lessonDesc) {
        lessonDesc.textContent = `Aula "${title}" no módulo ${cat}. Aprenda passo a passo no After Effects com arquivos de projeto e presets inclusos.`;
      }
      openModal(lessonModal);
    });
  });

  /* depoimentos */
  const slides = $$(".slide"), dots = $$(".dots i");
  if (slides.length) {
    let cur = 0;
    const show = i => {
      cur = (i + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle("on", k === cur));
      dots.forEach((d, k) => d.classList.toggle("on", k === cur));
    };
    $(".sl-btn.prev")?.addEventListener("click", () => show(cur - 1));
    $(".sl-btn.next")?.addEventListener("click", () => show(cur + 1));
  }

  /* modal plugins */
  const pluginsModal = $("#plugins-modal");
  $("#open-plugins-modal")?.addEventListener("click", () => openModal(pluginsModal));

  /* modal login + links de planos/rodapé sem salto vazio */
  const loginModal = $("#login-modal");
  const loginForm = $("#login-form");
  const loginMsg = $("#login-msg");
  $$(".login-trigger").forEach(btn => {
    btn.addEventListener("click", () => {
      if (loginMsg) loginMsg.hidden = true;
      openModal(loginModal);
      setTimeout(() => $("input", loginModal)?.focus(), 40);
    });
  });
  loginForm?.addEventListener("submit", e => {
    e.preventDefault();
    if (loginMsg) {
      loginMsg.textContent = "Acesso exclusivo para assinantes ativos. Caso ainda não tenha assinatura, clique em 'Escolha seu plano' abaixo.";
      loginMsg.hidden = false;
    }
  });

  $("#planos .btn")?.addEventListener("click", e => {
    e.preventDefault();
    openModal(pluginsModal);
  });

  $$(".f-legal a").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      if (loginMsg) {
        loginMsg.textContent = `${link.textContent}: disponível na central de suporte via WhatsApp (21) 99603-0654.`;
        loginMsg.hidden = false;
      }
      openModal(loginModal);
    });
  });

  /* revelação suave de seções ao rolar */
  const revealTargets = $$(".beneficios, .pack-grid, .bar, .planos-in, .cat, .depoimentos");
  if (revealTargets.length && "IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });

    revealTargets.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < innerHeight * 0.92) {
        el.classList.add("is-visible");
      } else {
        el.classList.add("af-reveal");
        observer.observe(el);
      }
    });
  }
})();
